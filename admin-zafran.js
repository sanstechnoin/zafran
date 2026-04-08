let reservationUnsubscribe = null;
let isSoundOn = true;
let isInitialLoad = true;

// --- 2. SECURE LOGIN & INIT ---
const ALLOWED_USERS = ["admin@zafraneuskirchen.de", "staff@zafraneuskirchen.de"]; // <--- ADD YOUR EXACT EMAILS HERE

document.addEventListener("DOMContentLoaded", () => {
    setTodayDate();
    initFinanceDates();

    // Listen for Real Authentication
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // CHECK: Is this an allowed user?
            if (ALLOWED_USERS.includes(user.email)) {
                document.getElementById('login-overlay').style.display = 'none';
                document.getElementById('admin-content').style.display = 'block';
                startRealtimeListener();
                loadAllPins();
                setTimeout(loadFinanceData, 1000);
            } else {
                // KICK OUT: Unauthorized email
                firebase.auth().signOut();
                const errEl = document.getElementById('login-error');
                if(errEl) {
                    errEl.textContent = "❌ Keine Berechtigung für dieses Terminal.";
                    errEl.style.display = 'block';
                }
                document.getElementById('login-overlay').style.display = 'flex';
                document.getElementById('admin-content').style.display = 'none';
            }
        } else {
            document.getElementById('login-overlay').style.display = 'flex';
            document.getElementById('admin-content').style.display = 'none';
        }
    });

    // Secure Login Submit
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('admin-email').value.trim();
        const pass = document.getElementById('admin-password').value;
        const btn = document.querySelector('#login-form button');
        const err = document.getElementById('login-error');

        btn.innerText = "Lade App...";
        btn.disabled = true;

        firebase.auth().signInWithEmailAndPassword(email, pass)
        .catch((error) => {
            err.innerHTML = `❌ Falsche E-Mail oder Passwort.`;
            err.style.display = 'block';
            btn.innerText = "Login";
            btn.disabled = false;
        });
    });

    document.getElementById('filter-date').addEventListener('change', startRealtimeListener);
    document.getElementById('filter-status').addEventListener('change', startRealtimeListener);
});

function setTodayDate() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    document.getElementById('filter-date').value = `${yyyy}-${mm}-${dd}`;
}

function toggleSound() {
    isSoundOn = !isSoundOn;
    const btn = document.getElementById('sound-btn');
    if(isSoundOn) {
        btn.innerHTML = "🔊 An";
        btn.style.opacity = "1";
        document.getElementById('alert-sound').play().catch(()=>{});
    } else {
        btn.innerHTML = "🔇 Aus";
        btn.style.opacity = "0.5";
    }
}

