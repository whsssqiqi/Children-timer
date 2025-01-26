/***************************************************
 * 全局变量
 ***************************************************/
let children = [];        // [{ name, avatar, startTime? }, ...]
let timers = {};          // { [name:string]: number } => 累计秒数
let activeChild = null;   // 当前在计时的孩子
let intervalId = null;    // setInterval 句柄

window.addEventListener('load', () => {
  // 加载旧数据
  loadDataFromStorage();
  // 渲染登录表单
  renderLoginPage();

  // 绑定事件
  document.getElementById('add-child-button').addEventListener('click', addChildForm);
  document.getElementById('start-timer-button').addEventListener('click', nextPage);
  document.getElementById('back-to-login').addEventListener('click', backToLogin);
  document.getElementById('clear-data-btn').addEventListener('click', clearAllData);
});

/***************************************************
 * 工具函数：File -> Base64
 ***************************************************/
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/***************************************************
 * 登录页面：添加一个孩子表单
 ***************************************************/
function addChildForm() {
  const container = document.getElementById('children-list');

  const childEntry = document.createElement('div');
  childEntry.className = 'child-entry';

  // 1) 姓名
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.placeholder = '孩子的姓名';
  childEntry.appendChild(nameInput);

  // 2) 文件上传
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  childEntry.appendChild(fileInput);

  // 3) 头像URL
  const urlInput = document.createElement('input');
  urlInput.type = 'text';
  urlInput.placeholder = '或输入头像URL';
  childEntry.appendChild(urlInput);

  // 4) 删除按钮
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = '删除';
  deleteBtn.onclick = () => childEntry.remove();
  childEntry.appendChild(deleteBtn);

  container.appendChild(childEntry);
}

/***************************************************
 * 点击“开始计时” => 从表单合并数据 & 切换到计时器页面
 ***************************************************/
function nextPage() {
  // 先加载旧数据(确保保留之前的孩子和时间)
  loadDataFromStorage();

  const childEntries = document.querySelectorAll('#children-list .child-entry');
  const readPromises = [];
  // 用来临时记录本次输入的名字 => 如果不在其中，说明是要删除旧人
  const newNames = [];

  childEntries.forEach((entry) => {
    const [nameInput, fileInput, urlInput] = entry.querySelectorAll('input');
    const name = nameInput.value.trim();
    if (!name) return; // 如果姓名没填，跳过

    newNames.push(name);

    // 检查是否已存在(同名) => 如果存在则只改头像，不改计时
    let existingChild = children.find((c) => c.name === name);

    // 读取头像
    const avatarFile = fileInput.files[0];
    const avatarUrl = urlInput.value.trim();

    if (avatarFile) {
      // 上传文件 => 转Base64
      const p = readFileAsDataURL(avatarFile).then((base64) => {
        if (existingChild) {
          existingChild.avatar = base64; // 覆盖头像
        } else {
          // 新建
          children.push({ name, avatar: base64 });
          timers[name] = 0;
        }
      });
      readPromises.push(p);
    } else if (avatarUrl) {
      // 如果有URL
      if (existingChild) {
        existingChild.avatar = avatarUrl;
      } else {
        children.push({ name, avatar: avatarUrl });
        timers[name] = 0;
      }
    } else {
      // 没上传 & 没URL => 占位图
      if (!existingChild) {
        children.push({
          name,
          avatar: "https://via.placeholder.com/90?text=No+Image",
        });
        timers[name] = 0;
      }
    }
  });

  // 同时，要删除那些已经在 children 里，但是本次表单里没出现的名字 => 说明用户从表单上删除了
  // 例如 旧 children = [Alice, Bob], 新Names = [Alice], 则 Bob 被删除
  children = children.filter((c) => newNames.includes(c.name));
  // 计时器也同步删除
  Object.keys(timers).forEach((key) => {
    if (!newNames.includes(key)) {
      delete timers[key];
    }
  });

  // 等待文件读取结束
  Promise.all(readPromises).then(() => {
    if (children.length === 0) {
      alert("请至少添加一个有效的孩子信息");
      return;
    }
    // 保存合并结果
    saveDataToStorage();

    // 切换界面
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('timer-page').style.display = 'block';

    loadChildrenIntoTimerPage();
  });
}

/***************************************************
 * 渲染登录页面表单
 ***************************************************/
