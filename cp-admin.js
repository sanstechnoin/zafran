// --- TAB SWITCHER LOGIC ---
function switchTab(tabId, clickedBtn) {
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    clickedBtn.classList.add('active');
    
    if(window.innerWidth <= 768) {
        document.querySelector('.app-main').scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    if(tabId === 'tab-reservations') loadReservations(currentResView);
    if(tabId === 'tab-finance') initFinanceTab();
}

function toggleLang(checkboxElem) {
    const isEn = checkboxElem.checked;
    changeAdminLang(isEn ? 'en' : 'de');
}

// --- TRANSLATIONS (DE/EN) ---
const translations = {
    de: {
        login_title: "Master Control", login_desc: "Autorisierter Zugriff erforderlich", login_email: "Admin E-Mail", login_pass: "Passwort", login_btn: "Anmelden",
        tab_settings: "Web", tab_menu: "Menu", tab_hours: "Zeit", tab_res: "Tische", tab_finance: "Cash", tab_banner: "Pop", tab_coupons: "Code", tab_pins: "PINs",
        sidebar_logout: "Logout 🔒",
        settings_title: "Webseiten Einstellungen", marquee_label: "Laufschrift (Marquee) Text", whatsapp_label: "WhatsApp Nummer", google_score: "Google Bewertung (z.B. 4.8)", lieferando_score: "Lieferando Bewertung (z.B. 4.6)", save_settings: "Einstellungen Speichern",
        tse_title: "POS TSE Engine (KassenSichV)", tse_desc: "Deaktivieren Sie dies für Kunden außerhalb Deutschlands oder bei Kleingewerbe.", tse_enable: "TSE Signatures Aktivieren", tse_serial: "TSE Serial Number (White-Label Override)", tse_saveBtn: "TSE Einstellungen Speichern",
        hours_title: "Öffnungszeiten & Status", emergency_mode: "🛑 Notfall / Pause (Scenario 4)", emergency_desc: "Stoppen Sie Bestellungen sofort für eine kurze Zeit.", srv_all: "Alle Services", srv_delivery: "Nur Lieferung", srv_pickup: "Nur Abholung", rest_of_day: "Rest des Tages", btn_apply_pause: "Pause Aktivieren",
        holiday_mode: "📅 Urlaub & Schließzeiten (Scenario 3)", start_date: "Start", end_date: "Ende", reason: "Grund (Optional)", add_closure: "Schließzeit Hinzufügen",
        weekly_schedule: "⏰ Wochenplan (Scenario 1 & 2)", schedule_hint: "Definieren Sie hier, wann das Restaurant geöffnet ist und wann Lieferung möglich ist.", day: "Tag", shop_hours: "Restaurant", delivery_hours: "Lieferzeiten", save_hours: "Öffnungszeiten Speichern",
        res_title: "📅 Reservierungen", res_desc: "Verwalten Sie hier alle einkommenden Tisch- und Buffetreservierungen.", res_filter_all: "Alle (All)", res_filter_conf: "Bestätigt (Approved)", res_filter_canc: "Storniert (Not Approved)", res_th_name: "Name / Kontakt", res_th_date: "Wann (Datum & Zeit)", res_th_guests: "Gäste", res_th_status: "Status", res_th_action: "Action",
        finance_title: "Finanzen Übersicht", finance_desc: "Wählen Sie einen Tag, eine Woche oder einen Monat für die Auswertung.", fin_day: "Tag", fin_week: "KW", fin_month: "Monat", fin_total: "GESAMTUMSATZ",
        banner_title: "📢 Pop-Up Banners", banner_valid_for: "Sichtbar auf (Valid For)", banner_heading: "Titel (z.B. Willkommen bei Zaffran!)", banner_msg: "Nachricht (Message)", banner_btn_vis: "🫣 Visuell", banner_btn_html: "⌨️ HTML Code", banner_html_lbl: "HTML CODE EDITOR", banner_preview_lbl: "LIVE VORSCHAU", banner_active: "Banner Aktivieren? (Wird Kunden 1x pro Sitzung angezeigt)", banner_save: "Banner Speichern",
        coupon_title: "Coupon Manager", code: "Code *", validity_mode: "Modus *", mode_range: "Datums-Bereich", mode_recurring: "Monatlich Wiederkehrend", valid_now: "Gültig ab sofort?", week_rule: "Woche des Monats", disc_type: "Typ *", value: "Wert *", min_order: "Mindestbestellwert (€)", categories: "Kategorien (Leer = Alle)", save_coupon: "Coupon Speichern", saved_coupons: "Gespeicherte Coupons", coup_th_code: "Code", coup_th_val: "Wert", coup_th_min: "Min €", coup_th_valid: "Gültigkeit", coup_th_status: "Status", coup_th_action: "Action",
        menu_title: "🍔 Menü Manager", menu_addCat: "+ Neue Kategorie", menu_desc: "Änderungen werden live in die Firebase Datenbank gespeichert.", menu_modal_title: "Artikel bearbeiten", menu_id: "Nummer (ID) *", menu_price: "Preis (€) *", menu_name: "Name *", menu_desc_lbl: "Beschreibung (Zutaten, Details)", menu_allergy: "Allergene (Komma-getrennt)", btn_cancel: "Abbrechen", btn_save: "Speichern",
        pin_title: "Access PIN Manager", pin_desc: "Verwalten Sie hier die Zugangs-PINs für alle Endgeräte.", pin_driver: "🚗 Fahrer (Driver)", pin_kitchen: "👨‍🍳 Küche (Kitchen)", pin_waiter: "🍽️ Kellner (Waiter)", pin_record: "📊 Record / Vault", pin_master: "⚠️ Master Vault (Delete)", pin_master_desc: "Passwort zum Löschen von Bestellungen.", pin_save_btn: "SAVE"
    },
    en: {
        login_title: "Master Control", login_desc: "Authorized access required", login_email: "Admin Email", login_pass: "Password", login_btn: "Login",
        tab_settings: "Web", tab_menu: "Menu", tab_hours: "Hours", tab_res: "Tables", tab_finance: "Cash", tab_banner: "Pop", tab_coupons: "Code", tab_pins: "PINs",
        sidebar_logout: "Logout 🔒",
        settings_title: "Website Settings", marquee_label: "Marquee Text", whatsapp_label: "WhatsApp Number", google_score: "Google Score (e.g., 4.8)", lieferando_score: "Delivery Score (e.g., 4.6)", save_settings: "Save Settings",
        tse_title: "POS TSE Engine (KassenSichV)", tse_desc: "Disable this for clients outside Germany or small businesses.", tse_enable: "Enable TSE Signatures", tse_serial: "TSE Serial Number (White-Label Override)", tse_saveBtn: "Save TSE Settings",
        hours_title: "Business Hours & Status", emergency_mode: "🛑 Emergency / Pause (Scenario 4)", emergency_desc: "Stop orders immediately for a short time.", srv_all: "All Services", srv_delivery: "Delivery Only", srv_pickup: "Pickup Only", rest_of_day: "Rest of the Day", btn_apply_pause: "Activate Pause",
        holiday_mode: "📅 Holidays & Closures (Scenario 3)", start_date: "Start", end_date: "End", reason: "Reason (Optional)", add_closure: "Add Closure",
        weekly_schedule: "⏰ Weekly Schedule (Scenario 1 & 2)", schedule_hint: "Define when the restaurant is open and when delivery is available.", day: "Day", shop_hours: "Store Open", delivery_hours: "Delivery Hours", save_hours: "Save Hours",
        res_title: "📅 Reservations", res_desc: "Manage all incoming table and appointments here.", res_filter_all: "All", res_filter_conf: "Confirmed (Approved)", res_filter_canc: "Cancelled (Not Approved)", res_th_name: "Name / Contact", res_th_date: "When (Date & Time)", res_th_guests: "Guests", res_th_status: "Status", res_th_action: "Action",
        finance_title: "Financial Overview", finance_desc: "Select a day, week, or month for the evaluation.", fin_day: "Day", fin_week: "Week", fin_month: "Month", fin_total: "GRAND TOTAL",
        banner_title: "📢 Pop-Up Banners", banner_valid_for: "Visible on (Valid For)", banner_heading: "Title (e.g., Welcome!)", banner_msg: "Message", banner_btn_vis: "🫣 Visual", banner_btn_html: "⌨️ HTML Code", banner_html_lbl: "HTML CODE EDITOR", banner_preview_lbl: "LIVE PREVIEW", banner_active: "Enable Banner? (Shown to customers 1x per session)", banner_save: "Save Banner",
        coupon_title: "Coupon Manager", code: "Code *", validity_mode: "Mode *", mode_range: "Date Range", mode_recurring: "Monthly Recurring", valid_now: "Valid immediately?", week_rule: "Week of the Month", disc_type: "Type *", value: "Value *", min_order: "Min. Order (€)", categories: "Categories (Empty = All)", save_coupon: "Save Coupon", saved_coupons: "Saved Coupons", coup_th_code: "Code", coup_th_val: "Value", coup_th_min: "Min €", coup_th_valid: "Validity", coup_th_status: "Status", coup_th_action: "Action",
        menu_title: "🍔 Menu Manager", menu_addCat: "+ New Category", menu_desc: "Changes are saved live to the Firebase database.", menu_modal_title: "Edit Item", menu_id: "Number (ID) *", menu_price: "Price (€) *", menu_name: "Name *", menu_desc_lbl: "Description (Ingredients, Details)", menu_allergy: "Allergens (Comma-separated)", btn_cancel: "Cancel", btn_save: "Save",
        pin_title: "Access PIN Manager", pin_desc: "Manage the access PINs for all end devices here.", pin_driver: "🚗 Driver", pin_kitchen: "👨‍🍳 Kitchen", pin_waiter: "🍽️ Waiter", pin_record: "📊 Record / Vault", pin_master: "⚠️ Master Vault (Delete)", pin_master_desc: "Password for deleting records.", pin_save_btn: "SAVE"
    }
};

let currentLang = localStorage.getItem('admin_lang') || 'de';

function changeAdminLang(lang) {
    currentLang = lang;
    localStorage.setItem('admin_lang', lang);
    
    const isEn = (lang === 'en');
    document.querySelectorAll('.lang-checkbox').forEach(cb => cb.checked = isEn);
    document.querySelectorAll('.lang-label.de').forEach(el => el.classList.toggle('active', !isEn));
    document.querySelectorAll('.lang-label.en').forEach(el => el.classList.toggle('active', isEn));

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if(translations[lang][key]) {
            if(el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                if (el.type === 'submit' || el.type === 'button') {
                    el.value = translations[lang][key];
                } else {
                    el.placeholder = translations[lang][key];
                }
            } else if (el.tagName === 'BUTTON' && el.querySelector('.tab-text')) {
                // Ignore, as the inner span is handled separately
                el.innerText = translations[lang][key];
            } else {
                el.innerText = translations[lang][key];
            }
        }
    });
    if (typeof renderWeeklySchedule === 'function') renderWeeklySchedule();
}