// --- 3. REAL-TIME DATA ---
function startRealtimeListener() {
    if(reservationUnsubscribe) {
        reservationUnsubscribe();
    }

    const dateVal = document.getElementById('filter-date').value;
    const statusVal = document.getElementById('filter-status').value;
    const tbody = document.getElementById('res-body');
    
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#888;">Verbinde Live-Daten...</td></tr>';

    let query = db.collection("reservations").where("date", ">=", dateVal);
    
    if (statusVal !== 'all') {
        query = query.where("status", "==", statusVal);
    }

    reservationUnsubscribe = query.onSnapshot((snapshot) => {
        const list = [];
        let totalGuests = 0;

        snapshot.docChanges().forEach((change) => {
            if (change.type === "added" && !isInitialLoad) {
                const data = change.doc.data();
                if(data.status === 'pending') {
                    triggerNotification(data.name, data.guests, data.time);
                }
            }
        });

        if (snapshot.empty) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#666;">Keine Reservierungen für ${dateVal}</td></tr>`;
            document.getElementById('total-guests-count').innerText = "0";
            isInitialLoad = false;
            return;
        }

        snapshot.forEach(doc => {
            list.push({ id: doc.id, ...doc.data() });
        });

        list.sort((a, b) => {
            if (a.date !== b.date) return a.date.localeCompare(b.date);
            return a.time.localeCompare(b.time);
        });

        tbody.innerHTML = "";
        
        list.forEach(res => {
            let g = parseInt(res.guests) || 0;
            if(res.status === 'confirmed') totalGuests += g;

            let sClass = 'status-pending';
            let sText = res.status;
            if(res.status === 'confirmed') { sClass = 'status-confirmed'; sText = 'OK'; }
            if(res.status === 'cancelled') { sClass = 'status-cancelled'; sText = 'Storno'; }
            if(res.status === 'pending') { sText = 'NEU'; }

            let actions = `<button class="btn-action btn-delete" onclick="deleteRes('${res.id}', '${res.name.replace(/'/g, "")}', '${res.email || ""}')">✕</button>`;
            if(res.status === 'pending') {
                let email = res.email || '';
                actions = `<button class="btn-action btn-accept" onclick="confirmRes('${res.id}', '${email}', '${res.name.replace(/'/g, "")}', '${res.date}', '${res.time}', '${res.guests}')">✔</button> 
                           <button class="btn-action btn-delete" onclick="deleteRes('${res.id}', '${res.name.replace(/'/g, "")}', '${email}', '${res.date}', '${res.time}')">✕</button>`;
            }

            tbody.innerHTML += `
                <tr style="${res.status==='cancelled'?'opacity:0.5':''}">
                    <td style="color:var(--gold); font-weight:bold; font-size:1rem;"><span style="color:#aaa; font-size:0.8rem;">${res.date}</span><br>${res.time}</td>
                    <td>
                        <div style="font-weight:bold;">${res.name}</div>
                        <div style="font-size:0.8rem; color:#aaa;"><a href="tel:${res.phone}" style="color:#aaa;text-decoration:none;">${res.phone}</a></div>
                    </td>
                    <td style="text-align:center; font-weight:bold; font-size:1.1rem;">${res.guests}</td>
                    <td style="font-size:0.8rem; font-style:italic; color:#aaa; max-width:100px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${res.notes || '-'}</td>
                    <td><span class="status-badge ${sClass}">${sText}</span></td>
                    <td style="text-align:right;">${actions}</td>
                </tr>
            `;
        });
        
        document.getElementById('total-guests-count').innerText = totalGuests;
        isInitialLoad = false; 
    });
}

function triggerNotification(name, guests, time) {
    if(isSoundOn) {
        const audio = document.getElementById('alert-sound');
        audio.currentTime = 0;
        audio.play().catch(e => console.log("Audio play failed", e));
    }
    const banner = document.getElementById('notification-banner');
    document.getElementById('notif-message').innerHTML = `${name}<br><span style="font-weight:normal; font-size:0.9rem;">${guests} Personen um ${time} Uhr</span>`;
    banner.classList.add('show');
    if(navigator.vibrate) navigator.vibrate([200, 100, 200]);
    setTimeout(() => { banner.classList.remove('show'); }, 6000);
}

// --- 4. SECURITY PIN MANAGERS ---

function loadAllPins() {
    // Load Driver PIN
    db.collection('settings').doc('driver_auth').get().then(doc => {
        document.getElementById('driver-pin-input').value = doc.exists ? (doc.data().pin || "") : "";
    });

    // Load Kitchen PIN
    db.collection('settings').doc('kitchen_auth').get().then(doc => {
        document.getElementById('kitchen-pin-input').value = doc.exists ? (doc.data().pin || "") : "";
    });

    // Load Waiter PIN
    db.collection('settings').doc('waiter_auth').get().then(doc => {
        document.getElementById('waiter-pin-input').value = doc.exists ? (doc.data().pin || "") : "";
    });
}

// 1. SAVE DRIVER PIN
window.saveDriverPin = function() {
    const newPin = document.getElementById('driver-pin-input').value.trim();
    const statusEl = document.getElementById('pin-status');
    
    if(newPin.length < 4) {
        statusEl.innerText = "Min 4 Zeichen";
        statusEl.className = "message-box error-msg";
        return;
    }
    
    db.collection('settings').doc('driver_auth').set({ pin: newPin })
    .then(() => {
        statusEl.innerText = "Gespeichert!";
        statusEl.className = "message-box success-msg";
        setTimeout(() => statusEl.innerText = "", 3000);
    });
};

