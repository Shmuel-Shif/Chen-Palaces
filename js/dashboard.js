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

    // הוספת כפתור הדפסה למנהל
    if (currentUser.isAdmin) {
        const headerRight = document.querySelector('.header-right');
        if (!document.getElementById('printSalaryBtn')) {
            const printBtn = document.createElement('button');
            printBtn.id = 'printSalaryBtn';
            printBtn.className = 'icon-btn';
            printBtn.innerHTML = '<i class="fas fa-print"></i>';
            printBtn.onclick = async () => {
                try {
                    const halls = ['אולם-בת-שבע', 'אולם-שוהם', 'אולם-ברקת', 'אולם-מרדכי', 'אולם-פרדו'];
                    let allShifts = {};

                    // איסוף הנתונים מכל האולמות
                    for (const hall of halls) {
                        const shiftsRef = database.ref(`shifts/${hall}`);
                        const snapshot = await shiftsRef.once('value');
                        const shifts = snapshot.val();
                        if (shifts) {
                            // שמירת שם האולם יחד עם המשמרות
                            Object.entries(shifts).forEach(([date, data]) => {
                                if (!allShifts[date]) allShifts[date] = {};
                                allShifts[date][hall] = data;
                            });
                        }
                    }

                    const salaryReport = await calculateSalaries(allShifts);
                    printSalaryReport(salaryReport);
                } catch (error) {
                    console.error('Error generating salary report:', error);
                    showToast('שגיאה בהפקת דוח המשכורות', 'error');
                }
            };
            headerRight.insertBefore(printBtn, headerRight.firstChild);
        }
    }
});

// התנתקות
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
});

// מעבר לדף האולם הספציפי בלחיצה על כפתור
document.querySelectorAll('.hall-btn').forEach(button => {
    button.addEventListener('click', () => {
        const hallName = button.dataset.hall;
        window.location.href = `hall.html?hall=${encodeURIComponent(hallName)}`;
    });
});

function generateSalaryTable(data) {
    let tableHTML = `
        <table class="salary-table">
            <thead>
                <tr>
                    <th>שם מלצר/ית</th>
                    <th>ימי עבודה באולמות</th>
                    <th>סה"כ ימי עבודה</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (const waiter of data) {
        let workDaysDetails = '';
        let totalDays = 0;

        // מיון הימים לפי תאריך
        const sortedShifts = waiter.shifts.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // יצירת פירוט הימים
        for (const shift of sortedShifts) {
            const date = new Date(shift.date);
            const dayName = date.toLocaleDateString('he-IL', { weekday: 'long' });
            const hallName = shift.hall.replace('אולם-', '');
            workDaysDetails += `${dayName} - ${hallName}<br>`;
            totalDays++;
        }

        tableHTML += `
            <tr>
                <td>${waiter.name}</td>
                <td>${workDaysDetails}</td>
                <td>${totalDays}</td>
            </tr>
        `;
    }

    tableHTML += `
            </tbody>
        </table>
    `;

    return tableHTML;
}

async function calculateSalaries(allShifts) {
    const salaries = {};
    
    // עיבוד הנתונים לפי תאריכים
    for (const [date, halls] of Object.entries(allShifts)) {
        for (const [hallName, genderData] of Object.entries(halls)) {
            for (const gender of ['male', 'female']) {
                if (genderData[gender]) {
                    const workers = Array.isArray(genderData[gender]) ? 
                        genderData[gender] : 
                        Object.values(genderData[gender]);

                    for (const workerId of workers) {
                        if (!salaries[workerId]) {
                            salaries[workerId] = {
                                name: 'לא נמצא שם',
                                shifts: [],
                                totalShifts: 0
                            };

                            // קבלת שם המלצר
                            try {
                                if (workerId === 'ADMIN') {
                                    salaries[workerId].name = 'שמואל שיף';
                                } else {
                                    const snapshot = await database.ref(`waiters/${workerId}`).once('value');
                                    const waiterData = snapshot.val();
                                    if (waiterData && waiterData.name) {
                                        salaries[workerId].name = waiterData.name;
                                    }
                                }
                            } catch (error) {
                                console.error('Error fetching waiter name:', error);
                            }
                        }

                        // הוספת המשמרת עם תאריך
                        const dayName = new Date(date).toLocaleDateString('he-IL', { weekday: 'long' });
                        const formattedDate = new Date(date).toLocaleDateString('en-GB'); // DD/MM/YYYY
                        salaries[workerId].shifts.push({
                            day: dayName,
                            date: formattedDate,
                            hall: hallName.replace('אולם-', '')
                        });
                        salaries[workerId].totalShifts++;
                    }
                }
            }
        }
    }

    // מיון המשמרות לפי ימים
    const dayOrder = {
        'יום ראשון': 1,
        'יום שני': 2,
        'יום שלישי': 3,
        'יום רביעי': 4,
        'יום חמישי': 5
    };

    // מיון המשמרות לכל מלצר
    for (const worker of Object.values(salaries)) {
        worker.shifts.sort((a, b) => dayOrder[a.day] - dayOrder[b.day]);
        worker.shiftDetails = worker.shifts.map(shift => 
            `${shift.day} ${shift.date} - אולם ${shift.hall}`
        ).join('\n');
    }

    return salaries;
}

function printSalaryReport(salaryReport) {
    if (Object.keys(salaryReport).length === 0) {
        showToast('אין נתונים להצגה', 'info');
        return;
    }

    const reportHTML = `
        <html dir="rtl">
        <head>
            <title>דוח משכורות</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    padding: 20px;
                }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-top: 20px;
                }
                th, td { 
                    border: 1px solid #ddd; 
                    padding: 12px; 
                    text-align: right;
                }
                th { 
                    background-color: #f2f2f2;
                    font-weight: bold;
                }
                .days-column {
                    white-space: pre-line;
                }
            </style>
        </head>
        <body>
            <h1>דוח משכורות</h1>
            <table>
                <tr>
                    <th>שם מלצר/ית</th>
                    <th>ימי עבודה באולמות</th>
                    <th>סה"כ ימי עבודה</th>
                </tr>
                ${Object.entries(salaryReport).map(([id, data]) => `
                    <tr>
                        <td>${data.name}</td>
                        <td class="days-column">${data.shiftDetails}</td>
                        <td style="text-align: center">${data.totalShifts}</td>
                    </tr>
                `).join('')}
            </table>
        </body>
        </html>
    `;

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
        showToast('נא לאפשר חלונות קופצים', 'error');
        return;
    }

    printWindow.document.write(reportHTML);
    printWindow.document.close();
    
    setTimeout(() => {
        printWindow.print();
    }, 250);
} 