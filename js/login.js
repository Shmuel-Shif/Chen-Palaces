document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('error-message');
    
    // פונקציה להצגת הודעת שגיאה
    const showError = (message) => {
        errorElement.textContent = message;
        // הודעת השגיאה תיעלם אחרי 3 שניות
        setTimeout(() => {
            errorElement.textContent = '';
        }, 3000);
    };
    
    try {
        const waitersRef = database.ref('waiters');
        const snapshot = await waitersRef.orderByChild('name').equalTo(username).once('value');
        
        if (snapshot.exists()) {
            const waiterData = Object.values(snapshot.val())[0];
            
            if (waiterData.password === password) {
                localStorage.setItem('currentUser', JSON.stringify({
                    id: waiterData.id,
                    name: waiterData.name
                }));
                window.location.href = 'dashboard.html';
            } else {
                showError('סיסמה שגויה');
            }
        } else {
            showError('משתמש לא קיים');
        }
    } catch (error) {
        console.error(error);
        showError('אירעה שגיאה בהתחברות');
    }
}); 