// --- NEW: Custom Admin Alert Helper ---
window.showAdminAlert = function(msg) {
    document.getElementById('admin-alert-message').innerText = msg;
    document.getElementById('admin-alert-modal').style.display = 'flex';
};

// 🚨 MASTER ADMIN ONLY ACCESS 🚨
const MASTER_EMAIL = "admin@zafraneuskirchen.de"; // <--- CHANGE THIS TO YOUR ACTUAL ADMIN EMAIL

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('html-mode-container').style.display = 'none';

    // 1. Listen for Authentication State from Firebase
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // CHECK: Is this the Master Admin?
            if (user.email === MASTER_EMAIL) {
                initAdmin();
            } else {
                // KICK OUT
                firebase.auth().signOut();
                const errEl = document.getElementById('login-error');
                if(errEl) {
                    errEl.textContent = "❌ Access Denied: Master Admin Only.";
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

    // 2. Secure Login Form Submit
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('admin-email').value.trim(); 
        const pass = document.getElementById('admin-password').value;
        const loginBtn = document.querySelector('#login-form button');

        loginBtn.innerText = "Authenticating..."; 
        loginBtn.disabled = true;
        
        firebase.auth().signInWithEmailAndPassword(email, pass)
        .catch((error) => { 
            const errEl = document.getElementById('login-error');
            errEl.textContent = "❌ Falsche E-Mail oder Passwort."; 
            errEl.style.display = 'block';
            loginBtn.innerText = "Login"; 
            loginBtn.disabled = false; 
        });
    });
});

