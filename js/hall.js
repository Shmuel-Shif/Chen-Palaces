// קבלת פרטי המשתמש המחובר
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
if (!currentUser) {
    window.location.href = 'index.html';
}

// הצגת שם המשתמש
document.getElementById('userInfo').textContent = currentUser.name;

// קבלת שם האולם מה-URL
const urlParams = new URLSearchParams(window.location.search);
const hallName = urlParams.get('hall');

// עדכון הצגת שם האולם
const hallNameElement = document.getElementById('hallName');
if (hallNameElement && hallName) {
    hallNameElement.textContent = hallName.replace('אולם-', 'אולם ').replace('-', ' ');
}

// הגדרת מקסימום מלצרים ליום
const MAX_WAITERS = 5;

// הגדרת הגבלות לפי אולם וימים
const HALL_LIMITS = {
    'אולם-בת-שבע': {
        'יום ראשון': { male: 12, female: 7 },
        'יום שני': { male: 10, female: 6 },
        'יום שלישי': { male: 10, female: 6 },
        'יום רביעי': { male: 10, female: 6 },
        'יום חמישי': { male: 12, female: 7 }
    },
    'אולם-שוהם': {
        'יום ראשון': { male: 12, female: 7 },
        'יום שני': { male: 10, female: 6 },
        'יום שלישי': { male: 10, female: 6 },
        'יום רביעי': { male: 10, female: 6 },
        'יום חמישי': { male: 12, female: 7 }
    },
    'אולם-ברקת': {
        'יום ראשון': { male: 12, female: 7 },
        'יום שני': { male: 10, female: 6 },
        'יום שלישי': { male: 10, female: 6 },
        'יום רביעי': { male: 10, female: 6 },
        'יום חמישי': { male: 12, female: 7 }
    },
    'אולם-מרדכי': {
        'יום ראשון': { male: 12, female: 7 },
        'יום שני': { male: 10, female: 6 },
        'יום שלישי': { male: 10, female: 6 },
        'יום רביעי': { male: 10, female: 6 },
        'יום חמישי': { male: 12, female: 7 }
    },
    'אולם-פרדו': {
        'יום ראשון': { male: 12, female: 7 },
        'יום שני': { male: 10, female: 6 },
        'יום שלישי': { male: 10, female: 6 },
        'יום רביעי': { male: 10, female: 6 },
        'יום חמישי': { male: 12, female: 7 }
    }
};

// הגדרת הגבלות לפי ימים - ברירת מחדל
const DAILY_LIMITS = {
    'יום ראשון': { male: 15, female: 8 },
    'יום שני': { male: 10, female: 6 },
    'יום שלישי': { male: 12, female: 7 },
    'יום רביעי': { male: 10, female: 6 },
    'יום חמישי': { male: 15, female: 8 }
};

// פונקציה ליצירת תאריך בפורמט YYYY-MM-DD
const formatDate = (date) => {
    return date.toISOString().split('T')[0];
};

// פונקציה להמרת מספר לאותיות עבריות
const numberToHebrewLetters = (num) => {
    const letters = {
        1: 'א', 2: 'ב', 3: 'ג', 4: 'ד', 5: 'ה',
        6: 'ו', 7: 'ז', 8: 'ח', 9: 'ט', 10: 'י',
        20: 'כ', 30: 'ל', 40: 'מ', 50: 'נ', 60: 'ס',
        70: 'ע', 80: 'פ', 90: 'צ', 100: 'ק',
        200: 'ר', 300: 'ש', 400: 'ת'
    };
    
    if (num === 15) return 'טו';
    if (num === 16) return 'טז';
    
    let result = '';
    let remaining = num;
    
    const values = Object.keys(letters)
        .map(Number)
        .sort((a, b) => b - a);
    
    for (const value of values) {
        while (remaining >= value) {
            result += letters[value];
            remaining -= value;
        }
    }
    
    return result;
};