// 2. SAVE KITCHEN PIN
window.saveKitchenPin = function() {
    const newPin = document.getElementById('kitchen-pin-input').value.trim();
    const statusEl = document.getElementById('kitchen-pin-status');
    
    if(newPin.length < 4) {
        statusEl.innerText = "Min 4 Zeichen";
        statusEl.className = "message-box error-msg";
        return;
    }
    
    db.collection('settings').doc('kitchen_auth').set({ pin: newPin })
    .then(() => {
        statusEl.innerText = "Gespeichert!";
        statusEl.className = "message-box success-msg";
        setTimeout(() => statusEl.innerText = "", 3000);
    });
};

// 3. SAVE WAITER PIN
window.saveWaiterPin = function() {
    const newPin = document.getElementById('waiter-pin-input').value.trim();
    const statusEl = document.getElementById('waiter-pin-status');
    
    if(newPin.length < 4) {
        statusEl.innerText = "Min 4 Zeichen";
        statusEl.className = "message-box error-msg";
        return;
    }
    
    db.collection('settings').doc('waiter_auth').set({ pin: newPin })
    .then(() => {
        statusEl.innerText = "Gespeichert!";
        statusEl.className = "message-box success-msg";
        setTimeout(() => statusEl.innerText = "", 3000);
    });
};

// --- 5. EMAIL ACTIONS ---
function sendAutoEmail(email, name, date, time, guests) {
    if (!email || !email.includes("@")) return;

    const params = {
        to_email: email,
        to_name: name,
        res_date: date,
        res_time: time,
        res_guests: guests
    };

    emailjs.send(RES_EMAIL_SERVICE_ID, RES_EMAIL_TEMPLATE_ID, params)
        .then(() => console.log("Email sent successfully!"))
        .catch((err) => alert("Warnung: Email konnte nicht gesendet werden.\n" + JSON.stringify(err)));
}

window.confirmRes = function(id, email, name, date, time, guests) {
    if(!confirm(`Reservierung für ${name} bestätigen und Email senden?`)) return;
    
    db.collection("reservations").doc(id).update({ status: "confirmed" })
    .then(() => {
        sendAutoEmail(email, name, date, time, guests);
        alert("Bestätigt! Email wird gesendet.");
    })
    .catch(e => alert("Fehler: " + e.message));
};

window.deleteRes = function(id, name, email, date, time) { 
    if(!confirm(`Möchten Sie die Reservierung von ${name} wirklich stornieren?`)) return;
    
    let sendRejection = false;
    if(email && email.includes("@")) {
        sendRejection = confirm("Soll eine höfliche Absage-Email gesendet werden?");
    }

    db.collection("reservations").doc(id).update({ status: "cancelled" })
    .then(() => {
        if(sendRejection) {
            const dateObj = new Date(date);
            const dateFormatted = dateObj.toLocaleDateString('de-DE'); 

            const params = {
                to_email: email,
                to_name: name,
                res_date: dateFormatted, 
                res_time: time
            };
            
            emailjs.send(RES_EMAIL_SERVICE_ID, RES_EMAIL_REJECT_ID, params)
            .then(() => alert("Storniert & Absage-Email gesendet."))
            .catch((err) => alert("Storniert, aber Email fehlgeschlagen: " + JSON.stringify(err)));
        }
    })
    .catch(e => alert("Fehler: " + e.message));
};

window.resetAndLoadToday = function() {
    setTodayDate();
    document.getElementById('filter-status').value = "all";
    startRealtimeListener();
}

// --- 6. FINANCE LOGIC ---
function initFinanceDates() {
    const today = new Date();
    document.getElementById('fin-date').value = today.toISOString().split('T')[0];
    
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    document.getElementById('fin-month').value = `${y}-${m}`;
    
    const d = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1)/7);
    document.getElementById('fin-week').value = `${y}-W${String(weekNo).padStart(2, '0')}`;
}

window.updateFinanceInputs = function() {
    const mode = document.querySelector('input[name="financeView"]:checked').value;
    document.getElementById('fin-day-group').style.display = mode === 'day' ? 'block' : 'none';
    document.getElementById('fin-week-group').style.display = mode === 'week' ? 'block' : 'none';
    document.getElementById('fin-month-group').style.display = mode === 'month' ? 'block' : 'none';
    loadFinanceData();
};