function initAdmin() {
    document.getElementById('login-overlay').style.display = 'none';
    document.getElementById('admin-content').style.display = 'block'; 
    changeAdminLang(currentLang);
    loadSettings(); loadHours(); loadCoupons(); loadAllPins(); loadSpecialBanner(); loadAdminMenu();
}

// ==========================================
// 0. FINANCE MANAGER
// ==========================================
function initFinanceTab() {
    if(!document.getElementById('fin-date').value) {
        const today = new Date();
        document.getElementById('fin-date').valueAsDate = today;
        
        const d = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
        const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1)/7);
        document.getElementById('fin-week').value = `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2,'0')}`;
        document.getElementById('fin-month').value = `${today.getFullYear()}-${(today.getMonth()+1).toString().padStart(2,'0')}`;
        
        loadFinanceData();
    }
}

function updateFinanceInputs() {
    const mode = document.querySelector('input[name="financeView"]:checked').value;
    document.getElementById('fin-day-group').style.display = mode === 'day' ? 'block' : 'none';
    document.getElementById('fin-week-group').style.display = mode === 'week' ? 'block' : 'none';
    document.getElementById('fin-month-group').style.display = mode === 'month' ? 'block' : 'none';
    loadFinanceData();
}

function loadFinanceData() {
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
            
            const typeRaw = (data.orderType || 'pickup').toLowerCase();
            let type = 'pickup';
            if(typeRaw.includes('del')) type = 'delivery';
            else if(typeRaw.includes('dine') || typeRaw.includes('table')) type = 'dine-in';

            let groupKey = doc.id;
            
            if (type === 'dine-in' && data.table && data.closedAt) {
                let timeVal = 0;
                if (typeof data.closedAt.toMillis === 'function') {
                    timeVal = data.closedAt.toMillis();
                } else if (data.closedAt.seconds) {
                    timeVal = data.closedAt.seconds * 1000;
                }
                groupKey = `table_${data.table}_${timeVal}`;
            }

            const amount = Number(data.paidAmount || data.total || 0);

            if (!groupedRecords[groupKey]) {
                groupedRecords[groupKey] = { 
                    orderType: type, 
                    total: amount, 
                    paymentCollected: data.paymentCollected 
                };
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

// ==========================================
// 0.5 RESERVATIONS MANAGER
// ==========================================
let currentResView = 'upcoming';
let allReservationsRaw = [];

function applyArchiveFilter() {
    renderReservations();
}

function loadReservations(view = 'upcoming') {
    currentResView = view;
    document.getElementById('btn-upcoming').className = view === 'upcoming' ? 'btn-small btn-blue' : 'btn-small btn-outline';
    document.getElementById('btn-archived').className = view === 'archived' ? 'btn-small btn-blue' : 'btn-small btn-outline';
    document.getElementById('archived-filters').style.display = view === 'archived' ? 'flex' : 'none';
    
    db.collection("reservations").onSnapshot(snap => {
        allReservationsRaw = [];
        snap.forEach(doc => allReservationsRaw.push({ id: doc.id, ...doc.data() }));
        
        allReservationsRaw.sort((a, b) => {
            const timeA = a.timestamp || new Date(a.date).getTime() || 0;
            const timeB = b.timestamp || new Date(b.date).getTime() || 0;
            if(view === 'upcoming') return timeA - timeB; 
            return timeB - timeA; 
        });

        renderReservations();
    });
}

function renderReservations() {
    const tbody = document.getElementById('res-body');
    tbody.innerHTML = "";
    let hasRecords = false;

    const today = new Date();
    today.setHours(0,0,0,0);
    
    const archiveFilter = document.getElementById('archive-status').value;

    allReservationsRaw.forEach(d => {
        const resDate = new Date(d.date + "T23:59:59");
        const isPast = resDate < today;
        const isCancelled = d.status === 'cancelled';

        if (currentResView === 'upcoming') {
            if (isPast || isCancelled) return; 
        } else { 
            if (!isPast && !isCancelled) return; 
            if (archiveFilter === 'confirmed' && d.status !== 'confirmed') return;
            if (archiveFilter === 'cancelled' && d.status !== 'cancelled') return;
        }

        hasRecords = true;
        const niceDate = resDate.toLocaleDateString('de-DE'); 
        const timeStr = d.time || "";
        
        let statusBadge = `<span class="badge" style="background:#ffc107; color:#000;">Neu</span>`;
        if(d.status === 'confirmed') statusBadge = `<span class="badge" style="background:var(--success-green); color:#fff;">Bestätigt</span>`;
        if(d.status === 'cancelled') statusBadge = `<span class="badge" style="background:var(--danger-red); color:#fff;">Storniert</span>`;

        let actions = "";
        if(currentResView === 'upcoming') {
            if(d.status !== 'confirmed') actions += `<button class="btn-action-ok" onclick="acceptRes('${d.id}', '${d.name}', '${d.email}', '${d.date}', '${timeStr}', '${d.guests}')" title="Bestätigen">✓</button>`;
            actions += `<button class="btn-action-x" onclick="deleteRes('${d.id}', '${d.name}', '${d.email}', '${d.date}', '${timeStr}')" title="Stornieren">X</button>`;
        } else {
            actions += `<button class="btn-action-x" onclick="hardDeleteRes('${d.id}')" title="Endgültig Löschen" style="background:#333;">🗑️</button>`;
        }

        const row = `<tr>
            <td><strong style="color:var(--gold);">${d.name}</strong><br><span style="font-size:0.8rem; color:#aaa;">${d.phone || ''} <br> ${d.email || ''}</span></td>
            <td>${niceDate}<br><span style="color:#aaa; font-size:0.8rem;">${timeStr}</span></td>
            <td style="font-weight:bold; font-size:1.1rem;">${d.guests}</td>
            <td>${statusBadge}</td>
            <td>${actions}</td>
        </tr>`;
        tbody.insertAdjacentHTML('beforeend', row);
    });

    if(!hasRecords) tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px; color:#888;">Keine Einträge gefunden.</td></tr>`;
}

window.hardDeleteRes = function(id) {
    if(confirm("Diesen Eintrag endgültig aus der Datenbank löschen?")) {
        db.collection("reservations").doc(id).delete();
    }
}

window.acceptRes = function(id, name, email, date, time, guests) {
    if(!confirm(`Reservierung von ${name} für ${guests} Personen bestätigen?`)) return;
    db.collection("reservations").doc(id).update({ status: "confirmed" })
    .then(() => {
        if(email && email.includes("@")) {
            const params = { to_email: email, to_name: name, res_date: new Date(date).toLocaleDateString('de-DE'), res_time: time, res_guests: guests };
            emailjs.send(CP_EMAIL_SERVICE_ID, CP_EMAIL_ACCEPT_ID, params).then(() => showAdminAlert("Bestätigt & Email gesendet.")).catch(() => showAdminAlert("Bestätigt, Email fehlgeschlagen."));
        } else showAdminAlert("Reservierung bestätigt.");
    }).catch(e => showAdminAlert("Fehler: " + e.message));
};

window.deleteRes = function(id, name, email, date, time) { 
    if(!confirm(`Möchten Sie die Reservierung von ${name} wirklich stornieren?`)) return;
    let sendRejection = false;
    if(email && email.includes("@")) sendRejection = confirm("Soll eine höfliche Absage-Email gesendet werden?");
    db.collection("reservations").doc(id).update({ status: "cancelled" })
    .then(() => {
        if(sendRejection) {
            const params = { to_email: email, to_name: name, res_date: new Date(date).toLocaleDateString('de-DE'), res_time: time };
            emailjs.send(CP_EMAIL_SERVICE_ID, CP_EMAIL_REJECT_ID, params).then(() => showAdminAlert("Storniert & Absage-Email gesendet.")).catch(() => showAdminAlert("Storniert, Email fehlgeschlagen."));
        } else showAdminAlert("Storniert.");
    }).catch(e => showAdminAlert("Fehler: " + e.message));
};

// ==========================================
// 1. GENERAL SETTINGS
// ==========================================
function loadSettings() {
    db.collection('settings').doc('general').get().then((doc) => {
        if (doc.exists) {
            const data = doc.data();
            document.getElementById('marqueeText').value = data.marqueeText || "";
            document.getElementById('whatsappNumber').value = data.whatsappNumber || "";
            document.getElementById('googleScore').value = data.googleScore || "";
            document.getElementById('lieferandoScore').value = data.lieferandoScore || "";
        }
    });

    db.collection('settings').doc('tse_config').get().then(doc => {
        if (doc.exists) {
            document.getElementById('admin-tse-toggle').checked = doc.data().enabled || false;
            document.getElementById('admin-tse-serial').value = doc.data().serialNumber || "";
        }
    });
}

document.getElementById('settings-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('settingsBtn'); btn.disabled = true;
    try {
        await db.collection('settings').doc('general').set({
            marqueeText: document.getElementById('marqueeText').value.trim(),
            whatsappNumber: document.getElementById('whatsappNumber').value.trim(),
            googleScore: document.getElementById('googleScore').value.trim(),
            lieferandoScore: document.getElementById('lieferandoScore').value.trim(),
            updatedAt: new Date()
        }, { merge: true });
        showAdminAlert(currentLang === 'de' ? "Gespeichert!" : "Saved!");
    } catch (err) { showAdminAlert("Error: " + err.message); }
    btn.disabled = false;
});

window.saveTseConfig = function() {
    const isEnabled = document.getElementById('admin-tse-toggle').checked;
    const serial = document.getElementById('admin-tse-serial').value.trim();
    
    db.collection('settings').doc('tse_config').set({
        enabled: isEnabled,
        serialNumber: serial || "ER3984719002_SIM"
    }).then(() => {
        showAdminAlert(currentLang === 'de' ? "TSE Einstellungen erfolgreich gespeichert!" : "TSE Settings Saved Successfully!");
    }).catch(err => {
        showAdminAlert("Error saving TSE settings.");
        console.error(err);
    });
};

// ==========================================
// 2. HOURS & SCHEDULE LOGIC
// ==========================================
let weeklyConfig = {}; let holidays = []; let pauseConfig = null;
const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const daysLabel = { de: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'], en: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] };

function loadHours() {
    db.collection('settings').doc('hours').get().then((doc) => {
        if(doc.exists) {
            const data = doc.data(); weeklyConfig = data.weekly || {}; holidays = data.holidays || []; pauseConfig = data.pause || null;
            renderWeeklySchedule(); renderHolidays(); renderPauseStatus();
        } else {
            days.forEach(d => { weeklyConfig[d] = { open: true, start: "12:00", end: "21:00", delStart: "", delEnd: "" }; });
            renderWeeklySchedule();
        }
    });
}

function renderWeeklySchedule() {
    const container = document.getElementById('weekly-schedule-container'); if(!container) return;
    container.innerHTML = "";
    days.forEach((day, index) => {
        const conf = weeklyConfig[day] || { open: false, start: "", end: "", delStart: "", delEnd: "" };
        const dayName = daysLabel[currentLang][index];
        const html = `
        <div class="hours-row" id="row-${day}">
            <div class="day-label"><label class="checkbox-item" style="margin:0;"><input type="checkbox" onchange="toggleDay('${day}')" ${conf.open ? 'checked' : ''} id="check-${day}"> ${dayName}</label></div>
            <div style="display:flex; gap:5px; align-items:center;"><input type="time" id="start-${day}" value="${conf.start}" ${!conf.open ? 'disabled' : ''}><span>-</span><input type="time" id="end-${day}" value="${conf.end}" ${!conf.open ? 'disabled' : ''}></div>
            <div style="display:flex; gap:5px; align-items:center;"><input type="time" id="delStart-${day}" value="${conf.delStart}" ${!conf.open ? 'disabled' : ''} placeholder="Same"><span>-</span><input type="time" id="delEnd-${day}" value="${conf.delEnd}" ${!conf.open ? 'disabled' : ''} placeholder="Same"></div>
        </div>`;
        container.insertAdjacentHTML('beforeend', html);
    });
}

window.toggleDay = function(day) {
    const isOpen = document.getElementById(`check-${day}`).checked;
    ['start', 'end', 'delStart', 'delEnd'].forEach(prefix => {
        const input = document.getElementById(`${prefix}-${day}`); input.disabled = !isOpen; if(!isOpen) input.value = "";
    });
}

window.saveHours = async function() {
    const newConfig = {};
    days.forEach(day => {
        newConfig[day] = {
            open: document.getElementById(`check-${day}`).checked, start: document.getElementById(`start-${day}`).value,
            end: document.getElementById(`end-${day}`).value, delStart: document.getElementById(`delStart-${day}`).value, delEnd: document.getElementById(`delEnd-${day}`).value
        };
    });
    const btn = document.querySelector('button[onclick="saveHours()"]'); btn.disabled = true; btn.innerText = "...";
    try {
        await db.collection('settings').doc('hours').set({ weekly: newConfig, holidays: holidays, pause: pauseConfig }, { merge: true });
        showAdminAlert(currentLang === 'de' ? "Gespeichert!" : "Saved!");
    } catch(e) { showAdminAlert(e.message); }
    btn.disabled = false; btn.innerText = translations[currentLang].save_hours;
}

window.applyPause = async function() {
    const type = document.getElementById('pauseServiceType').value; const duration = document.getElementById('pauseDuration').value; let until = 0;
    if(duration === 'today') { const now = new Date(); now.setHours(23, 59, 59, 999); until = now.getTime(); } 
    else { until = Date.now() + (parseInt(duration) * 60000); }
    pauseConfig = { active: true, type: type, until: until };
    await db.collection('settings').doc('hours').set({ pause: pauseConfig }, { merge: true });
    renderPauseStatus();
}

window.clearPause = async function() { pauseConfig = null; await db.collection('settings').doc('hours').set({ pause: null }, { merge: true }); renderPauseStatus(); }

function renderPauseStatus() {
    const info = document.getElementById('active-pause-info'); const text = document.getElementById('pause-text');
    if(pauseConfig && pauseConfig.active && pauseConfig.until > Date.now()) {
        const timeStr = new Date(pauseConfig.until).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        text.innerText = `${pauseConfig.type.toUpperCase()} PAUSED UNTIL ${timeStr}`; info.style.display = "block";
    } else { info.style.display = "none"; }
}

window.addHoliday = async function() {
    const start = document.getElementById('holidayStart').value; const end = document.getElementById('holidayEnd').value; const reason = document.getElementById('holidayReason').value;
    if(!start || !end) return showAdminAlert("Start & End required");
    holidays.push({ start, end, reason, id: Date.now() });
    await db.collection('settings').doc('hours').set({ holidays: holidays }, { merge: true });
    renderHolidays(); document.getElementById('holidayStart').value = ""; document.getElementById('holidayEnd').value = "";
}

window.removeHoliday = async function(id) {
    holidays = holidays.filter(h => h.id !== id); await db.collection('settings').doc('hours').set({ holidays: holidays }, { merge: true }); renderHolidays();
}

function renderHolidays() {
    const list = document.getElementById('holidayList'); list.innerHTML = ""; holidays.sort((a,b) => new Date(a.start) - new Date(b.start));
    holidays.forEach(h => {
        const startDate = new Date(h.start).toLocaleDateString() + " " + new Date(h.start).toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'});
        const endDate = new Date(h.end).toLocaleDateString() + " " + new Date(h.end).toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'});
        const style = new Date(h.end) < new Date() ? "opacity:0.5;" : "border-left:3px solid var(--danger-red);";
        const item = `<div class="holiday-item" style="${style}"><div><div style="font-weight:bold; color:var(--gold);">${h.reason || 'Closed'}</div><div style="font-size:0.8rem; color:#ccc;">${startDate} ➝ ${endDate}</div></div><button class="btn-action-x" onclick="removeHoliday(${h.id})">X</button></div>`;
        list.insertAdjacentHTML('beforeend', item);
    });
}

// ==========================================
// 3. MASTER PIN MANAGER
// ==========================================
function loadAllPins() {
    ['driver', 'kitchen', 'waiter', 'record', 'vault'].forEach(type => {
        db.collection('settings').doc(`${type}_auth`).get().then(doc => {
            if(doc.exists) {
                const input = document.getElementById(`${type}-pin-input`);
                if(input) input.value = doc.data().pin || "";
            }
        });
    });
}

window.savePin = function(type) {
    const newPin = document.getElementById(`${type}-pin-input`).value.trim();
    const statusEl = document.getElementById(`${type}-pin-status`);
    
    if(newPin.length < 4) {
        statusEl.innerText = "❌ Min 4 chars";
        statusEl.className = "message-box error";
        statusEl.style.display = "block";
        return;
    }
    
    db.collection('settings').doc(`${type}_auth`).set({ pin: newPin })
    .then(() => { 
        statusEl.innerText = "✅ Saved!";
        statusEl.className = "message-box success";
        statusEl.style.display = "block";
        setTimeout(() => { statusEl.style.display = "none"; }, 3000);
    })
    .catch(err => {
        statusEl.innerText = "❌ Error";
        statusEl.className = "message-box error";
        statusEl.style.display = "block";
    });
};

// ==========================================
// 4. COUPON MANAGER
// ==========================================
const couponForm = document.getElementById('coupon-form');

function loadCoupons() {
    const tableBody = document.getElementById('coupons-body');
    db.collection("coupons").orderBy("createdAt", "desc").get().then((snap) => {
        tableBody.innerHTML = "";
        snap.forEach(doc => {
            const d = doc.data(); const isPercent = d.discountType === 'percent';
            
            const isActive = d.active !== false; 
            const rowOpacity = isActive ? '1' : '0.4';
            
            let badge = d.discountType === 'gratis' ? 'badge-fixed' : (isPercent ? 'badge-percent' : 'badge-fixed');
            let val = d.discountType === 'gratis' ? '🎁 GRATIS' : (isPercent ? `${d.discountValue}%` : `${d.discountValue}€`);
            const eyeColor = d.showDropdown ? 'var(--success-green)' : '#444';
            const micColor = d.showBanner ? 'var(--gold)' : '#444';

            const row = `<tr style="opacity: ${rowOpacity}; transition: 0.3s;">
                <td style="color:var(--gold); font-weight:bold;">
                    ${d.code}
                    ${!isActive ? '<br><span style="background:#ff4444; color:white; font-size:0.7rem; padding: 2px 6px; border-radius: 4px; display:inline-block; margin-top:4px;">Inactive</span>' : ''}
                </td>
                <td><span class="badge ${badge}">${val}</span></td>
                <td>${d.minOrder || 0}€</td>
                <td>${d.mode === 'recurring' ? 'Recurring' : (d.validUntil || d.expiryDate || 'N/A')}</td>
                <td>
                    <button style="background:${eyeColor}; border:none; border-radius:4px; padding:5px; cursor:pointer; margin-right:5px; font-size:1.2rem;" onclick="toggleCouponFlag('${d.code}', 'showDropdown')" title="Show Dropdown">🫣</button>
                    <button style="background:${micColor}; border:none; border-radius:4px; padding:5px; cursor:pointer; margin-right:5px; font-size:1.2rem;" onclick="toggleCouponFlag('${d.code}', 'showBanner')" title="Show Banner">🎙️</button>
                </td>
                <td style="display:flex; gap:8px; align-items:center;">
                    <button style="background:transparent; border:1px solid ${isActive ? '#555' : '#ff4444'}; border-radius:4px; padding:2px 8px; cursor:pointer; font-size:1.2rem;" onclick="toggleCouponActive('${d.code}', ${isActive})" title="Toggle Active">${isActive ? '👁️' : '🚫'}</button>
                    <button class="btn-action-x" onclick="deleteCoupon('${d.code}')">X</button>
                </td>
            </tr>`;
            tableBody.innerHTML += row;
        });
    });
}

window.toggleCouponActive = function(code, currentState) { 
    db.collection("coupons").doc(code).update({ active: !currentState }).then(loadCoupons); 
}

window.deleteCoupon = function(code) { if(confirm("Delete " + code + "?")) db.collection("coupons").doc(code).delete().then(loadCoupons); }
window.toggleDateInputs = function() { const mode = document.getElementById('validityMode').value; document.getElementById('rangeInputs').style.display = mode === 'range' ? 'block' : 'none'; document.getElementById('recurringInputs').style.display = mode === 'recurring' ? 'block' : 'none'; }
window.toggleStartField = function() { const now = document.getElementById('startNow').checked; document.getElementById('startDateGroup').style.display = now ? 'none' : 'block'; }
window.toggleDiscountFields = function() { const type = document.querySelector('input[name="discountType"]:checked').value; document.getElementById('gratisFields').style.display = type === 'gratis' ? 'block' : 'none'; document.getElementById('valueGroup').style.display = type === 'gratis' ? 'none' : 'block'; document.getElementById('discountValue').required = (type !== 'gratis'); }
window.toggleCouponFlag = function(code, flag) { db.collection("coupons").doc(code).get().then(doc => { db.collection("coupons").doc(code).update({ [flag]: !(doc.data()[flag] || false) }).then(loadCoupons); }); }

couponForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = document.getElementById('code').value.toUpperCase().trim(); const mode = document.getElementById('validityMode').value; const discountType = document.querySelector('input[name="discountType"]:checked').value;
    const data = { code, mode, discountType, validFor: document.getElementById('validFor').value, discountValue: discountType === 'gratis' ? 0 : parseFloat(document.getElementById('discountValue').value), minOrder: parseFloat(document.getElementById('minOrder').value) || 0, minMainDishes: parseInt(document.getElementById('minMainDishes').value) || 0, promoItemName: document.getElementById('promoItemName').value.trim(), promoAskChoice: document.getElementById('promoAskChoice').checked, createdAt: new Date().toISOString(), validCategories: [] };
    document.querySelectorAll('input[name="cat"]:checked').forEach(cb => { data.validCategories.push(cb.value); });
    if(data.validCategories.length === 0) data.validCategories = 'all';
    if(mode === 'range') { if(document.getElementById('startNow').checked) data.validFrom = new Date().toISOString().split('T')[0]; else data.validFrom = document.getElementById('startDate').value; data.validUntil = document.getElementById('expiry').value; } 
    else { data.recurringRule = document.getElementById('recurringRule').value; }
    await db.collection("coupons").doc(code).set(data); couponForm.reset(); document.getElementById('startNow').checked = true; loadCoupons(); showAdminAlert("Coupon Saved!");
});

