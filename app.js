let children = [];          // { name: string, avatar: string, startTime?: number }
let timers = {};            // { [name: string]: number }  => 累积的秒数
let activeChild = null;     // 当前在计时的孩子对象
let intervalId = null;      // setInterval 的句柄

// 页面加载时先尝试从 localStorage 恢复数据
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
// 添加一个新的孩子输入表单
function addChildForm() {
  const container = document.getElementById('children-list');
  
  const childEntry = document.createElement('div');
  childEntry.className = 'child-entry';
  
  // — 1. 孩子姓名 —
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.placeholder = '孩子的姓名';
  childEntry.appendChild(nameInput);

  // — 2. 头像文件 —
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  childEntry.appendChild(fileInput);

  // — 3. 头像URL —
  const urlInput = document.createElement('input');
  urlInput.type = 'text';
  urlInput.placeholder = '或输入头像URL';
  childEntry.appendChild(urlInput);

  // — 4. 删除按钮 —
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = '删除';
  deleteBtn.onclick = () => childEntry.remove();
  childEntry.appendChild(deleteBtn);

  container.appendChild(childEntry);
}

/**
 * 切换到计时器页面：
 * 1. 读取登录页面上的所有孩子信息
 * 2. 如果没有孩子，提示
 * 3. 否则隐藏登录页面，进入计时器页面
 */
function nextPage() {
  // 清空旧数据（重新读取）
  children = [];
  timers = {};

  const childEntries = document.querySelectorAll('#children-list .child-entry');
  childEntries.forEach(entry => {
    const [nameInput, fileInput, urlInput] = entry.querySelectorAll('input');
    const name = nameInput.value.trim();
    const avatarFile = fileInput.files[0];
    const avatarUrl = urlInput.value.trim();

    // 姓名必填
    if (!name) return;

    let finalAvatar = '';
    if (avatarFile) {
      // 本地上传
      finalAvatar = URL.createObjectURL(avatarFile);
    } else if (avatarUrl) {
      // URL
      finalAvatar = avatarUrl;
    } else {
      // 占位符
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

  // 切换界面
  document.getElementById('login-page').style.display = 'none';
  document.getElementById('timer-page').style.display = 'block';

  loadChildrenIntoTimerPage();
}

/**
 * 从 localStorage 恢复后，渲染登录表单
 */
function renderLoginPage() {
  const container = document.getElementById('children-list');
  container.innerHTML = '';

  if (children.length === 0) {
    // 如果还没有任何记录，默认添加一个空白表单
    addChildForm();
  } else {
    // 显示已记录的孩子信息（可编辑）
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
      // 如果之前是 blob:xxx，就不容易还原，这里只把非 blob: 的 URL 写回
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
  // 停止计时器
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  activeChild = null;

  document.getElementById('timer-page').style.display = 'none';
  document.getElementById('login-page').style.display = 'block';

  // 重新渲染
  renderLoginPage();
}

/***************************************************
 * 计时器页面相关
 ***************************************************/

/**
 * 加载孩子信息到计时器界面
 */
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

    const crown = document.createElement('div');
    crown.className = 'crown';
    avatarDiv.appendChild(crown);

    container.appendChild(avatarDiv);
  });

  updateSummaryList();
}

/**
 * 点击头像，开始或切换计时
 */
function startTimer(child) {
  // 若重复点击同一个孩子，忽略
  if (activeChild && activeChild.name === child.name) {
    return;
  }

  // 如果之前有人在计时
  if (activeChild) {
    timers[activeChild.name] += Math.floor((Date.now() - activeChild.startTime) / 1000);
  }

  // 设置当前激活的孩子
  activeChild = child;
  activeChild.startTime = Date.now();

  // 更新皇冠
  updateCrownDisplay();

  // 重启计时器
  if (intervalId) {
    clearInterval(intervalId);
  }
  intervalId = setInterval(() => {
    const elapsed = Math.floor((Date.now() - activeChild.startTime) / 1000);
    document.getElementById('current-timer').textContent = `当前计时: ${elapsed + timers[activeChild.name]}秒`;
  }, 1000);

  saveDataToStorage();
}

/**
 * 更新皇冠显示
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
 * 更新所有孩子的总时长显示
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