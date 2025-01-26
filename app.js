/***************************************************
 * 全局数据 & 变量
 ***************************************************/
let children = [];        // { name: string, avatar: string(Base64或URL), startTime?: number }
let timers = {};          // { [name: string]: number } => 每个孩子的累计秒数
let activeChild = null;   // 当前在计时的孩子
let intervalId = null;    // 用于 setInterval 的句柄

window.addEventListener('load', () => {
  // 1. 尝试从 localStorage 加载旧数据
  loadDataFromStorage();
  // 2. 渲染登录表单页面
  renderLoginPage();

  // 3. 绑定各类按钮事件（根据你的HTML结构）
  document.getElementById('add-child-button').addEventListener('click', addChildForm);
  document.getElementById('start-timer-button').addEventListener('click', nextPage);
  document.getElementById('back-to-login').addEventListener('click', backToLogin);
  
  // 如果你有“清零”按钮，可在此处绑定事件
  // document.getElementById('clear-data-btn').addEventListener('click', clearAllData);
});

/***************************************************
 * 工具函数: 读取文件为Base64
 ***************************************************/
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = err => reject(err);
    reader.readAsDataURL(file);
  });
}

/***************************************************
 * 登录页面: 添加一个表单
 ***************************************************/
function addChildForm() {
  const container = document.getElementById('children-list');

  const childEntry = document.createElement('div');
  childEntry.className = 'child-entry';

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.placeholder = '孩子的姓名';
  childEntry.appendChild(nameInput);

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  childEntry.appendChild(fileInput);

  const urlInput = document.createElement('input');
  urlInput.type = 'text';
  urlInput.placeholder = '或输入头像URL';
  childEntry.appendChild(urlInput);

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = '删除';
  deleteBtn.onclick = () => childEntry.remove();
  childEntry.appendChild(deleteBtn);

  container.appendChild(childEntry);
}

/***************************************************
 * 登录页 => 计时器页 (合并新孩子 & 保留旧数据)
 ***************************************************/
function nextPage() {
  // 1. 先从 localStorage 中加载旧数据，确保我们保留之前的孩子与计时
  loadDataFromStorage();

  // 2. 读取本次输入的孩子
  const childEntries = document.querySelectorAll('#children-list .child-entry');
  const readPromises = [];

  childEntries.forEach(entry => {
    const [nameInput, fileInput, urlInput] = entry.querySelectorAll('input');
    const name = nameInput.value.trim();
    if (!name) return; // 如果没填姓名就跳过

    // 避免重名冲突：若已存在同名孩子，可提示或忽略
    const existingChild = children.find(c => c.name === name);
    if (existingChild) {
      console.log(`已存在同名孩子: ${name}，本次不重复添加`);
      return;
    }

    const avatarFile = fileInput.files[0];
    const avatarUrl = urlInput.value.trim();

    // 如果用户上传了文件 => 转Base64
    if (avatarFile) {
      const p = readFileAsDataURL(avatarFile).then(base64 => {
        children.push({ name, avatar: base64 });
        timers[name] = 0; // 新孩子计时从0开始
      });
      readPromises.push(p);
    } else if (avatarUrl) {
      // 如果没上传文件，但填写了URL
      children.push({ name, avatar: avatarUrl });
      timers[name] = 0;
    } else {
      // 默认头像
      children.push({ name, avatar: 'https://via.placeholder.com/90?text=No+Image' });
      timers[name] = 0;
    }
  });

  // 3. 等待所有文件读取完
  Promise.all(readPromises).then(() => {
    // 如果最终没有任何孩子，提示
    if (children.length === 0) {
      alert('请至少添加一个孩子信息');
      return;
    }

    // 4. 保存合并后的数据
    saveDataToStorage();

    // 5. 切换界面
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('timer-page').style.display = 'block';

    loadChildrenIntoTimerPage();
  });
}

/***************************************************
 * 渲染登录页面表单 (当返回登录页 or 初次载入)
 ***************************************************/
function renderLoginPage() {
  const container = document.getElementById('children-list');
  container.innerHTML = '';

  // 如果已有保存的孩子，就显示他们(可编辑)
  if (children.length === 0) {
    // 若没数据，就默认添加一个空表单
    addChildForm();
  } else {
    children.forEach(child => {
      const childEntry = document.createElement('div');
      childEntry.className = 'child-entry';

      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.value = child.name;
      childEntry.appendChild(nameInput);

      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      childEntry.appendChild(fileInput);

      const urlInput = document.createElement('input');
      urlInput.type = 'text';
      urlInput.placeholder = '或输入头像URL';
      // 只有非 data: 协议的才回显
      if (!child.avatar.startsWith('data:')) {
        urlInput.value = child.avatar;
      }
      childEntry.appendChild(urlInput);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = '删除';
      deleteBtn.onclick = () => childEntry.remove();
      childEntry.appendChild(deleteBtn);

      container.appendChild(childEntry);
    });
  }
}

/***************************************************
 * 返回登录页 (如需清零功能，也可在这调用)
 ***************************************************/
function backToLogin() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  activeChild = null;

  document.getElementById('timer-page').style.display = 'none';
  document.getElementById('login-page').style.display = 'block';

  renderLoginPage();
}

/***************************************************
 * 加载孩子头像到计时器页面
 ***************************************************/