// ==========================================
// 5. BANNER LOGIC (RICH TEXT & CODE EDITOR)
// ==========================================
var quill = new Quill('#editor-container', { theme: 'snow', placeholder: 'Schreiben Sie hier Ihre Message...', modules: { toolbar: [['bold', 'italic', 'underline'], [{ 'color': [] }, { 'background': [] }], [{ 'list': 'ordered'}, { 'list': 'bullet' }], [{ 'align': [] }], ['link', 'clean']] } });

const editorContainer = document.getElementById('editor-container'); 
const htmlEditor = document.getElementById('html-editor'); 
const htmlModeContainer = document.getElementById('html-mode-container'); 
const htmlPreview = document.getElementById('html-preview');
let isHtmlMode = false;

htmlEditor.addEventListener('input', () => { htmlPreview.innerHTML = htmlEditor.value; });

window.setBannerMode = function(mode) {
    const btnVis = document.getElementById('btn-mode-visual');
    const btnHtml = document.getElementById('btn-mode-html');
    const toolbar = document.querySelector('.ql-toolbar');

    if(mode === 'html') {
        isHtmlMode = true;
        btnVis.style.background = 'transparent'; btnVis.style.color = '#888';
        btnHtml.style.background = 'var(--gold)'; btnHtml.style.color = '#000';
        
        htmlEditor.value = quill.root.innerHTML; 
        htmlPreview.innerHTML = htmlEditor.value; 
        
        editorContainer.style.display = 'none'; 
        if(toolbar) toolbar.style.display = 'none'; 
        htmlModeContainer.style.display = 'flex';
    } else {
        isHtmlMode = false;
        btnHtml.style.background = 'transparent'; btnHtml.style.color = '#888';
        btnVis.style.background = 'var(--gold)'; btnVis.style.color = '#000';
        
        quill.clipboard.dangerouslyPasteHTML(htmlEditor.value); 
        htmlModeContainer.style.display = 'none'; 
        editorContainer.style.display = 'block'; 
        if(toolbar) toolbar.style.display = 'block';
    }
};

