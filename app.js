const loginPage = document.getElementById('loginPage');
const appPage = document.getElementById('appPage');
const usernameInput = document.getElementById('username');
const avatarInput = document.getElementById('avatar');
const addCharacterBtn = document.getElementById('addCharacterBtn');
const confirmBtn = document.getElementById('confirmBtn');
const childList = document.getElementById('childList');
const timerDisplay = document.getElementById("timerDisplay");

let children = []; // 存储角色数据
let activeTimers = []; // 存储每个角色的计时器
let timeStates = []; // 存储每个角色的时间状态（暂停时的时间）

// 加载并显示已存储的角色
function loadChildren() {
    if (children.length > 0) {
        loginPage.style.display = 'none';
        appPage.style.display = 'block';
        renderChildren();
    }
}

// 渲染角色列表
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

// 点击加号按钮时显示角色输入框
addCharacterBtn.addEventListener('click', function() {
    usernameInput.value = '';
    avatarInput.value = '';
    loginPage.style.display = 'block';
    appPage.style.display = 'none';
});

// 点击确认按钮，跳转到计时器页面
confirmBtn.addEventListener('click', function() {
    const username = usernameInput.value;
    const avatarFile = avatarInput.files[0];
    
    if (username && avatarFile) {
        const reader = new FileReader();
        reader.onload = function() {
            const avatarUrl = reader.result;
            const child = { name: username, avatar: avatarUrl };
            children.push(child);
            renderChildren();  // 渲染角色列表
            confirmBtn.style.display = 'none'; // 隐藏确认按钮
            loginPage.style.display = 'none'; // 隐藏登录界面
            appPage.style.display = 'block';  // 显示计时器页面
        };
        reader.readAsDataURL(avatarFile);
    }
});

// 点击头像后启动计时器
function startTimer(index) {
    // 停止当前计时器
    if (activeTimers[index]) {
        clearInterval(activeTimers[index]);
    }

    const allCrowns = document.querySelectorAll('.crown');
    allCrowns.forEach(crown => crown.style.display = 'none'); // 隐藏其他皇冠

    const crown = childList.children[index].querySelector('.crown');
    crown.style.display = 'block'; // 显示当前头像的皇冠

    let time = timeStates[index] || 0; // 如果之前有暂停时间则继续
    activeTimers[index] = setInterval(function() {
        time++;
        timeStates[index] = time; // 保存当前时间状态
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

// 在页面加载时检查 localStorage 数据
loadChildren();
