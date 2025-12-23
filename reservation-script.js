// --- 1. FIREBASE CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyAVh2kVIuFcrt8Dg88emuEd9CQlqjJxDrA",
  authDomain: "zaffran-delight.firebaseapp.com",
  projectId: "zaffran-delight",
  storageBucket: "zaffran-delight.firebasestorage.app",
  messagingSenderId: "1022960860126",
  appId: "1:1022960860126:web:1e06693dea1d0247a0bb4f"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.addEventListener("DOMContentLoaded", () => {
    
    // Set Min Date to Today
    const dateInput = document.getElementById('res-date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;

    // Handle Form Submit
    const form = document.getElementById('reservation-form');
    const submitBtn = document.getElementById('submit-btn');
    const modal = document.getElementById('success-modal');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('res-name').value;
        const phone = document.getElementById('res-phone').value;
        const email = document.getElementById('res-email').value;
        const date = document.getElementById('res-date').value;
        const time = document.getElementById('res-time').value;
        const guests = document.getElementById('res-guests').value;
        const notes = document.getElementById('res-notes').value;

        // Validation: Time (12:00 to 22:00)
        const hour = parseInt(time.split(':')[0]);
        if (hour < 12 || hour >= 22) {
            alert("Unsere Öffnungszeiten sind von 12:00 bis 22:00 Uhr.");
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerText = "Senden...";

        try {
            await db.collection("reservations").add({
                name: name,
                phone: phone,
                email: email,
                date: date,
                time: time,
                guests: guests,
                notes: notes,
                status: "pending", // pending, confirmed, cancelled
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Show Success
            modal.style.display = 'flex';
            form.reset();

        } catch (error) {
            console.error("Error booking table:", error);
            alert("Ein Fehler ist aufgetreten. Bitte rufen Sie uns an.");
            submitBtn.disabled = false;
            submitBtn.innerText = "Jetzt Reservieren";
        }
    });
});
