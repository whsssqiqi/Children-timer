let children = [];  // 存储孩子的姓名和头像
let activeChild = null;  // 当前计时的孩子
let timers = {};  // 存储每个孩子的计时器
let crownTime = {};  // 存储每个孩子持有皇冠的时间

function nextPage() {
  // 切换到计时器页面
  document.getElementById('login-page').style.display = 'none';
  document.getElementById('timer-page').style.display = 'block';
  
  // 初始化计时器界面
  loadChildren();
}

function loadChildren() {
  // 假设数据是硬编码的，实际可以动态获取
  children = [
    { name: "孩子1", avatar: "https://placekitten.com/80/80" },
    { name: "孩子2", avatar: "https://placekitten.com/81/81" }
  ];

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
    
    timers[child.name] = 0;
    crownTime[child.name] = 0;
  });
}

function startTimer(child) {
  if (activeChild !== null) {
    // 暂停当前计时
    timers[activeChild.name] += Math.floor((Date.now() - timers[activeChild.name]) / 1000);
  }

  // 设置新孩子为当前计时
  activeChild = child;
  timers[child.name] = Date.now();

  // 更新界面
  updateCrownDisplay();
}

function updateCrownDisplay() {
  const container = document.getElementById('avatars-container');
  const childrenAvatars = container.getElementsByClassName('avatar');
  
  for (let avatar of childrenAvatars) {
    const crown = avatar.querySelector('.crown');
    const childName = avatar.querySelector('img').alt;
    
    if (childName === activeChild.name) {
      crown.style.display = 'block';
      startCountingTime(childName);
    } else {
      crown.style.display = 'none';
    }
  }
}

function startCountingTime(childName) {
  setInterval(() => {
    const currentTime = Math.floor((Date.now() - timers[childName]) / 1000);
    document.getElementById('current-timer').textContent = `当前计时: ${currentTime}秒`;

    crownTime[childName] = currentTime;
  }, 1000);
}
