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
const database = firebase.database();

// רפרנסים לדאטהבייס
const waitersRef = database.ref('waiters');
const shiftsRef = database.ref('shifts'); 