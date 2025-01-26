let children = []; // 存储孩子信息
let activeChild = null; // 当前计时的孩子
let timers = {}; // 每个孩子的计时器
let interval = null; // 计时器的间隔函数

// 添加一个孩子的输入表单
function addChildForm() {
  const container = document.getElementById('children-list');
  const childEntry = document.createElement('div');
  childEntry.className = 'child-entry';

  // 姓名输入框
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.placeholder = '孩子的姓名';
  childEntry.appendChild(nameInput);

  // 头像输入框（URL方式）
  const avatarInput = document.createElement('input');
  avatarInput.type = 'text';
  avatarInput.placeholder = '头像URL';
  childEntry.appendChild(avatarInput);

  container.appendChild(childEntry);
}

// 切换到计时器页面
function nextPage() {
  const childEntries = document.querySelectorAll('.child-entry');

  childEntries.forEach(entry => {
    const name = entry.querySelector('input[type="text"]').value;
    const avatar = entry.querySelector('input[type="text"]:nth-child(2)').value;

    if (name && avatar) {
      children.push({ name, avatar });
      timers[name] = 0; // 初始化计时器为0
    }
  });

  if (children.length === 0) {
    alert('请至少添加一个孩子的信息');
    return;
  }

  document.getElementById('login-page').style.display = 'none';
  document.getElementById('timer-page').style.display = 'block';

  loadChildren();
}

// 加载孩子信息到计时器页面
function loadChildren() {
  const container = document.getElementById('avatars-container');
  container.innerHTML = '';

  children.forEach(child => {
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.onclick = () => startTimer(child);

    const img = document.createElement('img');
    img.src = child.avatar;
    avatar.appendChild(img);

    const crown = document.createElement('div');
    crown.className = 'crown';
    avatar.appendChild(crown);

    container.appendChild(avatar);
  });
}

// 开始计时
function startTimer(child) {
  if (activeChild) {
    // 停止当前孩子的计时
    timers[activeChild.name] += Math.floor((Date.now() - activeChild.startTime) / 1000);
  }

  activeChild = child;
  child.startTime = Date.now();

  updateCrownDisplay();
}

// 更新皇冠显示
function updateCrownDisplay() {
  const container = document.getElementById('avatars-container');
  const avatars = container.querySelectorAll('.avatar');

  avatars.forEach((avatar, index) => {
    const crown = avatar.querySelector('.crown');
    if (children[index] === activeChild) {
      crown.style.display = 'block';
    } else {
      crown.style.display = 'none';
    }
  });

  // 开始实时计时
  if (interval) clearInterval(interval);
  interval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - activeChild.startTime) / 1000);
    document.getElementById('current-timer').textContent = `当前计时: ${elapsed + timers[activeChild.name]}秒`;
  }, 1000);
}

// 初始化事件监听
document.getElementById('add-child-button').addEventListener('click', addChildForm);

// 默认添加一个输入框
addChildForm();
