let children = [];        
let timers = {};          
let activeChild = null;   
let intervalId = null;    

window.addEventListener('load', () => {
  loadDataFromStorage();
  renderLoginPage();
});

// 事件绑定
document.getElementById('add-child-button').addEventListener('click', addChildForm);
document.getElementById('start-timer-button').addEventListener('click', nextPage);
document.getElementById('back-to-login').addEventListener('click', backToLogin);

/***************************************************
 * 登录页：动态添加孩子表单
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
 * 把上传的File转为Base64
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
 * 点击“开始计时” => 切换到计时器页面
 ***************************************************/
function nextPage() {
  children = [];
  timers = {};

  const childEntries = document.querySelectorAll('#children-list .child-entry');
  const readPromises = [];

  childEntries.forEach(entry => {
    const [nameInput, fileInput, urlInput] = entry.querySelectorAll('input');
    const name = nameInput.value.trim();
    const avatarFile = fileInput.files[0];
    const avatarUrl = urlInput.value.trim();

    if (!name) return;

    if (avatarFile) {
      const p = readFileAsDataURL(avatarFile).then(base64 => {
        children.push({ name, avatar: base64 });
        timers[name] = 0;
      });
      readPromises.push(p);
    } else if (avatarUrl) {
      children.push({ name, avatar: avatarUrl });
      timers[name] = 0;
    } else {
      children.push({ name, avatar: 'https://via.placeholder.com/90?text=No+Image' });
      timers[name] = 0;
    }
  });

  if (childEntries.length === 0) {
    alert('请至少添加一个孩子的信息');
    return;
  }

  Promise.all(readPromises).then(() => {
    if (children.length === 0) {
      alert('请至少填写孩子的姓名');
      return;
    }

    saveDataToStorage();

    document.getElementById('login-page').style.display = 'none';
    document.getElementById('timer-page').style.display = 'block';
    loadChildrenIntoTimerPage();
  });
}

/***************************************************
 * 显示登录页面时，还原表单
 ***************************************************/
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
 * 返回登录页
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
 * 计时器页面：渲染孩子卡片
 ***************************************************/
function loadChildrenIntoTimerPage() {
  const container = document.getElementById('avatars-container');
  container.innerHTML = '';

  children.forEach(child => {
    // 卡片容器
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

    // 皇冠
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
 * 更新所有孩子的总时长
 ***************************************************/
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
    p.textContent = `${child.name}: ${totalTime} 秒`;
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
  } catch (e) {
    console.error('读取存储失败', e);
  }
}