function loadSpecialBanner() {
    db.collection('settings').doc('banner').get().then(doc => {
        if(doc.exists) {
            const data = doc.data(); 
            document.getElementById('bannerTitle').value = data.title || ""; 
            document.getElementById('bannerValidFor').value = data.validFor || "both"; 
            document.getElementById('bannerActive').checked = data.active || false;
            
            const msg = data.message || "";
            if(msg.includes('<div') || msg.includes('style=')) {
                quill.root.innerHTML = msg; 
                setBannerMode('html');
            } else { 
                quill.clipboard.dangerouslyPasteHTML(msg); 
                setBannerMode('visual');
            }
        }
    });
}

document.getElementById('banner-form').addEventListener('submit', async (e) => {
    e.preventDefault(); 
    const finalMessage = isHtmlMode ? htmlEditor.value : quill.root.innerHTML;
    await db.collection('settings').doc('banner').set({ 
        title: document.getElementById('bannerTitle').value, 
        message: finalMessage, 
        validFor: document.getElementById('bannerValidFor').value, 
        active: document.getElementById('bannerActive').checked 
    });
    showAdminAlert("Pop-Up Banner gespeichert!");
});

// ==========================================
// 6. MENU MANAGER LOGIC
// ==========================================
let adminMenuData = [];