// פונקציה להצגת תאריך בפורמט מלא
const formatFullDate = (date) => {
    // תאריך עברי
    const hebrewFormatter = new Intl.DateTimeFormat('he-IL', {
        calendar: 'hebrew',
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
    });
    
    const parts = hebrewFormatter.formatToParts(date);
    const hebrewDay = parseInt(parts.find(part => part.type === 'day').value);
    const hebrewYear = parseInt(parts.find(part => part.type === 'year').value);
    
    // קבלת שם החודש העברי
    const hebrewMonth = new Intl.DateTimeFormat('he-IL', {
        calendar: 'hebrew',
        month: 'long'
    }).format(date);

    // המרת היום והשנה לאותיות עבריות
    const hebrewDayLetters = numberToHebrewLetters(hebrewDay);
    const hebrewYearLetters = numberToHebrewLetters(hebrewYear % 10);

    // תאריך לועזי
    const gregorianDate = date.toLocaleDateString('he-IL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    return `${hebrewDayLetters}' ${hebrewMonth} תשפ"${hebrewYearLetters}<br>${gregorianDate}`;
};

// פונקציה לעדכון התא
const updateCell = (td, date, shifts, index) => {
    const dateStr = formatDate(date);
    const dayName = date.toLocaleDateString('he-IL', { weekday: 'long' });
    
    // קבלת המגבלות הספציפיות לאולם
    const hallLimits = HALL_LIMITS[hallName] || DAILY_LIMITS;
    const limits = hallLimits[dayName] || { male: 8, female: 5 }; // ברירת מחדל אם אין מגבלות
    
    // קבלת רשימות המלצרים לפי מגדר
    const shift = shifts[dateStr] || {};
    
    // התאמה למבנה החדש של Firebase
    const maleWaiters = shift.male ? 
        (typeof shift.male === 'object' ? Object.values(shift.male) : []) : [];
    const femaleWaiters = shift.female ? 
        (typeof shift.female === 'object' ? Object.values(shift.female) : []) : [];

    // עדכון התא עם הסדר החדש
    td.innerHTML = `
        <div class="day-header">
            <div class="day-name">${dayName}</div>
            <div class="date">${formatFullDate(date)}</div>
        </div>
        <button class="assign-btn" data-date="${dateStr}">שבץ אותי</button>
        <div class="waiters-list">
            <div class="gender-sections">
                <div class="section-title">
                    <i class="fas fa-mars"></i>
                    גברים (${maleWaiters.length}/${limits.male})
                </div>
                <div class="male-section">
                    ${maleWaiters.map(waiterId => `
                        <div class="waiter-tag male">
                            <span data-waiter-id="${waiterId}">טוען...</span>
                        </div>
                    `).join('')}
                </div>
                <div class="section-title">
                    <i class="fas fa-venus"></i>
                    נשים (${femaleWaiters.length}/${limits.female})
                </div>
                <div class="female-section">
                    ${femaleWaiters.map(waiterId => `
                        <div class="waiter-tag female">
                            <span data-waiter-id="${waiterId}">טוען...</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
        <div class="error-message"></div>
    `;

    // טעינת שמות המלצרים
    const loadWaiterNames = async (waiterId) => {
        try {
            // מנקים את ה-ID (מסירים את OP)
            const cleanWaiterId = waiterId.replace('OP', '');
            
            // טוען את פרטי המלצר מ-Firebase
            const snapshot = await database.ref(`waiters/OP${cleanWaiterId}`).once('value');
            const waiterData = snapshot.val();
            
            if (waiterData && waiterData.name) {
                const nameElements = document.querySelectorAll(`[data-waiter-id="${waiterId}"]`);
                nameElements.forEach(el => {
                    el.textContent = waiterData.name;
                    el.classList.remove('loading');
                });
            } else {
                console.error('No waiter data found for ID:', waiterId);
            }
        } catch (error) {
            console.error('Error loading waiter name:', error, 'ID:', waiterId);
        }
    };

    maleWaiters.forEach(loadWaiterNames);
    femaleWaiters.forEach(loadWaiterNames);

    // בדיקת מצב המשמרת למגדר הספציפי
    const currentUserGender = currentUser.gender.toLowerCase();
    const isGenderFull = currentUserGender === 'male' ? 
        maleWaiters.length >= limits.male : 
        femaleWaiters.length >= limits.female;
    
    const isAssigned = currentUserGender === 'male' ? 
        maleWaiters.includes(currentUser.id) : 
        femaleWaiters.includes(currentUser.id);

    // עדכון כפתור
    const button = td.querySelector('.assign-btn');
    if (button) {
        if (isAssigned) {
            button.disabled = false; // מאפשר לחיצה לביטול
            button.classList.remove('full', 'assigned');
            button.style.backgroundColor = '#64da53'; // צבע ירוק
            button.style.color = '#000000'; // צבע טקסט שחור
            button.textContent = 'בטל שיבוץ';
        } else if (isGenderFull) {
            button.disabled = true;
            button.classList.add('full');
            button.style.backgroundColor = ''; // מסיר צבע מותאם אישית
            button.style.color = ''; // מסיר צבע טקסט מותאם אישית
            button.textContent = 'אין מקום פנוי ✕';
        } else {
            button.disabled = false;
            button.classList.remove('full');
            button.style.backgroundColor = ''; // מסיר צבע מותאם אישית
            button.style.color = ''; // מסיר צבע טקסט מותאם אישית
            button.textContent = 'שבץ אותי';
        }
    }
};

// פונקציה למציאת יום ראשון של השבוע הנוכחי
const getCurrentSunday = (date) => {
    const today = new Date(date);
    const currentDay = today.getDay(); // 0 = ראשון, 6 = שבת
    
    // נחזור אחורה ליום ראשון של השבוע הנוכחי
    today.setDate(today.getDate() - currentDay);
    
    // אם היום שישי או שבת, נקפוץ ליום ראשון הבא
    if (currentDay === 5 || currentDay === 6) { // שישי או שבת
        today.setDate(today.getDate() + 7); // קפיצה לשבוע הבא
    }
    
    return today;
};

// פונקציה לטעינת הטבלה
const loadWeeklySchedule = async () => {
    const cells = document.querySelectorAll('.schedule-table td');
    const today = new Date();
    
    // מציאת יום ראשון של השבוע הנוכחי
    const sunday = getCurrentSunday(today);
    
    try {
        // טעינת השיבוצים מ-Firebase
        const shiftsSnapshot = await database.ref(`shifts/${hallName}`).once('value');
        const shifts = shiftsSnapshot.val() || {};

        cells.forEach((td, index) => {
            const date = new Date(sunday);
            date.setDate(sunday.getDate() + index);
            
            // עדכון התאריך בכותרת
            const formattedDate = formatFullDate(date);
            const dateHeader = document.getElementById(`date-${index}`);
            if (dateHeader) {
                dateHeader.innerHTML = formattedDate;
            }
            
            updateCell(td, date, shifts, index);
        });
    } catch (error) {
        console.error('Error loading schedule:', error);
    }
};

// עדכון הטיפול בלחיצה על כפתור שיבוץ
document.querySelector('.schedule-table').addEventListener('click', async (e) => {
    if (!e.target.matches('.assign-btn')) return;
    
    const dateStr = e.target.dataset.date;
    const gender = currentUser.gender.toLowerCase();
    const clickedCell = e.target.closest('td');
    
    try {
        // קבלת הרשימה הנוכחית של המלצרים
        const shiftsRef = database.ref(`shifts/${hallName}/${dateStr}/${gender}`);
        const snapshot = await shiftsRef.once('value');
        const currentWaiters = snapshot.val() ? Object.values(snapshot.val()) : [];
        
        // בדיקה אם המלצר כבר משובץ
        const isAssigned = currentWaiters.includes(currentUser.id);
        
        if (isAssigned) {
            // ביטול השיבוץ
            const updatedWaiters = currentWaiters.filter(id => id !== currentUser.id);
            await shiftsRef.set(updatedWaiters);
            
            // טעינה מחדש של השיבוצים
            loadWeeklySchedule();
            return;
        }
        
        // המשך הקוד הקיים לשיבוץ חדש
        const dayName = new Date(dateStr).toLocaleDateString('he-IL', { weekday: 'long' });
        const hallLimits = HALL_LIMITS[hallName] || DAILY_LIMITS;
        const limits = hallLimits[dayName] || { male: 8, female: 5 };
        
        if (currentWaiters.length >= limits[gender]) {
            throw new Error(`אין מקום פנוי ל${gender === 'male' ? 'גברים' : 'נשים'} במשמרת זו`);
        }

        // הוספת המלצר/ית בתחילת המערך
        await shiftsRef.set([currentUser.id, ...currentWaiters]);
        
        // הוספת אנימציה למלצר החדש
        setTimeout(() => {
            const newWaiterElement = clickedCell.querySelector(`[data-waiter-id="${currentUser.id}"]`);
            if (newWaiterElement) {
                newWaiterElement.classList.add('waiter-bounce');
                setTimeout(() => {
                    newWaiterElement.classList.remove('waiter-bounce');
                }, 500);
            }
        }, 100);
        
        // טעינה מחדש של השיבוצים
        loadWeeklySchedule();
        
    } catch (error) {
        console.error('Error in assignment:', error);
        const errorElement = clickedCell.querySelector('.error-message');
        errorElement.textContent = error.message || 'אירעה שגיאה בשיבוץ';
        setTimeout(() => errorElement.textContent = '', 3000);
    }
});

// האזנה לשינויים בזמן אמת
database.ref(`shifts/${hallName}`).on('value', loadWeeklySchedule);

// כפתורי ניווט
document.getElementById('backBtn').addEventListener('click', () => {
    window.location.href = 'dashboard.html';
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
});

// טעינה ראשונית
loadWeeklySchedule();

// כשיוצרים משמרת חדשה
const createNewShift = async (hallId, date) => {
    const shiftRef = shiftsRef.child(`${hallId}/${date}`);
    await shiftRef.set({
        male: {
            required: 8, // מספר הגברים הנדרש
            assigned: [] // רשימת הגברים המשובצים
        },
        female: {
            required: 5, // מספר הנשים הנדרש
            assigned: [] // רשימת הנשים המשובצות
        }
    });
};

// כשמשבצים מלצר/ית
const assignWaiter = async (hallId, date, waiterId, waiterGender) => {
    const shiftRef = shiftsRef.child(`${hallId}/${date}/${waiterGender}/assigned`);
    const shift = await shiftsRef.child(`${hallId}/${date}/${waiterGender}`).once('value');
    const shiftData = shift.val();

    // בדיקה אם יש מקום פנוי למגדר הספציפי
    if (shiftData.assigned.length >= shiftData.required) {
        throw new Error('אין מקומות פנויים למגדר זה במשמרת');
    }

    // הוספת המלצר/ית לרשימת המשובצים
    await shiftRef.transaction((assigned) => {
        if (!assigned) assigned = [];
        if (!assigned.includes(waiterId)) {
            assigned.push(waiterId);
        }
        return assigned;
    });
};

// הצגת המשמרות בטבלה
const displayShifts = async (hallId) => {
    const shifts = await shiftsRef.child(hallId).once('value');
    const shiftsData = shifts.val();

    Object.entries(shiftsData).forEach(([date, shift]) => {
        const cell = document.querySelector(`td[data-date="${date}"]`);
        if (cell) {
            // הצגת מספר המקומות הפנויים לכל מגדר
            const maleSpots = shift.male.required - shift.male.assigned.length;
            const femaleSpots = shift.female.required - shift.female.assigned.length;
            
            cell.innerHTML = `
                <div class="gender-spots">
                    <div class="male-spots">
                        <i class="fas fa-mars"></i>
                        ${maleSpots} מתוך ${shift.male.required}
                    </div>
                    <div class="female-spots">
                        <i class="fas fa-venus"></i>
                        ${femaleSpots} מתוך ${shift.female.required}
                    </div>
                </div>
                <div class="waiters-list">
                    ${renderAssignedWaiters(shift)}
                </div>
            `;
        }
    });
};

// הצגת המלצרים המשובצים
const renderAssignedWaiters = (shift) => {
    let html = '<div class="gender-sections">';
    
    // רשימת גברים
    html += '<div class="male-section">';
    shift.male.assigned.forEach(waiterId => {
        html += `<div class="waiter-tag male">${getWaiterName(waiterId)}</div>`;
    });
    html += '</div>';

    // רשימת נשים
    html += '<div class="female-section">';
    shift.female.assigned.forEach(waiterId => {
        html += `<div class="waiter-tag female">${getWaiterName(waiterId)}</div>`;
    });
    html += '</div>';

    return html + '</div>';
};

// פונקציה לעריכת ההגבלות
const showLimitsEditor = (dayName, currentLimits) => {
    // עדכון כותרת המודל
    document.getElementById('limitsDayName').textContent = `יום ${dayName}`;
    
    // הגדרת ערכים נוכחיים
    document.getElementById('maleLimitInput').value = currentLimits.male;
    document.getElementById('femaleLimitInput').value = currentLimits.female;
    
    // הצגת המודל
    document.getElementById('limitsModalOverlay').style.display = 'block';
    document.getElementById('limitsModal').style.display = 'block';
    
    // טיפול בשמירה
    document.getElementById('saveLimitsBtn').onclick = async () => {
        const maleLimit = parseInt(document.getElementById('maleLimitInput').value);
        const femaleLimit = parseInt(document.getElementById('femaleLimitInput').value);
        
        if (maleLimit && femaleLimit) {
            try {
                await database.ref(`halls/${hallName}/limits/${dayName}`).set({
                    male: maleLimit,
                    female: femaleLimit
                });
                
                // עדכון ה-DAILY_LIMITS המקומי
                HALL_LIMITS[hallName][dayName] = { male: maleLimit, female: femaleLimit };
                
                // טעינה מחדש של הטבלה
                loadWeeklySchedule();
                
                // סגירת המודל
                closeLimitsModal();
            } catch (error) {
                alert('אירעה שגיאה בשמירת ההגבלות');
            }
        }
    };
    
    // טיפול בביטול
    document.getElementById('cancelLimitsBtn').onclick = closeLimitsModal;
};

// פונקציה לסגירת המודל
const closeLimitsModal = () => {
    document.getElementById('limitsModalOverlay').style.display = 'none';
    document.getElementById('limitsModal').style.display = 'none';
};

// הוספת תכונת data-hall לגוף הדף
document.body.setAttribute('data-hall', hallName); 