function loadChildrenIntoTimerPage() {
  const container = document.getElementById('avatars-container');
  container.innerHTML = '';

  children.forEach(child => {
    // 这里视你的HTML结构而定，此示例用“avatar-card + crown”
    const cardDiv = document.createElement('div');
    cardDiv.className = 'avatar-card';
    cardDiv.onclick = () => startTimer(child);

    // 圆形头像
    const circleDiv = document.createElement('div');
    circleDiv.className = 'avatar-circle';
    const img = document.createElement('img');
    img.src = child.avatar;
    circleDiv.appendChild(img);

    // 孩子名字
    const nameLabel = document.createElement('div');
    nameLabel.className = 'card-name';
    nameLabel.textContent = child.name;

    // 冠冕 (默认隐藏)
    const crownDiv = document.createElement('div');
    crownDiv.className = 'crown';
    const crownImg = document.createElement('img');
    crownImg.src = 'icon.png';
    crownDiv.appendChild(crownImg);

    // 组装
    cardDiv.appendChild(circleDiv);
    cardDiv.appendChild(nameLabel);
    cardDiv.appendChild(crownDiv);

    container.appendChild(cardDiv);
  });

  updateSummaryList();
}

/***************************************************
 * 点击头像 => 切换计时
 ***************************************************/
function startTimer(child) {
  // 若点击同一个人，忽略
  if (activeChild && activeChild.name === child.name) return;

  // 先结算之前激活的人
  if (activeChild) {
    timers[activeChild.name] += Math.floor((Date.now() - activeChild.startTime) / 1000);
  }

  // 设置新激活的人
  activeChild = child;
  activeChild.startTime = Date.now();

  updateCrownDisplay();

  // 重启计时器
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(() => {
    const elapsed = Math.floor((Date.now() - activeChild.startTime) / 1000);
    document.getElementById('current-timer').textContent =
      `当前计时: ${elapsed + timers[activeChild.name]}秒`;
  }, 1000);

  saveDataToStorage();
}

/***************************************************
 * 显示/隐藏皇冠
 ***************************************************/
function updateCrownDisplay() {
  const container = document.getElementById('avatars-container');
  const cards = container.querySelectorAll('.avatar-card');

  cards.forEach((card, index) => {
    const child = children[index];
    const crown = card.querySelector('.crown');
    if (activeChild && child.name === activeChild.name) {
      crown.style.display = 'block';
    } else {
      crown.style.display = 'none';
    }
  });

  updateSummaryList();
}

/***************************************************
 * 更新所有孩子的总时长 (含“自定义”按钮)
 ***************************************************/
function updateSummaryList() {
  const summaryContainer = document.getElementById('summary-list');
  summaryContainer.innerHTML = '';

  children.forEach(child => {
    // 计算总时长(若是activeChild，还要加上本次的elapsed)
    let totalTime = timers[child.name] || 0;
    if (activeChild && child.name === activeChild.name) {
      const elapsed = Math.floor((Date.now() - activeChild.startTime) / 1000);
      totalTime += elapsed;
    }

    // 每个孩子一行
    const row = document.createElement('div');
    row.textContent = `${child.name}: ${totalTime} 秒`;

    // 在这里添加“自定义”按钮
    const customBtn = document.createElement('button');
    customBtn.style.marginLeft = '10px';
    customBtn.textContent = '自定义';
    customBtn.addEventListener('click', () => {
      const newTimeStr = prompt(`请输入新的秒数（当前：${totalTime}）`);
      if (newTimeStr !== null) {
        let newTime = parseInt(newTimeStr, 10);
        if (isNaN(newTime) || newTime < 0) {
          alert('输入无效');
          return;
        }

        // 若这个孩子是正在计时的孩子，需先结算旧时间
        if (activeChild && child.name === activeChild.name) {
          timers[child.name] += Math.floor((Date.now() - activeChild.startTime) / 1000);
          activeChild.startTime = Date.now(); // 重置开始时间
        }

        // 设置新的秒数
        timers[child.name] = newTime;

        // 保存更新
        saveDataToStorage();
        // 重新刷新
        updateSummaryList();

        // 若当前是此孩子在计时，也更新当前计时显示
        if (activeChild && child.name === activeChild.name) {
          document.getElementById('current-timer').textContent = `当前计时: ${newTime}秒`;
        }
      }
    });

    row.appendChild(customBtn);
    summaryContainer.appendChild(row);
  });
}

/***************************************************
 * 本地存储
 ***************************************************/
function saveDataToStorage() {
  const data = {
    children,
    timers,
    activeChildName: activeChild ? activeChild.name : null,
    activeStartTime: activeChild ? activeChild.startTime : null
  };
  localStorage.setItem('crownTimerData', JSON.stringify(data));
}

function loadDataFromStorage() {
  const raw = localStorage.getItem('crownTimerData');
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    children = data.children || [];
    timers = data.timers || {};
    if (data.activeChildName) {
      const found = children.find(c => c.name === data.activeChildName);
      if (found) {
        activeChild = found;
        activeChild.startTime = data.activeStartTime;
      }
    }
  } catch (e) {
    console.error('读取存储失败:', e);
  }
}

/***************************************************
 * (可选) 清零功能 
 ***************************************************/
// 如果需要全局清零(移除所有孩子和时间):
/*
function clearAllData() {
  if (intervalId) clearInterval(intervalId);
  intervalId = null;
  activeChild = null;

  children = [];
  timers = {};
  localStorage.removeItem('crownTimerData');

  // 回到登录页面
  document.getElementById('timer-page').style.display = 'none';
  document.getElementById('login-page').style.display = 'block';
  renderLoginPage();
}
*/
