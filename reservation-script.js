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

// --- 2. CONFIGURATION ---
const RESTAURANT_CAPACITY = 40; // Max number of guests allowed at once
const AVERAGE_DURATION_MINUTES = 120; // How long a table stays (2 hours)

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
        const guests = parseInt(document.getElementById('res-guests').value);
        const notes = document.getElementById('res-notes').value;

        // 1. Validation: Booking Times (12:00 to 20:00)
        // Split time into hours and minutes
        const [h, m] = time.split(':').map(Number);
        
        // Logic: Hour must be at least 12 AND (Hour less than 20 OR Hour is exactly 20 and Minutes is 0)
        const isValidTime = h >= 12 && (h < 20 || (h === 20 && m === 0));

        if (!isValidTime) {
            alert("Reservierungen sind nur zwischen 12:00 und 20:00 Uhr möglich.");
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerText = "Prüfe Verfügbarkeit...";

        // 2. CHECK AVAILABILITY (The "Calendar" Logic)
        const isAvailable = await checkAvailability(date, time, guests);

        if (!isAvailable) {
            alert(`Entschuldigung! Um ${time} Uhr sind wir leider voll belegt. Bitte wählen Sie eine andere Zeit.`);
            submitBtn.disabled = false;
            submitBtn.innerText = "Jetzt Reservieren";
            return;
        }

        // 3. Save Reservation
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
                status: "confirmed", // Auto-confirm if space is available
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

/**
 * Checks if there is enough space for the new reservation.
 * It downloads all reservations for that specific DATE and calculates overlaps.
 */
async function checkAvailability(date, time, newGuests) {
    try {
        // Fetch all reservations for this Date
        const snapshot = await db.collection("reservations")
                                 .where("date", "==", date)
                                 .where("status", "==", "confirmed") 
                                 .get();

        if (snapshot.empty) return true; // No bookings yet, totally free

        // Convert requested time to Minutes (e.g., 18:30 -> 1110 minutes)
        const newStart = timeToMinutes(time);
        const newEnd = newStart + AVERAGE_DURATION_MINUTES;

        let currentOccupancy = 0;

        snapshot.forEach(doc => {
            const booking = doc.data();
            const bookingStart = timeToMinutes(booking.time);
            const bookingEnd = bookingStart + AVERAGE_DURATION_MINUTES;

            // Check Overlap logic:
            // (StartA < EndB) and (EndA > StartB)
            if (newStart < bookingEnd && newEnd > bookingStart) {
                // Determine 'Guests' (handle "group" string if present)
                let g = parseInt(booking.guests);
                if (isNaN(g)) g = 10; // Assume 10 for "group" if mostly large
                currentOccupancy += g;
            }
        });

        console.log(`Checking Slot: ${time} | Occupancy: ${currentOccupancy} + New: ${newGuests} | Max: ${RESTAURANT_CAPACITY}`);

        // Check if adding new guests exceeds capacity
        if ((currentOccupancy + newGuests) > RESTAURANT_CAPACITY) {
            return false;
        }
        return true;

    } catch (e) {
        console.error("Availability Check Failed:", e);
        return true; // Fallback: allow booking if check fails
    }
}

// Helper: Convert "18:30" to minutes from midnight
function timeToMinutes(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return (h * 60) + m;
}