function loadAdminMenu() {
    db.collection('settings').doc('menu').get().then(doc => {
        if (doc.exists) {
            adminMenuData = doc.data().menuData || [];
            renderAdminMenu();
        }
    });
}

function renderAdminMenu() {
    const container = document.getElementById('admin-menu-container');
    let html = '';
    
    adminMenuData.forEach((cat, catIndex) => {
        const isCatActive = cat.active !== false; 
        const catEye = isCatActive ? '🫣' : '🚫';
        const catOpacity = isCatActive ? '1' : '0.4';

        html += `
        <div style="background:#111; border:1px solid ${isCatActive ? '#333' : '#ff4444'}; border-radius:8px; margin-bottom:20px; overflow:hidden; opacity:${catOpacity}; transition: 0.3s;">
            
            <div style="background:#222; padding:15px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--gold); flex-wrap:wrap; gap:10px;">
                <h3 style="margin:0; color:var(--gold); font-size:1.2rem; border:none; padding:0; flex:1; min-width:120px;">${cat.category}</h3>
                <div style="display:flex; gap:8px;">
                    <button style="width:42px; height:42px; padding:0; margin:0; border-radius:6px; background:#555; color:white; font-size:1.2rem; border:none;" onclick="toggleCategoryVisibility(${catIndex})" title="Sichtbarkeit">${catEye}</button>
                    <button style="width:42px; height:42px; padding:0; margin:0; border-radius:6px; background:var(--info-blue); color:white; font-size:1.2rem; border:none;" onclick="openItemModal(${catIndex}, -1)" title="Artikel hinzufügen">➕</button>
                    <button style="width:42px; height:42px; padding:0; margin:0; border-radius:6px; background:var(--danger-red); color:white; font-size:1.2rem; border:none;" onclick="deleteCategory(${catIndex})" title="Kategorie löschen">🗑️</button>
                </div>
            </div>

            <div style="padding:0 15px;">`;
        
        if (!cat.items || cat.items.length === 0) {
            html += `<div style="padding:15px 0; color:#888; text-align:center;">Keine Artikel vorhanden.</div>`;
        } else {
            cat.items.forEach((item, itemIndex) => {
                const isItemActive = item.active !== false;
                const itemEye = isItemActive ? '🫣' : '🚫';
                const itemOpacity = isItemActive ? '1' : '0.3';
                const allergyStr = item.allergy ? `<span class="badge" style="background:#ff4444; color:white; font-size:0.7rem; margin-left:8px; padding:2px 4px;">${item.allergy}</span>` : '';
                
                html += `
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #333; padding:12px 0; gap:10px; opacity:${itemOpacity}; transition: 0.3s;">
                    
                    <div style="font-weight:bold; color:var(--gold); width:35px; font-size:1.1rem;">${item.id}</div>
                    
                    <div style="flex:1; line-height:1.3; min-width:80px;">
                        <strong style="font-size:1.05rem;">${item.name}</strong> ${allergyStr}<br>
                        <span style="font-size:0.85rem; color:#aaa;">${item.desc || ''}</span>
                    </div>
                    
                    <div style="font-weight:bold; font-size:1.1rem; text-align:right;">${parseFloat(item.price).toFixed(2)}€</div>
                    
                    <div style="display:flex; gap:6px;">
                        <button style="width:36px; height:36px; padding:0; margin:0; border-radius:6px; background:#555; color:white; font-size:1.1rem; border:none;" onclick="toggleItemVisibility(${catIndex}, ${itemIndex})" title="Sichtbarkeit">${itemEye}</button>
                        <button style="width:36px; height:36px; padding:0; margin:0; border-radius:6px; background:#444; color:white; font-size:1.1rem; border:none;" onclick="openItemModal(${catIndex}, ${itemIndex})" title="Bearbeiten">✏️</button>
                        <button style="width:36px; height:36px; padding:0; margin:0; border-radius:6px; background:var(--danger-red); color:white; font-size:1.1rem; border:none;" onclick="deleteItem(${catIndex}, ${itemIndex})" title="Löschen">❌</button>
                    </div>
                </div>`;
            });
        }
        
        html += `</div></div>`;
    });
    
    container.innerHTML = html;
}

