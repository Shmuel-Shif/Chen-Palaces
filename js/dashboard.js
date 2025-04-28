// בדיקה אם המשתמש מחובר
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
console.log('currentUser:', currentUser);

if (!currentUser) {
    window.location.href = 'index.html';
}

// הצגת שם המשתמש
document.addEventListener('DOMContentLoaded', () => {
    const userInfoElement = document.getElementById('userInfo');
    console.log('userInfoElement:', userInfoElement);
    
    if (userInfoElement && currentUser) {
        userInfoElement.textContent = `${currentUser.name}`;
    }
});

// התנתקות
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
});

// מעבר לדף האולם הספציפי בלחיצה על כפתור
document.querySelectorAll('.hall-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const hallName = btn.dataset.hall;
        window.location.href = `hall.html?name=${hallName}`;
    });
}); 