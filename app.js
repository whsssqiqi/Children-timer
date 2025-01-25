const loginPage = document.getElementById('loginPage');
const appPage = document.getElementById('appPage');
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const avatarInput = document.getElementById('avatar');
const addCharacterBtn = document.getElementById('addCharacterBtn');
const confirmBtn = document.getElementById('confirmBtn');
const characterList = document.getElementById('characterList');
const childList = document.getElementById('childList');

let children = [];

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
            childElement.classList.add('child-item');
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
        childElement.classList.add('child-item');
        childElement.innerHTML = `
            <img src="${child.avatar}" alt="${child.name}" onclick="startTimer(${index})">
            <p>${child.name}</p>
            <img class="crown" src="https://upload.wikimedia.org/wikipedia/commons/7/7b/Gold_crown.svg" style="display:none;" />
        `;
        childList.appendChild(childElement);
    });
}

// 点击头像后启动计时器
function startTimer(index) {
    // 在这里加入计时器逻辑，点击头像时显示皇冠并开始计时
    const selectedChild = children[index];
    const crown = childList.children[index].querySelector('.crown');
    crown.style.display = 'block';
    console.log(`${selectedChild.name} 开始计时`);
}