window.toggleCategoryVisibility = function(catIndex) {
    if (adminMenuData[catIndex].active === undefined) adminMenuData[catIndex].active = true;
    adminMenuData[catIndex].active = !adminMenuData[catIndex].active;
    saveMenuToCloud();
};

window.toggleItemVisibility = function(catIndex, itemIndex) {
    if (adminMenuData[catIndex].items[itemIndex].active === undefined) adminMenuData[catIndex].items[itemIndex].active = true;
    adminMenuData[catIndex].items[itemIndex].active = !adminMenuData[catIndex].items[itemIndex].active;
    saveMenuToCloud();
};

async function saveMenuToCloud() {
    try {
        await db.collection('settings').doc('menu').update({
            menuData: adminMenuData,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });
        renderAdminMenu();
    } catch (e) {
        console.error("Save error:", e);
        showAdminAlert("Fehler beim Speichern in die Datenbank!");
    }
}

window.addCategory = function() {
    const catName = prompt("Name der neuen Kategorie (z.B. Getränke):");
    if (catName && catName.trim() !== "") {
        adminMenuData.push({ category: catName.trim(), items: [] });
        saveMenuToCloud();
    }
};

window.deleteCategory = function(catIndex) {
    if (confirm(`Möchten Sie die Kategorie "${adminMenuData[catIndex].category}" wirklich löschen? Alle Artikel darin gehen verloren!`)) {
        adminMenuData.splice(catIndex, 1);
        saveMenuToCloud();
    }
};

