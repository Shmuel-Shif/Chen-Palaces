// להוסיף בתחילת הקובץ
// מעבר בין טפסים
document.getElementById('showRegister').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'flex';
    document.getElementById('formTitle').textContent = 'הרשמה למערכת';
});

document.getElementById('showLogin').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'flex';
    document.getElementById('formTitle').textContent = 'התחברות למערכת';
});

// להוסיף בתחילת הקובץ:
// טיפול בבחירת מגדר
document.querySelectorAll('.gender-option').forEach(option => {
    option.addEventListener('click', () => {
        // הסרת הבחירה הקודמת
        document.querySelectorAll('.gender-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        // הוספת הבחירה החדשה
        option.classList.add('selected');
    });
});

// להוסיף לפני הקוד של ההתחברות
// טיפול בהרשמה
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fullName = document.getElementById('regFullName').value;
    const password = document.getElementById('regPassword').value;
    const selectedGender = document.querySelector('.gender-option.selected');

    if (!selectedGender) {
        showError('reg-error-message', 'יש לבחור מגדר');
        return;
    }

    const gender = selectedGender.dataset.value;
    
    try {
        // בדיקה אם המשתמש כבר קיים
        const waitersRef = database.ref('waiters');
        const snapshot = await waitersRef.orderByChild('name').equalTo(fullName).once('value');
        
        if (snapshot.exists()) {
            showError('reg-error-message', 'שם זה כבר קיים במערכת');
            return;
        }

        // יצירת מזהה ייחודי
        const newWaiterId = waitersRef.push().key;
        
        // שמירת פרטי המשתמש החדש
        await waitersRef.child(newWaiterId).set({
            id: newWaiterId,
            name: fullName,
            password: password,
            gender: gender
        });

        // מעבר לטופס התחברות
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('registerForm').style.display = 'none';
        document.getElementById('formTitle').textContent = 'התחברות למערכת';
        
        // הכנסת שם המשתמש לשדה התחברות
        document.getElementById('username').value = fullName;
        
        // הצגת הודעה למשתמש
        const loginError = document.getElementById('error-message');
        loginError.style.color = '#4CAF50';
        loginError.textContent = 'ההרשמה הושלמה בהצלחה, אנא התחבר';

    } catch (error) {
        console.error(error);
        showError('reg-error-message', 'אירעה שגיאה בהרשמה');
    }
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const waitersRef = database.ref('waiters');
        const snapshot = await waitersRef.orderByChild('name').equalTo(username).once('value');
        
        if (!snapshot.exists()) {
            showError('error-message', 'שם משתמש לא קיים');
            return;
        }

        const waiter = Object.values(snapshot.val())[0];
        if (waiter.password !== password) {
            showError('error-message', 'סיסמה שגויה');
            return;
        }

        // התחברות מוצלחת
        localStorage.setItem('currentUser', JSON.stringify({
            id: waiter.id,
            name: waiter.name,
            gender: waiter.gender
        }));

        // במקום אלרט - הצגת מודל הצלחה
        showSuccessModal(true);

        // מעבר לדף הבית אחרי שניה וחצי
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);

    } catch (error) {
        console.error(error);
        showError('error-message', 'אירעה שגיאה בהתחברות');
    }
});

// פונקציית הצגת מודל הצלחה
const showSuccessModal = (isLogin = false) => {
    document.getElementById('modalTitle').textContent = 
        isLogin ? 'התחברת בהצלחה!' : 'ההרשמה בוצעה בהצלחה!';
    document.getElementById('modalOverlay').style.display = 'block';
    document.getElementById('successModal').style.display = 'block';
};

// פונקציה להצגת הודעת שגיאה
const showError = (elementId, message) => {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    
    // מעלים את ההודעה אחרי 5 שניות
    setTimeout(() => {
        errorElement.textContent = '';
    }, 5000);
}; 