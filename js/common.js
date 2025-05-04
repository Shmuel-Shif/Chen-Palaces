// פונקציה להוספת כפתור הווצאפ
async function addWhatsAppButton() {
    try {
        const response = await fetch('/components/whatsapp-float.html');
        const html = await response.text();
        document.body.insertAdjacentHTML('beforeend', html);
    } catch (error) {
        console.error('Error loading WhatsApp button:', error);
    }
}

// הוספת הכפתור כשהדף נטען
document.addEventListener('DOMContentLoaded', addWhatsAppButton); 