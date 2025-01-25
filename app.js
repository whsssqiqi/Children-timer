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
const endOfDayBtn = document.getElementById('endOfDayBtn');
const championDisplay = document.getElementById('championDisplay');
const championAvatar = document.getElementById('championAvatar');
const championName = document.getElementById('championName');
const resetBtn = document.getElementById('resetBtn');

let children = JSON.parse(localStorage.getItem('children')) || [];
let timers = []; // 存储每个角色的计时器
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

// 在计时器页面渲染角色
function renderChildren() {
    childList.innerHTML = '';
    children.forEach((child, index) => {
        const childElement = document.createElement('div');
        childElement.classList.add('character-item');
        childElement.innerHTML = `
            <img src="${child.avatar}" alt="${child.name}" onclick="startTimer(${index})">
            <p>${child.name}</p>
            <button class="delete-btn" onclick="deleteCharacter(${index})">×</button>
            <img class="crown" src="icon.png" style="display:none;" />
            <span id="timer-${index}" class="timer-text">00:00</span>
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
            localStorage.setItem('children', JSON.stringify(children)); // 保存到localStorage

            renderChildren();  // 渲染角色列表
            confirmBtn.style.display = 'none'; // 隐藏确认按钮
            loginPage.style.display = 'none'; // 隐藏登录界面
            appPage.style.display = 'block';  // 显示计时器页面
        };
        reader.readAsDataURL(avatarFile);
    }
});

// 删除成员
function deleteCharacter(index) {
    children.splice(index, 1);
    localStorage.setItem('children', JSON.stringify(children)); // 更新localStorage
    renderChildren();
    resetTimers(); // 删除成员时，重置所有计时器
}

// 点击头像后启动计时器
function startTimer(index) {
    // 停止当前计时器
    activeTimers.forEach((timer, i) => {
        if (i !== index) {
            clearInterval(timer); // 停止其他计时器
        }
    });

    // 隐藏其他皇冠
    const allCrowns = document.querySelectorAll('.crown');
    allCrowns.forEach(crown => crown.style.display = 'none');
    
    // 显示当前头像的皇冠
    const crown = childList.children[index].querySelector('.crown');
    crown.style.display = 'block';

    let time = timeStates[index] || 0; // 如果之前有暂停时间则继续
    activeTimers[index] = setInterval(function() {
        time++;
        timeStates[index] = time; // 保存当前时间状态
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        // 更新计时器显示
        const timerText = document.getElementById(`timer-${index}`);
        timerText.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

// 结算今天的冠军
endOfDayBtn.addEventListener('click', function() {
    let longestTime = 0;
    let championIndex = -1;

    timeStates.forEach((time, index) => {
        if (time > longestTime) {
            longestTime = time;
            championIndex = index;
        }
    });

    if (championIndex >= 0) {
        championAvatar.src = children[championIndex].avatar;
        championName.textContent = children[championIndex].name;
        championDisplay.style.display = 'block';
    }
});

// 重置按钮
resetBtn.addEventListener('click', function() {
    loginPage.style.display = 'block';
    appPage.style.display = 'none';
    timers = [];
    activeTimers = [];
    timeStates = [];
    championDisplay.style.display = 'none';
    timerDisplay.textContent = '00:00';
});

// 重置所有计时器
function resetTimers() {
    activeTimers.forEach(timer => clearInterval(timer)); // 停止所有计时器
    timeStates = []; // 清除所有计时状态
    timers = []; // 清空所有计时器数据
    const allTimers = document.querySelectorAll('.timer-text');
    allTimers.forEach(timer => timer.textContent = '00:00'); // 重置所有计时器显示
}

// 在页面加载时检查 localStorage 数据
loadChildren();
