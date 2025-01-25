const loginPage = document.getElementById('loginPage');
const appPage = document.getElementById('appPage');
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const avatarInput = document.getElementById('avatar');
const addCharacterBtn = document.getElementById('addCharacterBtn');
const confirmBtn = document.getElementById('confirmBtn');
const characterList = document.getElementById('characterList');
const childList = document.getElementById('childList');
const timerDisplay = document.getElementById("timerDisplay");

let children = [];
let currentTimer = null;
let timers = []; // 用来存储每个孩子的计时器

// 添加人物
addCharacterBtn.addEventListener('click', function() {
    const username = usernameInput.value;
    const avatarFile = avatarInput.files[0];
    
    if (username && avatarFile) {
        const reader = new FileReader();
        reader.onload = function() {
            const avatarUrl = reader.result;
            const child = { name: username, avatar: avatarUrl };
            children.push(child);

            // 添加完一个人物后，展示在角色列表
            const childElement = document.createElement('div');
            childElement.classList.add('character-item');
            childElement.innerHTML = `
                <img src="${child.avatar}" alt="${child.name}">
                <p>${child.name}</p>
            `;
            characterList.appendChild(childElement);

            // 显示确认按钮
            confirmBtn.style.display = 'block';
        };
        reader.readAsDataURL(avatarFile);
    }
});

// 确认按钮，跳转到计时器页面
confirmBtn.addEventListener('click', function() {
    // 隐藏登录页面，显示计时器页面
    loginPage.style.display = 'none';
    appPage.style.display = 'block';

    // 渲染计时器页面上的所有角色
    renderChildren();
});

// 渲染角色
function renderChildren() {
    childList.innerHTML = '';
    children.forEach((child, index) => {
        const childElement = document.createElement('div');
        childElement.classList.add('character-item');
        childElement.innerHTML = `
            <img src="${child.avatar}" alt="${child.name}" onclick="startTimer(${index})">
            <p>${child.name}</p>
            <img class="crown" src="icon.png" style="display:none;" />
        `;
        childList.appendChild(childElement);
    });
}

// 点击头像后启动计时器
function startTimer(index) {
    // 停止当前计时器
    if (currentTimer !== null) {
        clearInterval(currentTimer);
    }

    // 停止其他孩子的计时器
    timers.forEach(timer => clearInterval(timer));
    timers = [];

    // 清除之前的皇冠
    const allCrowns = document.querySelectorAll('.crown');
    allCrowns.forEach(crown => crown.style.display = 'none');

    // 显示当前头像的皇冠
    const crown = childList.children[index].querySelector('.crown');
    crown.style.display = 'block';

    // 启动新的计时器
    let time = 0; // 计时器初始时间（秒）
    currentTimer = setInterval(function() {
        time++;
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);

    // 存储当前的计时器
    timers[index] = currentTimer;
}
