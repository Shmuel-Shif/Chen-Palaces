// בתחילת הקובץ - נוסיף בדיקה האם אנחנו בדף ההרשמה
document.addEventListener('DOMContentLoaded', () => {
    // בודק אם יש פרמטר register ב-URL
    const urlParams = new URLSearchParams(window.location.search);
    const isRegisterPage = urlParams.has('register');
    
    if (isRegisterPage) {
        // אם זה דף ההרשמה
        document.querySelector('.login-container').style.paddingTop = '30px';
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'flex';
        document.getElementById('formTitle').textContent = 'הרשמה למערכת';
    } else {
        // אם זה דף ההתחברות
        document.querySelector('.login-container').style.paddingTop = '90px';
        document.getElementById('registerForm').style.display = 'none';
        document.getElementById('loginForm').style.display = 'flex';
        document.getElementById('formTitle').textContent = 'התחברות למערכת';
    }
});

// עדכון המעבר בין הטפסים
document.getElementById('showRegister').addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = 'index.html?register';
});

document.getElementById('showLogin').addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = 'index.html';
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

    if (!/^\d{4}$/.test(password)) {
        showError('reg-error-message', 'הסיסמה חייבת להכיל 4 ספרות בדיוק');
        return;
    }

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

        // קבלת המספר הבא בסדרה
        const counterRef = database.ref('counters/waiterId');
        const counterSnapshot = await counterRef.once('value');
        const currentCounter = counterSnapshot.val() || 0;
        const nextCounter = currentCounter + 1;
        
        // יצירת מזהה בפורמט החדש
        const newWaiterId = `OP${nextCounter.toString().padStart(3, '0')}`;
        
        // שמירת פרטי המשתמש החדש
        await waitersRef.child(newWaiterId).set({
            id: newWaiterId,
            name: fullName,
            password: password,
            gender: gender
        });

        // עדכון המונה
        await counterRef.set(nextCounter);

        // מעבר לדף ההתחברות
        window.location.href = 'index.html';

    } catch (error) {
        console.error(error);
        showError('reg-error-message', 'אירעה שגיאה בהרשמה');
    }
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // בדיקת תקינות הסיסמה
    if (!/^\d{4}$/.test(password)) {
        showError('error-message', 'הסיסמה חייבת להכיל 4 ספרות בדיוק');
        return;
    }

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

// הוספת אפשרות לסגירת המודל בלחיצה על ה-overlay
document.getElementById('modalOverlay').addEventListener('click', () => {
    document.getElementById('modalOverlay').style.display = 'none';
    document.getElementById('successModal').style.display = 'none';
});

// פונקציה להצגת הודעת שגיאה
const showError = (elementId, message) => {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    
    // מעלים את ההודעה אחרי 5 שניות
    setTimeout(() => {
        errorElement.textContent = '';
    }, 5000);
};

// הוספת אירועי input לשדות הסיסמה
document.getElementById('password').addEventListener('input', function(e) {
    this.value = this.value.replace(/\D/g, '').slice(0, 4);
});

document.getElementById('regPassword').addEventListener('input', function(e) {
    this.value = this.value.replace(/\D/g, '').slice(0, 4);
}); 