window.deleteItem = function(catIndex, itemIndex) {
    if (confirm(`Artikel "${adminMenuData[catIndex].items[itemIndex].name}" wirklich löschen?`)) {
        adminMenuData[catIndex].items.splice(itemIndex, 1);
        saveMenuToCloud();
    }
};

window.openItemModal = function(catIndex, itemIndex) {
    const form = document.getElementById('menu-item-form');
    form.reset();
    
    document.getElementById('edit-cat-index').value = catIndex;
    document.getElementById('edit-item-index').value = itemIndex;

    if (itemIndex > -1) {
        document.getElementById('menu-modal-title').innerText = currentLang === 'de' ? "Artikel bearbeiten" : "Edit Item";
        const item = adminMenuData[catIndex].items[itemIndex];
        document.getElementById('edit-item-id').value = item.id;
        document.getElementById('edit-item-name').value = item.name;
        document.getElementById('edit-item-price').value = item.price;
        document.getElementById('edit-item-desc').value = item.desc || "";
        document.getElementById('edit-item-allergy').value = item.allergy || "";
    } else {
        document.getElementById('menu-modal-title').innerText = currentLang === 'de' ? "Neuen Artikel hinzufügen" : "Add New Item";
    }
    
    document.getElementById('menu-edit-modal').style.display = 'flex';
};

document.getElementById('menu-item-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const catIndex = parseInt(document.getElementById('edit-cat-index').value);
    const itemIndex = parseInt(document.getElementById('edit-item-index').value);
    
    const newItem = {
        id: document.getElementById('edit-item-id').value.trim(),
        name: document.getElementById('edit-item-name').value.trim(),
        price: parseFloat(document.getElementById('edit-item-price').value),
        desc: document.getElementById('edit-item-desc').value.trim(),
        allergy: document.getElementById('edit-item-allergy').value.trim()
    };

    if (itemIndex > -1) {
        adminMenuData[catIndex].items[itemIndex] = newItem; 
    } else {
        adminMenuData[catIndex].items.push(newItem); 
    }

    document.getElementById('menu-edit-modal').style.display = 'none';
    saveMenuToCloud();
});

// --- LOGOUT LOGIC ---
window.adminLogout = function() {
    firebase.auth().signOut().then(() => {
        window.location.reload();
    }).catch((error) => {
        console.error("Logout Error:", error);
        showAdminAlert("Fehler beim Abmelden.");
    });
};
