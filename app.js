const children = [
    { name: "小明", avatar: "https://via.placeholder.com/100/FF6347/FFFFFF?text=小明" },
    { name: "小红", avatar: "https://via.placeholder.com/100/32CD32/FFFFFF?text=小红" },
    { name: "小刚", avatar: "https://via.placeholder.com/100/1E90FF/FFFFFF?text=小刚" },
];

let currentChild = null;
let timers = {};
let currentTimerInterval = null;
let winner = { name: "", time: 0 };

// 页面加载时，动态创建孩子头像
function loadChildren() {
    const childList = document.getElementById("childList");
    children.forEach((child, index) => {
        const childElement = document.createElement("div");
        childElement.classList.add("child-item");
        childElement.innerHTML = `
            <img src="${child.avatar}" alt="${child.name}" onclick="startTimer(${index})">
            <img class="crown" src="https://upload.wikimedia.org/wikipedia/commons/7/7b/Gold_crown.svg" style="display:none;" />
        `;
        childList.appendChild(childElement);
    });
}

// 启动计时器
function startTimer(index) {
    // 停止当前计时器
    if (currentTimerInterval) {
        clearInterval(currentTimerInterval);
    }

    // 切换皇冠
    const currentChildElement = document.querySelectorAll('.child-item')[currentChild]?.querySelector('.crown');
    if (currentChildElement) {
        currentChildElement.style.display = 'none';
    }

    currentChild = index;
    const newChildElement = document.querySelectorAll('.child-item')[currentChild]?.querySelector('.crown');
    newChildElement.style.display = 'block';

    // 启动新的计时器
    timers[currentChild] = timers[currentChild] || 0;
    currentTimerInterval = setInterval(() => {
        timers[currentChild]++;
        const minutes = Math.floor(timers[currentChild] / 60);
        const seconds = timers[currentChild] % 60;
        document.getElementById("timerDisplay").textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

// 结束当天的计时，统计冠军
document.getElementById("endDay").addEventListener("click", function() {
    // 找出持有最多时间的孩子
    let maxTime = 0;
    let winnerIndex = -1;
    for (let i = 0; i < children.length; i++) {
        if (timers[i] > maxTime) {
            maxTime = timers[i];
            winnerIndex = i;
        }
    }

    if (winnerIndex !== -1) {
        winner.name = children[winnerIndex].name;
        winner.time = maxTime;
        const minutes = Math.floor(winner.time / 60);
        const seconds = winner.time % 60;
        document.getElementById("winnerName").textContent = winner.name;
        document.getElementById("winnerTime").textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
});

// 初始化页面
loadChildren();