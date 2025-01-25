const childList = document.getElementById('childList');
const loginPage = document.getElementById('loginPage');
const appPage = document.getElementById('appPage');
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const avatarInput = document.getElementById('avatar');

let children = JSON.parse(localStorage.getItem('children')) || [];

loginForm.addEventListener('submit', function(e) {
    e.preventDefault(); // 防止表单刷新页面

    const username = usernameInput.value;
    const avatarFile = avatarInput.files[0];
    
    if (username && avatarFile) {
        const reader = new FileReader();
        reader.onload = function() {
            const avatarUrl = reader.result;
            const child = { name: username, avatar: avatarUrl };
            children.push(child);
            localStorage.setItem('children', JSON.stringify(children));

            console.log('头像和名字保存成功，跳转到应用页面');

            // 隐藏登录页面，显示应用页面
            loginPage.style.display = 'none';
            appPage.style.display = 'block';

            // 渲染孩子的头像和名字
            renderChildren();
        };
        reader.onerror = function() {
            console.error('文件读取失败');
        };
        reader.readAsDataURL(avatarFile); // 读取文件
    } else {
        console.error('请输入名字和上传头像');
    }
});

// 渲染所有孩子的信息
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

// 点击头像后启动计时器（功能和之前相同）
function startTimer(index) {
    console.log('计时器功能正在执行', index);
    // 处理计时器的逻辑
}

renderChildren();
