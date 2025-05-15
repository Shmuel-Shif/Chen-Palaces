// קבלת פרטי המשתמש המחובר
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
const isAdmin = currentUser?.isAdmin === true;
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
        'יום ראשון': { male: 3, female: 4 },
        'יום שני': { male: 10, female: 6 },
        'יום שלישי': { male: 10, female: 6 },
        'יום רביעי': { male: 10, female: 6 },
        'יום חמישי': { male: 12, female: 7 }
    },
    'אולם-שוהם': {
        'יום ראשון': { male: 10, female: 1 },
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
    const d = new Date(date);
    // נוודא שאנחנו בזמן מקומי
    d.setHours(0, 0, 0, 0);
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    const formattedDate = `${year}-${month}-${day}`;
    
    return formattedDate;
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

// פונקציה לעדכון מספר המלצרים המקסימלי
async function updateWaiterLimit(date, gender, newLimit) {
    try {
        const dayName = date.toLocaleDateString('he-IL', { weekday: 'long' });
        await database.ref(`halls/${hallName}/limits/${dayName}`).update({
            [gender]: parseInt(newLimit)
        });
        await loadWeeklySchedule();
    } catch (error) {
        console.error('Error updating limit:', error);
    }
}

// פונקציה להסרת מלצר
async function removeWaiter(waiterId, date, gender) {
    try {
        const dateStr = formatDate(date);
        const shiftsRef = database.ref(`shifts/${hallName}/${dateStr}/${gender}`);
        const snapshot = await shiftsRef.once('value');
        const currentWaiters = snapshot.val() || [];
        const updatedWaiters = currentWaiters.filter(id => id !== waiterId);
        await shiftsRef.set(updatedWaiters);
        await loadWeeklySchedule();
    } catch (error) {
        console.error('Error removing waiter:', error);
    }
}

// עדכון התא
const updateCell = (td, date, shifts, index) => {
    const dayName = ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי'][index];
    const dayLimits = HALL_LIMITS[hallName]?.[dayName] || { male: 8, female: 5 };

    // בדיקה אם היום לא פעיל
    if (dayLimits.inactive) {
        td.className = 'inactive';
        td.innerHTML = `
            <div class="day-header">
                <div class="day-name">${dayName}</div>
                <div class="date">${formatFullDate(date)}</div>
            </div>
            <div class="no-event">אין אירוע</div>
        `;
        return;
    }

    const dateStr = formatDate(date);
    
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
            // טיפול מיוחד במנהל
            if (waiterId === 'ADMIN') {
                const nameElements = document.querySelectorAll(`[data-waiter-id="ADMIN"]`);
                nameElements.forEach(el => {
                    el.textContent = 'שמואל שיף';
                    el.classList.remove('loading');
                });
                return;
            }

            // טיפול בכל המלצרים
            const snapshot = await database.ref(`waiters/${waiterId}`).once('value');
            const waiterData = snapshot.val();
            
            if (waiterData && waiterData.name) {
                const nameElements = document.querySelectorAll(`[data-waiter-id="${waiterId}"]`);
                nameElements.forEach(el => {
                    el.textContent = waiterData.name;
                    el.classList.remove('loading');
                });
            }
        } catch (error) {
            console.error('Error loading waiter name:', error);
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

    // אם זה מנהל, מוסיף אפשרות לשינוי מספר המלצרים
    if (isAdmin) {
        const maleLimitInput = document.createElement('input');
        maleLimitInput.type = 'number';
        maleLimitInput.value = limits.male;
        maleLimitInput.min = 0;
        maleLimitInput.max = 30;
        maleLimitInput.onchange = (e) => updateWaiterLimit(date, 'male', e.target.value);

        const femaleLimitInput = document.createElement('input');
        femaleLimitInput.type = 'number';
        femaleLimitInput.value = limits.female;
        femaleLimitInput.min = 0;
        femaleLimitInput.max = 30;
        femaleLimitInput.onchange = (e) => updateWaiterLimit(date, 'female', e.target.value);

        // הוספת כפתורי מחיקה למלצרים
        const waiterTags = td.querySelectorAll('.waiter-tag');
        waiterTags.forEach(tag => {
            const waiterId = tag.querySelector('[data-waiter-id]').dataset.waiterId;
            const controlsDiv = document.createElement('div');
            controlsDiv.className = 'waiter-controls';

            // כפתור מחיקה
            const removeBtn = document.createElement('button');
            removeBtn.textContent = '✕';
            removeBtn.onclick = () => {
                const gender = tag.classList.contains('male') ? 'male' : 'female';
                removeWaiter(waiterId, date, gender);
            };

            // כפתור העברה
            const moveBtn = document.createElement('button');
            moveBtn.textContent = '↺';
            moveBtn.onclick = () => {
                const gender = tag.classList.contains('male') ? 'male' : 'female';
                showMoveDialog(waiterId, formatDate(date), gender);
            };

            controlsDiv.appendChild(moveBtn);
            controlsDiv.appendChild(removeBtn);
            tag.appendChild(controlsDiv);
        });
    }
};

// פונקציה למציאת יום ראשון של השבוע הנוכחי
const getCurrentSunday = (date) => {
    const today = new Date(date);
    
    // נוודא שאנחנו עובדים עם תאריך בזמן מקומי
    today.setHours(0, 0, 0, 0);
    
    const currentDay = today.getDay(); // 0 = ראשון, 6 = שבת
    
    // אם היום הוא שישי או שבת
    if (currentDay === 5 || currentDay === 6) {
        // מחשבים כמה ימים להוסיף כדי להגיע ליום ראשון הבא
        const daysToAdd = 7 - currentDay;
        today.setDate(today.getDate() + daysToAdd);
    } else {
        // אחרת, חוזרים אחורה ליום ראשון של השבוע הנוכחי
        today.setDate(today.getDate() - currentDay);
    }

    // בדיקת תקינות התאריך
    
    return today;
};

// פונקציה לטעינת הטבלה
const loadWeeklySchedule = async () => {
    const cells = document.querySelectorAll('.schedule-table td');
    const today = new Date();
    const sunday = getCurrentSunday(today);
    
    try {
        const shiftsRef = database.ref(`shifts/${hallName}`);
        const shiftsSnapshot = await shiftsRef.once('value');
        let shifts = {};

        if (shiftsSnapshot.exists()) {
            shifts = shiftsSnapshot.val();
        }

        // עדכון כל התאים
        cells.forEach((td, index) => {
            const date = new Date(sunday);
            date.setDate(sunday.getDate() + index);
            const dateStr = formatDate(date);
            
            // עדכון התאריך בכותרת
            const dateHeader = document.getElementById(`date-${index}`);
            if (dateHeader) {
                dateHeader.innerHTML = formatFullDate(date);
            }

            // וידוא שיש מערכים תקינים גם אם אין נתונים
            if (!shifts[dateStr]) {
                shifts[dateStr] = { male: [], female: [] };
            }
            
            updateCell(td, date, shifts, index);
        });

        // האזנה לשינויים בזמן אמת
        shiftsRef.off();
        shiftsRef.on('value', (snapshot) => {
            const updatedShifts = snapshot.val() || {};
            cells.forEach((td, index) => {
                const date = new Date(sunday);
                date.setDate(sunday.getDate() + index);
                updateCell(td, date, updatedShifts, index);
            });
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
        const shiftsRef = database.ref(`shifts/${hallName}/${dateStr}/${gender}`);
        const snapshot = await shiftsRef.once('value');
        const currentWaiters = snapshot.val() ? Object.values(snapshot.val()) : [];
        
        // בדיקה אם המלצר כבר משובץ
        const isAssigned = currentWaiters.includes(currentUser.id);
        
        if (isAssigned) {
            // ביטול השיבוץ
            const updatedWaiters = currentWaiters.filter(id => id !== currentUser.id);
            await shiftsRef.set(updatedWaiters);
            showToast('השיבוץ בוטל בהצלחה', 'warning');
        } else {
            // בדיקה אם המלצר כבר משובץ באולם אחר באותו יום
            const assignmentCheck = await isWaiterAssignedOnDay(currentUser.id, dateStr);
            if (assignmentCheck.isAssigned) {
                showToast(`לא ניתן להשתבץ - כבר משובץ באולם ${assignmentCheck.hallName} ביום זה`, 'error');
                return;
            }

            // שיבוץ חדש
            const dayName = new Date(dateStr).toLocaleDateString('he-IL', { weekday: 'long' });
            const limits = HALL_LIMITS[hallName][dayName];
            
            if (currentWaiters.length >= limits[gender]) {
                throw new Error(`אין מקום פנוי ל${gender === 'male' ? 'גברים' : 'נשים'} במשמרת זו`);
            }

            // הוספת המלצר/ית
            await shiftsRef.set([currentUser.id, ...currentWaiters]);
            showToast('השיבוץ בוצע בהצלחה', 'success');
        }
        
        // טעינה מחדש של השיבוצים
        await loadWeeklySchedule();
        
    } catch (error) {
        console.error('Error in assignment:', error);
        if (error.isCustomError) {
            showToast(error.message, 'error');
        } else {
            const errorElement = clickedCell.querySelector('.error-message');
            errorElement.textContent = error.message || 'אירעה שגיאה בשיבוץ';
            setTimeout(() => errorElement.textContent = '', 3000);
        }
    }
});

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

// בתחילת הקובץ, אחרי הקוד הקיים של בדיקת המשתמש
document.addEventListener('DOMContentLoaded', async () => {
    // מסתיר את תוכן הדף עד שהכל יטען
    document.querySelector('.schedule-container').style.display = 'none';
    
    try {
        // קודם כל טוען את ההגבלות
        await loadHallLimits();
        
        // ואז את הלוח
        await loadWeeklySchedule();
        
        // מציג את תוכן הדף ומסתיר את הלוודר
        document.querySelector('.schedule-container').style.display = 'block';
        document.getElementById('pageLoader').style.display = 'none';

        if (currentUser.isAdmin) {
            const headerRight = document.querySelector('.header-right');
            const settingsBtn = document.createElement('button');
            settingsBtn.className = 'icon-btn';
            settingsBtn.innerHTML = '<i class="fas fa-cog"></i>';
            settingsBtn.onclick = showHallSettings;
            headerRight.insertBefore(settingsBtn, headerRight.firstChild);
        }
    } catch (error) {
        console.error('Error loading data:', error);
        // במקרה של שגיאה, עדיין נסתיר את הלוודר
        document.getElementById('pageLoader').style.display = 'none';
    }
});

// פונקציה להעברת מלצר
async function moveWaiter(waiterId, fromDate, fromGender, toHall, toDate) {
    // בדיקה רק אם זה אותו אולם ואותו תאריך
    if (toHall === hallName && toDate === fromDate) {
        throw new Error('לא ניתן להעביר לאותו יום באותו אולם');
    }

    const targetDay = new Date(toDate).toLocaleDateString('he-IL', { weekday: 'long' });
    const targetLimits = HALL_LIMITS[toHall][targetDay];
    
    // קבלת המלצרים ביעד
    const toShiftRef = database.ref(`shifts/${toHall}/${toDate}/${fromGender}`);
    const toSnapshot = await toShiftRef.once('value');
    let targetWaiters = toSnapshot.exists() ? 
        (Array.isArray(toSnapshot.val()) ? toSnapshot.val() : Object.values(toSnapshot.val())) : [];

    // בדיקה אם המלצר כבר קיים ביום היעד
    if (targetWaiters.includes(waiterId)) {
        throw new Error('לא ניתן להעביר - המלצר כבר משובץ ביום זה');
    }

    // בדיקת מגבלת מלצרים
    if (targetWaiters.length >= targetLimits[fromGender]) {
        throw new Error(`אין מקום פנוי ל${fromGender === 'male' ? 'גברים' : 'נשים'} ביעד (${targetWaiters.length}/${targetLimits[fromGender]})`);
    }

    // הסרה מהמקור
    const fromShiftRef = database.ref(`shifts/${hallName}/${fromDate}/${fromGender}`);
    const fromSnapshot = await fromShiftRef.once('value');
    let currentWaiters = fromSnapshot.exists() ? 
        (Array.isArray(fromSnapshot.val()) ? fromSnapshot.val() : Object.values(fromSnapshot.val())) : [];
    
    const updatedFromWaiters = currentWaiters.filter(id => id !== waiterId);

    // עדכון המקור
    if (updatedFromWaiters.length === 0) {
        await fromShiftRef.remove();
    } else {
        await fromShiftRef.set(updatedFromWaiters);
    }

    // עדכון היעד
    await toShiftRef.set([...targetWaiters, waiterId]);
    
    // רענון מיידי
    await loadWeeklySchedule();
}

// פונקציה להצגת מודל החלפת מלצרים
const showMoveDialog = async (waiterId, fromDate, gender) => {
    const dialog = document.createElement('div');
    dialog.className = 'move-dialog';
    dialog.innerHTML = `
        <h3>העברת מלצר</h3>
        <select id="moveToHall">
            <option value="">בחר אולם</option>
            ${Object.keys(HALL_LIMITS).map(hall => 
                `<option value="${hall}" ${hall === hallName ? 'selected' : ''}>
                    ${hall.replace('אולם-', 'אולם ').replace('-', ' ')}
                </option>`
            ).join('')}
        </select>
        <select id="moveToDay">
            <option value="">בחר יום</option>
            ${['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי'].map(day => 
                `<option value="${day}">${day}</option>`
            ).join('')}
        </select>
        <div class="waiters-list-container" style="display: none;">
            <p>בחר מלצר להחלפה:</p>
            <select id="waiterToSwapWith">
                <option value="">-- בחר מלצר --</option>
            </select>
        </div>
        <div class="dialog-buttons">
            <button id="confirmMove">העבר</button>
            <button id="cancelMove">ביטול</button>
        </div>
    `;

    document.body.appendChild(dialog);
    document.body.classList.add('modal-open');

    // טיפול בשינוי יום
    const daySelect = dialog.querySelector('#moveToDay');
    daySelect.addEventListener('change', async () => {
        const selectedDay = daySelect.value;
        const selectedHall = dialog.querySelector('#moveToHall').value;
        if (!selectedDay || !selectedHall) return;

        const targetDate = getNextDayDate(selectedDay, fromDate);
        const waitersContainer = dialog.querySelector('.waiters-list-container');
        const waiterSelect = dialog.querySelector('#waiterToSwapWith');
        
        try {
            // קבלת המלצרים מהיום הנבחר
            const targetRef = database.ref(`shifts/${selectedHall}/${targetDate}/${gender}`);
            const snapshot = await targetRef.once('value');
            const existingWaiters = snapshot.val() || [];
            
            // בדיקת מגבלות
            const limits = HALL_LIMITS[selectedHall][selectedDay][gender];
            const isFull = existingWaiters.length >= limits;

            if (isFull) {
                // אם מלא, מציג את רשימת המלצרים להחלפה
                waitersContainer.style.display = 'block';
                waiterSelect.innerHTML = '<option value=""> בחר מלצר להחלפה </option>';
                
                // מילוי רשימת המלצרים
                for (const targetWaiterId of existingWaiters) {
                    const waiterSnapshot = await database.ref(`workers/${targetWaiterId}`).once('value');
                    const waiterData = waiterSnapshot.val();
                    if (waiterData) {
                        waiterSelect.innerHTML += `
                            <option value="${targetWaiterId}">${waiterData.name}</option>
                        `;
                    }
                }
            } else {
                // אם יש מקום, מסתיר את אפשרות ההחלפה
                waitersContainer.style.display = 'none';
            }
        } catch (error) {
            console.error('Error loading waiters:', error);
            showToast('אירעה שגיאה בטעינת המלצרים', 'error');
        }
    });

    // טיפול בכפתור האישור
    dialog.querySelector('#confirmMove').addEventListener('click', async () => {
        const selectedHall = dialog.querySelector('#moveToHall').value;
        const selectedDay = dialog.querySelector('#moveToDay').value;
        const selectedWaiter = dialog.querySelector('#waiterToSwapWith').value;
        
        if (!selectedHall || !selectedDay) {
            showToast('נא לבחור אולם ויום', 'error');
            return;
        }

        try {
            const targetDate = getNextDayDate(selectedDay, fromDate);
            
            // בדיקת מגבלות
            const limits = HALL_LIMITS[selectedHall][selectedDay][gender];
            const targetRef = database.ref(`shifts/${selectedHall}/${targetDate}/${gender}`);
            const snapshot = await targetRef.once('value');
            const existingWaiters = snapshot.val() || [];

            // בדיקה אם המלצר כבר קיים ביום היעד
            if (existingWaiters.includes(waiterId)) {
                showToast('לא ניתן להעביר - המלצר כבר משובץ ביום זה', 'error');
                return; // יוצאים מהפונקציה בלי לבצע שינויים
            }

            const isFull = existingWaiters.length >= limits;

            if (isFull && !selectedWaiter) {
                showToast('נא לבחור מלצר להחלפה', 'error');
                return;
            }

            if (isFull) {
                // החלפה עם המלצר הנבחר - מעבירים גם את fromDate
                await swapWaiters(targetDate, waiterId, selectedWaiter, gender, selectedHall, fromDate);
            } else {
                // הסרה מהמקור
                await removeWaiter(waiterId, fromDate, gender);
                // הוספה ליום החדש
                await addWaiter(waiterId, targetDate, gender, selectedHall);
            }

            showToast('המלצר הועבר בהצלחה', 'success');
            closeDialog(dialog);
            loadWeeklySchedule();
        } catch (error) {
            console.error('Error moving waiter:', error);
            showToast(error.message || 'אירעה שגיאה בהעברת המלצר', 'error');
        }
    });

    // טיפול בכפתור הביטול
    dialog.querySelector('#cancelMove').addEventListener('click', () => {
        closeDialog(dialog);
    });
};

// פונקציות עזר
const closeDialog = (dialog) => {
    document.body.classList.remove('modal-open');
    dialog.remove();
};

const addWaiter = async (waiterId, date, gender, targetHall) => {
    const shiftsRef = database.ref(`shifts/${targetHall}/${date}/${gender}`);
    const snapshot = await shiftsRef.once('value');
    const currentWaiters = snapshot.val() || [];

    // בדיקה אם המלצר כבר קיים ביום זה
    if (currentWaiters.includes(waiterId)) {
        throw new Error('לא ניתן להעביר - המלצר כבר משובץ ביום זה');
    }

    // בדיקת מגבלת מלצרים
    const targetDay = new Date(date).toLocaleDateString('he-IL', { weekday: 'long' });
    const limits = HALL_LIMITS[targetHall][targetDay];
    
    if (currentWaiters.length >= limits[gender]) {
        throw new Error(`אין מקום פנוי ל${gender === 'male' ? 'גברים' : 'נשים'} ביום זה (${currentWaiters.length}/${limits[gender]})`);
    }

    await shiftsRef.set([...currentWaiters, waiterId]);
};

const swapWaiters = async (targetDate, waiter1Id, waiter2Id, gender, targetHall, fromDate) => {
    try {
        console.log('Swapping waiters:', {
            fromDate,
            targetDate,
            waiter1Id,
            waiter2Id,
            gender,
            fromHall: hallName,
            toHall: targetHall
        });

        // קבלת המלצרים מהיום המקורי
        const sourceRef = database.ref(`shifts/${hallName}/${fromDate}/${gender}`);
        const sourceSnapshot = await sourceRef.once('value');
        let sourceWaiters = sourceSnapshot.val() || [];

        // קבלת המלצרים מהיום היעד
        const targetRef = database.ref(`shifts/${targetHall}/${targetDate}/${gender}`);
        const targetSnapshot = await targetRef.once('value');
        let targetWaiters = targetSnapshot.val() || [];

        // בדיקה אם המלצר כבר קיים ביום היעד
        if (targetWaiters.includes(waiter1Id)) {
            throw new Error('לא ניתן להעביר - המלצר כבר משובץ ביום זה');
        }

        // בדיקה אם המלצר השני כבר קיים ביום המקור
        if (sourceWaiters.includes(waiter2Id)) {
            throw new Error('לא ניתן להחליף - המלצר השני כבר משובץ ביום זה');
        }

        console.log('Before swap:', {
            sourceWaiters,
            targetWaiters
        });

        // מחיקת המלצרים מהמערכים המקוריים
        sourceWaiters = sourceWaiters.filter(id => id !== waiter1Id);
        targetWaiters = targetWaiters.filter(id => id !== waiter2Id);

        // הוספת כל מלצר למקום החדש שלו
        sourceWaiters.push(waiter2Id);
        targetWaiters.push(waiter1Id);

        console.log('After swap:', {
            sourceWaiters,
            targetWaiters
        });

        // שמירת השינויים בשני המקומות
        const updates = {};
        updates[`shifts/${hallName}/${fromDate}/${gender}`] = sourceWaiters.length > 0 ? sourceWaiters : null;
        updates[`shifts/${targetHall}/${targetDate}/${gender}`] = targetWaiters.length > 0 ? targetWaiters : null;

        await database.ref().update(updates);
        await loadWeeklySchedule();

    } catch (error) {
        console.error('Error in swapWaiters:', error);
        throw error;
    }
};

// עדכון פונקציית getNextDayDate
function getNextDayDate(targetDayName, fromDate) {
    const days = {
        'יום ראשון': 0,
        'יום שני': 1,
        'יום שלישי': 2,
        'יום רביעי': 3,
        'יום חמישי': 4
    };

    // המרת התאריך לאובייקט Date
    const currentDate = new Date(fromDate);
    const currentDay = currentDate.getDay();
    
    // מציאת יום ראשון של השבוע
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDay);
    
    // חישוב התאריך המבוקש
    const targetDate = new Date(weekStart);
    const targetDayNum = days[targetDayName];
    
    // בדיקת תקינות היום המבוקש
    if (targetDayNum === undefined) {
        throw new Error('יום לא חוקי');
    }

    // הוספת מספר הימים מיום ראשון
    targetDate.setDate(weekStart.getDate() + targetDayNum);

    return formatDate(targetDate);
}

// פונקציה להצגת הודעות toast
function showToast(message, type = 'info') {
    // בדיקה אם קיים container, אם לא - יוצרים אחד
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    // הסרת ה-toast אחרי 3 שניות
    setTimeout(() => {
        toast.remove();
        // אם אין עוד toast-ים, הסר את ה-container
        if (container.children.length === 0) {
            container.remove();
        }
    }, 3000);
}

// פונקציה לבדיקה אם המלצר כבר משובץ ביום מסוים באולם אחר
async function isWaiterAssignedOnDay(waiterId, date) {
    try {
        const halls = ['אולם-בת-שבע', 'אולם-שוהם', 'אולם-ברקת', 'אולם-מרדכי', 'אולם-פרדו'];
        const gender = currentUser.gender.toLowerCase();
        
        // בדיקת כל האולמות
        for (const hall of halls) {
            // דילוג על האולם הנוכחי
            if (hall === hallName) continue;

            const ref = database.ref(`shifts/${hall}/${date}/${gender}`);
            const snapshot = await ref.once('value');
            const data = snapshot.val();

            // אם יש נתונים ויש מערך, בודקים אם המלצר נמצא בו
            if (data) {
                if (Array.isArray(data) && data.includes(waiterId)) {
                    // מחזירים אובייקט עם המידע
                    return {
                        isAssigned: true,
                        hallName: hall.replace('אולם-', '') // מסירים את המילה "אולם-" מהשם
                    };
                }
            }
        }
        
        return { isAssigned: false };

    } catch (error) {
        console.error('Error in isWaiterAssignedOnDay:', error);
        return { isAssigned: false };
    }
}

// הוספת האזנה ללחיצה על מגבלות המלצרים
document.addEventListener('click', async (e) => {
    // בדיקה אם זה אדמין ואם לחץ על מגבלת מלצרים
    if (currentUser.isAdmin && (e.target.matches('.waiters-limit') || e.target.closest('.waiters-limit'))) {
        const gender = e.target.closest('.waiters-limit').dataset.gender;
        const currentLimit = HALL_LIMITS[hallName][getCurrentDayName()][gender];
        
        // יצירת דיאלוג להגדרת מגבלות
        const dialog = document.createElement('div');
        dialog.className = 'modal';
        dialog.innerHTML = `
            <div class="modal-content">
                <h3>הגדרת מגבלת מלצרים</h3>
                <p>הגדר מספר מקסימלי של ${gender === 'male' ? 'מלצרים' : 'מלצריות'} ל${getCurrentDayName()}</p>
                <input type="number" id="limitInput" value="${currentLimit}" min="0" max="20">
                <div class="modal-buttons">
                    <button class="save-btn">שמור</button>
                    <button class="cancel-btn">ביטול</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        // הוספת האזנה לכפתורים
        dialog.querySelector('.save-btn').addEventListener('click', async () => {
            const newLimit = parseInt(dialog.querySelector('#limitInput').value);
            if (isNaN(newLimit) || newLimit < 0) {
                showToast('נא להזין מספר חיובי', 'error');
                return;
            }

            try {
                // עדכון המגבלה בפיירבייס
                await database.ref(`halls/${hallName}/limits/${getCurrentDayName()}/${gender}`).set(newLimit);
                showToast('המגבלה עודכנה בהצלחה', 'success');
                
                // עדכון המגבלה בזיכרון
                HALL_LIMITS[hallName][getCurrentDayName()][gender] = newLimit;
                
                // עדכון התצוגה
                updateLimitsDisplay();
            } catch (error) {
                console.error('Error updating limit:', error);
                showToast('אירעה שגיאה בעדכון המגבלה', 'error');
            }

            dialog.remove();
        });

        dialog.querySelector('.cancel-btn').addEventListener('click', () => {
            dialog.remove();
        });
    }
});

// פונקציה לעדכון תצוגת המגבלות
function updateLimitsDisplay() {
    const maleLimitElement = document.querySelector('.waiters-limit[data-gender="male"]');
    const femaleLimitElement = document.querySelector('.waiters-limit[data-gender="female"]');
    
    if (maleLimitElement && femaleLimitElement) {
        const currentDay = getCurrentDayName();
        const maleAssigned = document.querySelectorAll(`.male-waiters[data-day="${currentDay}"] .waiter-tag`).length;
        const femaleAssigned = document.querySelectorAll(`.female-waiters[data-day="${currentDay}"] .waiter-tag`).length;
        
        maleLimitElement.textContent = `גברים (${maleAssigned}/${HALL_LIMITS[hallName][currentDay].male})`;
        femaleLimitElement.textContent = `נשים (${femaleAssigned}/${HALL_LIMITS[hallName][currentDay].female})`;
    }
}

function showHallSettings() {
    const overlay = document.createElement('div');
    overlay.className = 'settings-modal-overlay';
    document.body.appendChild(overlay);

    const dialog = document.createElement('div');
    dialog.className = 'settings-modal';
    dialog.innerHTML = `
        <h3>הגדרות אולם ${hallName.replace('אולם-', '')}</h3>
        <div class="settings-grid">
            ${['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי'].map(day => `
                <div class="day-settings">
                    <div class="day-header">
                        <h4>${day}</h4>
                        <label class="active-toggle">
                            <input type="checkbox" 
                                   data-day="${day}" 
                                   ${!HALL_LIMITS[hallName][day]?.inactive ? 'checked' : ''}>
                            יום פעיל
                        </label>
                    </div>
                    <div class="limits-container">
                        <div class="limit-input">
                            <label>מלצרים:</label>
                            <input type="number" 
                                   data-day="${day}" 
                                   data-gender="male" 
                                   value="${HALL_LIMITS[hallName][day]?.male || 0}"
                                   min="0" max="20"
                                   ${HALL_LIMITS[hallName][day]?.inactive ? 'disabled' : ''}>
                        </div>
                        <div class="limit-input">
                            <label>מלצריות:</label>
                            <input type="number" 
                                   data-day="${day}" 
                                   data-gender="female" 
                                   value="${HALL_LIMITS[hallName][day]?.female || 0}"
                                   min="0" max="20"
                                   ${HALL_LIMITS[hallName][day]?.inactive ? 'disabled' : ''}>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="modal-buttons">
            <button class="save-btn">שמור</button>
            <button class="cancel-btn">ביטול</button>
        </div>
    `;

    // הוספת ה-dialog ל-DOM - זו השורה החסרה!
    document.body.appendChild(dialog);

    // הוספת האזנה לשינוי סטטוס היום
    dialog.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const dayInputs = e.target.closest('.day-settings').querySelectorAll('input[type="number"]');
            dayInputs.forEach(input => {
                input.disabled = !e.target.checked;
            });
        });
    });

    // סגירת המודל
    const closeModal = () => {
        dialog.remove();
        overlay.remove();
    };

    // הוספת האזנה לכפתורים
    dialog.querySelector('.save-btn').addEventListener('click', async () => {
        try {
            const updates = {};
            
            dialog.querySelectorAll('.day-settings').forEach(daySection => {
                const day = daySection.querySelector('input[type="checkbox"]').dataset.day;
                const isActive = daySection.querySelector('input[type="checkbox"]').checked;
                const dayKey = day.replace('יום ', '');
                
                const maleInput = daySection.querySelector('input[data-gender="male"]');
                const femaleInput = daySection.querySelector('input[data-gender="female"]');
                
                updates[`halls/${hallName}/limits/${dayKey}`] = {
                    male: parseInt(maleInput.value) || 0,
                    female: parseInt(femaleInput.value) || 0,
                    inactive: !isActive
                };
            });

            await database.ref().update(updates);
            showToast('ההגדרות נשמרו בהצלחה', 'success');
            closeModal();
        } catch (error) {
            console.error('Error saving settings:', error);
            showToast('אירעה שגיאה בשמירת ההגדרות', 'error');
        }
    });

    dialog.querySelector('.cancel-btn').addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
}

// עדכון פונקציית getCurrentDayName
function getCurrentDayName() {
    const days = {
        0: 'יום ראשון',
        1: 'יום שני',
        2: 'יום שלישי',
        3: 'יום רביעי',
        4: 'יום חמישי',
        5: 'יום שישי',
        6: 'יום שבת'
    };
    return days[new Date().getDay()];
}

// פונקציה לטעינת ההגבלות מהפיירבייס
async function loadHallLimits() {
    try {
        const limitsRef = database.ref(`halls/${hallName}/limits`);
        
        // טעינה ראשונית
        const limitsSnapshot = await limitsRef.once('value');
        const limits = limitsSnapshot.val() || {};
        
        // איתחול אובייקט ההגבלות לאולם הנוכחי
        HALL_LIMITS[hallName] = {
            'יום ראשון': { male: 10, female: 10 },
            'יום שני': { male: 10, female: 10 },
            'יום שלישי': { male: 10, female: 10 },
            'יום רביעי': { male: 10, female: 10 },
            'יום חמישי': { male: 10, female: 10 }
        };

        // עדכון ההגבלות מהפיירבייס
        Object.entries(limits).forEach(([day, genderLimits]) => {
            const fullDayName = `יום ${day}`;
            if (HALL_LIMITS[hallName][fullDayName]) {
                HALL_LIMITS[hallName][fullDayName] = genderLimits;
            }
        });

        // האזנה לשינויים בזמן אמת
        limitsRef.on('value', (snapshot) => {
            const updatedLimits = snapshot.val() || {};
            
            // עדכון ההגבלות בזיכרון
            Object.entries(updatedLimits).forEach(([day, genderLimits]) => {
                const fullDayName = `יום ${day}`;
                if (HALL_LIMITS[hallName][fullDayName]) {
                    HALL_LIMITS[hallName][fullDayName] = genderLimits;
                }
            });

            // עדכון הטבלה
            loadWeeklySchedule();
        });
        
    } catch (error) {
        console.error('Error loading hall limits:', error);
        showToast('אירעה שגיאה בטעינת ההגבלות', 'error');
    }
} 