function renderLoginPage() {
  const container = document.getElementById('children-list');
  container.innerHTML = '';

  if (children.length === 0) {
    // 如果没有任何记录，就默认添加一个空表单
    addChildForm();
  } else {
    // 如果已有记录 => 把每个孩子显示为可编辑的行
    children.forEach((child) => {
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
      // 若child.avatar是 data:协议(本地Base64)，则这里不显示
      // 若是普通https://...则回显
      if (!child.avatar.startsWith("data:")) {
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
 * 返回登录页
 ***************************************************/
function backToLogin() {
  if (intervalId) clearInterval(intervalId);
  intervalId = null;
  activeChild = null;

  document.getElementById('timer-page').style.display = 'none';
  document.getElementById('login-page').style.display = 'block';

  renderLoginPage();
}

/***************************************************
 * 计时器页：加载孩子卡片
 ***************************************************/
function loadChildrenIntoTimerPage() {
  const container = document.getElementById('avatars-container');
  container.innerHTML = '';

  children.forEach((child) => {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'avatar-card';
    cardDiv.onclick = () => startTimer(child);

    const circleDiv = document.createElement('div');
    circleDiv.className = 'avatar-circle';
    const img = document.createElement('img');
    img.src = child.avatar;
    circleDiv.appendChild(img);

    const nameLabel = document.createElement('div');
    nameLabel.className = 'card-name';
    nameLabel.textContent = child.name;

    const crownDiv = document.createElement('div');
    crownDiv.className = 'crown';
    const crownImg = document.createElement('img');
    crownImg.src = 'icon.png';
    crownDiv.appendChild(crownImg);

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
  if (activeChild && activeChild.name === child.name) return;

  if (activeChild) {
    timers[activeChild.name] += Math.floor(
      (Date.now() - activeChild.startTime) / 1000
    );
  }

  activeChild = child;
  activeChild.startTime = Date.now();

  updateCrownDisplay();

  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(() => {
    const elapsed = Math.floor((Date.now() - activeChild.startTime) / 1000);
    document.getElementById('current-timer').textContent = `当前计时: ${
      elapsed + timers[activeChild.name]
    }秒`;
  }, 1000);

  saveDataToStorage();
}

/***************************************************
 * 显示 / 隐藏 冠冕
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
 * 更新所有孩子的总时长 + “自定义”按钮
 ***************************************************/
function updateSummaryList() {
  const summaryContainer = document.getElementById('summary-list');
  summaryContainer.innerHTML = '';

  children.forEach((child) => {
    let totalTime = timers[child.name] || 0;
    if (activeChild && child.name === activeChild.name) {
      const elapsed = Math.floor((Date.now() - activeChild.startTime) / 1000);
      totalTime += elapsed;
    }

    // 一行
    const row = document.createElement('div');
    row.textContent = `${child.name}: ${totalTime} 秒`;

    // 自定义按钮
    const customBtn = document.createElement('button');
    customBtn.textContent = '自定义';
    customBtn.addEventListener('click', () => {
      const newTimeStr = prompt(`请输入新的秒数 (当前: ${totalTime})`);
      if (newTimeStr !== null) {
        let newTime = parseInt(newTimeStr, 10);
        if (isNaN(newTime) || newTime < 0) {
          alert('输入无效');
          return;
        }
        // 如果这个孩子正在计时，先结算
        if (activeChild && child.name === activeChild.name) {
          timers[child.name] += Math.floor(
            (Date.now() - activeChild.startTime) / 1000
          );
          activeChild.startTime = Date.now(); // 重置开始点
        }

        timers[child.name] = newTime;
        saveDataToStorage();
        updateSummaryList();

        if (activeChild && child.name === activeChild.name) {
          document.getElementById(
            'current-timer'
          ).textContent = `当前计时: ${newTime}秒`;
        }
      }
    });

    row.appendChild(customBtn);
    summaryContainer.appendChild(row);
  });
}

/***************************************************
 * 一键清零（可选功能）
 ***************************************************/
function clearAllData() {
  if (intervalId) clearInterval(intervalId);
  intervalId = null;
  activeChild = null;

  children = [];
  timers = {};
  localStorage.removeItem('crownTimerData');

  // 回到登录页
  document.getElementById('timer-page').style.display = 'none';
  document.getElementById('login-page').style.display = 'block';

  renderLoginPage();
}

/***************************************************
 * localStorage 持久化
 ***************************************************/
function saveDataToStorage() {
  const data = {
    children,
    timers,
    activeChildName: activeChild ? activeChild.name : null,
    activeStartTime: activeChild ? activeChild.startTime : null,
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
      const found = children.find((c) => c.name === data.activeChildName);
      if (found) {
        activeChild = found;
        activeChild.startTime = data.activeStartTime;
      }
    }
  } catch (e) {
    console.error('读取失败:', e);
  }
}
