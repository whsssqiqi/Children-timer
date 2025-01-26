let children = [];          // { name: string, avatar: string, startTime?: number }
let timers = {};            // { [name: string]: number }  => 累计秒数
let activeChild = null;     // 当前在计时的孩子对象
let intervalId = null;      // setInterval 的句柄

window.addEventListener('load', () => {
  loadDataFromStorage();
  renderLoginPage();
});

// 事件绑定
document.getElementById('add-child-button').addEventListener('click', addChildForm);
document.getElementById('start-timer-button').addEventListener('click', nextPage);
document.getElementById('back-to-login').addEventListener('click', backToLogin);

/***************************************************
 * 登录页面相关
 ***************************************************/
function addChildForm() {
  const container = document.getElementById('children-list');
  
  const childEntry = document.createElement('div');
  childEntry.className = 'child-entry';
  
  // 1. 孩子姓名
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.placeholder = '孩子的姓名';
  childEntry.appendChild(nameInput);

  // 2. 头像文件
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  childEntry.appendChild(fileInput);

  // 3. 头像URL
  const urlInput = document.createElement('input');
  urlInput.type = 'text';
  urlInput.placeholder = '或输入头像URL';
  childEntry.appendChild(urlInput);

  // 4. 删除按钮
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = '删除';
  deleteBtn.onclick = () => childEntry.remove();
  childEntry.appendChild(deleteBtn);

  container.appendChild(childEntry);
}

/**
 * 切换到计时器页面：
 *  - 读取表单数据并初始化
 */
function nextPage() {
  children = [];
  timers = {};

  const childEntries = document.querySelectorAll('#children-list .child-entry');
  childEntries.forEach(entry => {
    const [nameInput, fileInput, urlInput] = entry.querySelectorAll('input');
    const name = nameInput.value.trim();
    const avatarFile = fileInput.files[0];
    const avatarUrl = urlInput.value.trim();

    if (!name) return;

    let finalAvatar = '';
    if (avatarFile) {
      finalAvatar = URL.createObjectURL(avatarFile);
    } else if (avatarUrl) {
      finalAvatar = avatarUrl;
    } else {
      finalAvatar = 'https://via.placeholder.com/90?text=No+Image';
    }

    children.push({ name, avatar: finalAvatar });
    timers[name] = 0;
  });

  if (children.length === 0) {
    alert('请至少添加一个孩子的信息');
    return;
  }

  saveDataToStorage();

  document.getElementById('login-page').style.display = 'none';
  document.getElementById('timer-page').style.display = 'block';

  loadChildrenIntoTimerPage();
}

/**
 * 从 localStorage 恢复后渲染登录表单
 */
function renderLoginPage() {
  const container = document.getElementById('children-list');
  container.innerHTML = '';

  if (children.length === 0) {
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
      urlInput.value = child.avatar.startsWith('blob:') ? '' : child.avatar;
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

/**
 * 返回登录页面
 */
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
 * 计时器页面相关
 ***************************************************/
function loadChildrenIntoTimerPage() {
  const container = document.getElementById('avatars-container');
  container.innerHTML = '';

  children.forEach(child => {
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'avatar';
    avatarDiv.onclick = () => startTimer(child);

    const img = document.createElement('img');
    img.src = child.avatar;
    avatarDiv.appendChild(img);

    // 创建小皇冠
    const crownDiv = document.createElement('div');
    crownDiv.className = 'crown';

    // 用 icon.png 作为皇冠图标
    const crownImg = document.createElement('img');
    crownImg.src = 'icon.png'; 
    crownDiv.appendChild(crownImg);

    avatarDiv.appendChild(crownDiv);

    container.appendChild(avatarDiv);
  });

  updateSummaryList();
}

/**
 * 点击头像，开始/切换计时
 */
function startTimer(child) {
  // 如果重复点击同一个孩子，忽略
  if (activeChild && activeChild.name === child.name) return;

  if (activeChild) {
    timers[activeChild.name] += Math.floor((Date.now() - activeChild.startTime) / 1000);
  }

  activeChild = child;
  activeChild.startTime = Date.now();

  updateCrownDisplay();

  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(() => {
    const elapsed = Math.floor((Date.now() - activeChild.startTime) / 1000);
    document.getElementById('current-timer').textContent = `当前计时: ${elapsed + timers[activeChild.name]}秒`;
  }, 1000);

  saveDataToStorage();
}

/**
 * 更新皇冠显示：只给 activeChild 显示
 */
function updateCrownDisplay() {
  const container = document.getElementById('avatars-container');
  const avatarDivs = container.querySelectorAll('.avatar');

  avatarDivs.forEach((avatarDiv, index) => {
    const crown = avatarDiv.querySelector('.crown');
    const child = children[index];
    if (activeChild && child.name === activeChild.name) {
      crown.style.display = 'block';
    } else {
      crown.style.display = 'none';
    }
  });

  updateSummaryList();
}

/**
 * 更新所有孩子的总时长
 */
function updateSummaryList() {
  const summaryContainer = document.getElementById('summary-list');
  summaryContainer.innerHTML = '';

  children.forEach(child => {
    let totalTime = timers[child.name];
    if (activeChild && child.name === activeChild.name) {
      const elapsed = Math.floor((Date.now() - activeChild.startTime) / 1000);
      totalTime += elapsed;
    }
    const p = document.createElement('p');
    p.textContent = `${child.name}：${totalTime} 秒`;
    summaryContainer.appendChild(p);
  });
}

/***************************************************
 * 本地存储 (localStorage)
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
  } catch (err) {
    console.error('读取 localStorage 出错:', err);
  }
}
