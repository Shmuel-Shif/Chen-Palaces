const firebaseConfig = {
    apiKey: "AIzaSyC_uejtkL2HfslfaA2eJ3lIEUatORNypuc",
    authDomain: "chen-palaces.firebaseapp.com",
    projectId: "chen-palaces",
    storageBucket: "chen-palaces.firebasestorage.app",
    messagingSenderId: "418362763493",
    appId: "1:418362763493:web:0af4c59f05d971fd700c0c",
    measurementId: "G-KR7B844PDR",
    databaseURL: "https://chen-palaces-default-rtdb.firebaseio.com"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// הוספת נתונים ראשוניים רק אם הם לא קיימים
const waitersRef = database.ref('waiters');
waitersRef.once('value').then((snapshot) => {
    if (!snapshot.exists()) {
        waitersRef.set({
            'w1': {
                id: 'w1',
                name: 'משה כהן',
                password: '1234'
            },
            'w2': {
                id: 'w2',
                name: 'יוסי לוי',
                password: 'abcd'
            }
        });
    }
});

const eventsRef = database.ref('events');
eventsRef.once('value').then((snapshot) => {
    if (!snapshot.exists()) {
        eventsRef.set({
            'hall1': {
                '2025-04-27': {
                    eventName: 'אירוע חתונה',
                    waiters: ['w1', 'w2']
                },
                '2025-04-28': {
                    eventName: 'בר מצווה',
                    waiters: ['w2']
                }
            },
            'hall2': {
                '2025-04-27': {
                    eventName: 'אירוע עסקי',
                    waiters: []
                }
            }
        });
    }
}); 