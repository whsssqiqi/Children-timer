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
let timers = [];
let activeTimers = [];

loadChildren();

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
            localStorage.setItem('children', JSON.stringify(children)); // 保存到localStorage

            const childElement = document.createElement('div');
            childElement.classList.add('character-item');
            childElement.innerHTML = `
                <img src="${child.avatar}" alt="${child.name}">
                <p>${child.name}</p>
                <button class="delete-btn" onclick="deleteCharacter(${children.length - 1})">×</button>
            `;
            characterList.appendChild(childElement);

            confirmBtn.style.display = 'block';
        };
        reader.readAsDataURL(avatarFile);
    }
});

// 确认按钮，跳转到计时器页面
confirmBtn.addEventListener('click', function() {
    loginPage.style.display = 'none';
    appPage.style.display = 'block';
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
            <button class="delete-btn" onclick="deleteCharacter(${index})">×</button>
        `;
        childList.appendChild(childElement);
    });
}

// 删除成员
function deleteCharacter(index) {
    children.splice(index, 1);
    localStorage.setItem('children', JSON.stringify(children)); // 更新localStorage
    renderChildren();
}

// 点击头像后启动计时器
function startTimer(index) {
    if (activeTimers[index]) {
        clearInterval(activeTimers[index].timer);
    }

    const allCrowns = document.querySelectorAll('.crown');
    allCrowns.forEach(crown => crown.style.display = 'none');

    const crown = childList.children[index].querySelector('.crown');
    crown.style.display = 'block';

    let time = timers[index] || 0;
    activeTimers[index] = { timer: setInterval(function() {
        time++;
        timers[index] = time;
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000) };
}

// 结算今天的冠军
endOfDayBtn.addEventListener('click', function() {
    let longestTime = 0;
    let championIndex = -1;

    timers.forEach((time, index) => {
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
    championDisplay.style.display = 'none';
    timerDisplay.textContent = '00:00';
});
