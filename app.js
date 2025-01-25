const childList = document.getElementById('childList');
const loginPage = document.getElementById('loginPage');
const appPage = document.getElementById('appPage');
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const avatarInput = document.getElementById('avatar');

let children = JSON.parse(localStorage.getItem('children')) || [];

loginForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const username = usernameInput.value;
    const avatarFile = avatarInput.files[0];
    
    if (username && avatarFile) {
        const reader = new FileReader();
        reader.onload = function() {
            const avatarUrl = reader.result;
            const child = { name: username, avatar: avatarUrl };
            children.push(child);
            localStorage.setItem('children', JSON.stringify(children));

            // Hide login and show the app page
            loginPage.style.display = 'none';
            appPage.style.display = 'block';

            // Render children avatars and names
            renderChildren();
        };
        reader.readAsDataURL(avatarFile);
    }
});

// Render children on the app page
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

// Start timer (same as before)
function startTimer(index) {
    // Handle the timer functionality here (same as previous)
}

renderChildren();