window.loadFinanceData = function() {
    const mode = document.querySelector('input[name="financeView"]:checked').value;
    let start, end;

    if(mode === 'day') {
        const dateStr = document.getElementById('fin-date').value;
        if(!dateStr) return;
        start = new Date(dateStr + 'T00:00:00');
        end = new Date(dateStr + 'T23:59:59');
    } 
    else if(mode === 'week') {
        const weekStr = document.getElementById('fin-week').value;
        if(!weekStr) return;
        const [yearStr, weekNumStr] = weekStr.split('-W');
        const simple = new Date(parseInt(yearStr), 0, 1 + (parseInt(weekNumStr) - 1) * 7);
        if (simple.getDay() <= 4) simple.setDate(simple.getDate() - simple.getDay() + 1);
        else simple.setDate(simple.getDate() + 8 - simple.getDay());
        start = new Date(simple); start.setHours(0,0,0,0);
        end = new Date(start); end.setDate(start.getDate() + 6); end.setHours(23,59,59,999);
    }
    else if(mode === 'month') {
        const monthStr = document.getElementById('fin-month').value;
        if(!monthStr) return;
        const [year, month] = monthStr.split('-');
        start = new Date(year, parseInt(month)-1, 1); start.setHours(0,0,0,0);
        end = new Date(year, parseInt(month), 0); end.setHours(23,59,59,999);
    }

    const tStart = firebase.firestore.Timestamp.fromDate(start);
    const tEnd = firebase.firestore.Timestamp.fromDate(end);

    db.collection("archived_orders")
      .where("closedAt", ">=", tStart)
      .where("closedAt", "<=", tEnd)
      .get().then(snap => {
          
        let stats = { pickup: { count: 0, total: 0 }, delivery: { count: 0, total: 0 }, 'dine-in': { count: 0, total: 0 } };
        let groupedRecords = {};

        snap.forEach(doc => {
            const data = doc.data();
            if (data.isVoided) return;
            
            const typeRaw = (data.orderType || 'pickup').toLowerCase();
            let type = 'pickup';
            if(typeRaw.includes('del')) type = 'delivery';
            else if(typeRaw.includes('dine') || typeRaw.includes('table')) type = 'dine-in';

            let groupKey = doc.id;
            
            if (type === 'dine-in' && data.table && data.closedAt) {
                let timeVal = 0;
                if (typeof data.closedAt.toMillis === 'function') timeVal = data.closedAt.toMillis();
                else if (data.closedAt.seconds) timeVal = data.closedAt.seconds * 1000;
                groupKey = `table_${data.table}_${timeVal}`;
            }

            const amount = Number(data.paidAmount || data.total || 0);

            if (!groupedRecords[groupKey]) {
                groupedRecords[groupKey] = { orderType: type, total: amount, paymentCollected: data.paymentCollected };
            }
        });

        const showCash = document.getElementById('fin-filter-cash').checked;
        const showCard = document.getElementById('fin-filter-card').checked;

        Object.values(groupedRecords).forEach(r => {
            let isCard = r.paymentCollected === 'card';
            let isCash = !isCard; 

            if (isCash && !showCash) return;
            if (isCard && !showCard) return;

            stats[r.orderType].count += 1;
            stats[r.orderType].total += r.total;
        });

        document.getElementById('fin-dine-total').innerText = stats['dine-in'].total.toFixed(2).replace('.', ',') + ' €';
        document.getElementById('fin-dine-count').innerText = stats['dine-in'].count + " Orders";
        document.getElementById('fin-pickup-total').innerText = stats['pickup'].total.toFixed(2).replace('.', ',') + ' €';
        document.getElementById('fin-pickup-count').innerText = stats['pickup'].count + " Orders";
        document.getElementById('fin-delivery-total').innerText = stats['delivery'].total.toFixed(2).replace('.', ',') + ' €';
        document.getElementById('fin-delivery-count').innerText = stats['delivery'].count + " Orders";

        const grandTotal = stats['dine-in'].total + stats['pickup'].total + stats['delivery'].total;
        const grandCount = stats['dine-in'].count + stats['pickup'].count + stats['delivery'].count;
        document.getElementById('fin-grand-total').innerText = grandTotal.toFixed(2).replace('.', ',') + ' €';
        document.getElementById('fin-grand-count').innerText = grandCount + " Orders Total";

    }).catch(err => console.error("Finance error:", err));
}
