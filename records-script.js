// --- 1. FIREBASE CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyAVh2kVIuFcrt8Dg88emuEd9CQlqjJxDrA",
  authDomain: "zaffran-delight.firebaseapp.com",
  projectId: "zaffran-delight",
  storageBucket: "zaffran-delight.firebasestorage.app",
  messagingSenderId: "1022960860126",
  appId: "1:1022960860126:web:1e06693dea1d0247a0bb4f"
};

// --- 2. Initialize ---
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

let allFetchedRecords = []; 

// --- 3. DOM & State ---
document.addEventListener("DOMContentLoaded", () => {
    // UI Elements
    const loginOverlay = document.getElementById('records-login-overlay');
    const loginButton = document.getElementById('login-button');
    const passwordInput = document.getElementById('records-password');
    const loginError = document.getElementById('login-error');
    const contentWrapper = document.getElementById('records-content-wrapper');
    
    // Status Indicators
    const statusDot = document.getElementById('status-dot');
    const connectionText = document.getElementById('connection-text');

    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const filterBtn = document.getElementById('filter-btn');
    const exportBtn = document.getElementById('export-btn');

    // Default to today
    const today = new Date();
    if(startDateInput) startDateInput.valueAsDate = today;
    if(endDateInput) endDateInput.valueAsDate = today;

    function setConnected() {
        if(statusDot) {
            statusDot.style.backgroundColor = 'var(--success)';
            statusDot.style.boxShadow = '0 0 10px var(--success)';
        }
        if(connectionText) connectionText.innerText = 'System Connected';
    }

    // Authentication
    const MASTER_PASS = "zafran";
    if (sessionStorage.getItem('records_auth') === 'true') {
        if(loginOverlay) loginOverlay.style.display = 'none';
        if(contentWrapper) contentWrapper.style.display = 'block';
        setConnected();
        loadRecords(getStartOfDay(today), getEndOfDay(today));
    }

    if(loginButton) {
        loginButton.addEventListener('click', () => {
            if (passwordInput.value === MASTER_PASS) {
                sessionStorage.setItem('records_auth', 'true');
                loginOverlay.style.display = 'none';
                contentWrapper.style.display = 'block';
                setConnected();
                loadRecords(getStartOfDay(today), getEndOfDay(today));
            } else {
                loginError.style.display = 'block';
            }
        });
    }

    // Filter Buttons
    document.getElementById('btn-today')?.addEventListener('click', () => {
        const d = new Date(); startDateInput.valueAsDate = d; endDateInput.valueAsDate = d;
        loadRecords(getStartOfDay(d), getEndOfDay(d));
    });
    document.getElementById('btn-yesterday')?.addEventListener('click', () => {
        const d = new Date(); d.setDate(d.getDate() - 1);
        startDateInput.valueAsDate = d; endDateInput.valueAsDate = d;
        loadRecords(getStartOfDay(d), getEndOfDay(d));
    });
    document.getElementById('btn-week')?.addEventListener('click', () => {
        const d = new Date();
        const day = d.getDay() || 7;
        const start = new Date(d); start.setDate(d.getDate() - day + 1);
        const end = new Date(d); end.setDate(start.getDate() + 6);
        startDateInput.valueAsDate = start; endDateInput.valueAsDate = end;
        loadRecords(getStartOfDay(start), getEndOfDay(end));
    });
    document.getElementById('btn-month')?.addEventListener('click', () => {
        const d = new Date();
        const start = new Date(d.getFullYear(), d.getMonth(), 1);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        startDateInput.valueAsDate = start; endDateInput.valueAsDate = end;
        loadRecords(getStartOfDay(start), getEndOfDay(end));
    });

    if(filterBtn) {
        filterBtn.addEventListener('click', () => {
            if (!startDateInput.value || !endDateInput.value) return alert("Select start and end dates.");
            const start = new Date(startDateInput.value);
            const end = new Date(endDateInput.value);
            loadRecords(getStartOfDay(start), getEndOfDay(end));
        });
    }

    // --- CORE LOGIC: LOAD & SMART GROUP RECORDS ---
    function loadRecords(startOfDay, endOfDay) {
        const recordsBody = document.getElementById('records-body');
        if(!recordsBody) return;
        recordsBody.innerHTML = "<tr><td colspan='6' style='text-align:center;'>Lade Daten... (Loading)</td></tr>";

        // 🚨 FIX: FORCE FIREBASE TIMESTAMPS 🚨
        const tStart = firebase.firestore.Timestamp.fromDate(startOfDay);
        const tEnd = firebase.firestore.Timestamp.fromDate(endOfDay);

        db.collection("archived_orders")
            .where("closedAt", ">=", tStart)
            .where("closedAt", "<=", tEnd)
            .orderBy("closedAt", "desc")
            .get()
            .then((snap) => {
                recordsBody.innerHTML = "";
                
                let totalSales = 0;
                let dineInSales = 0;
                let pickupSales = 0;
                let deliverySales = 0;
                allFetchedRecords = []; 

                if (snap.empty) {
                    recordsBody.innerHTML = "<tr><td colspan='6' style='text-align:center; color:#aaa;'>No records found for this date range.</td></tr>";
                    updateSummary(0, 0, 0, 0);
                    return;
                }

                // 🚨 THE FIX: GROUPING MULTIPLE ORDERS INTO ONE SINGLE BILL 🚨
                let groupedMap = {};

                snap.forEach(doc => {
                    const r = doc.data();
                    
                    let timeStr = "";
                    let dateStr = "";
                    let timeMillis = 0;
                    
                    if (r.closedAt && r.closedAt.toDate) {
                        const d = r.closedAt.toDate();
                        timeStr = d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
                        dateStr = d.toLocaleDateString('de-DE');
                        timeMillis = d.getTime();
                    }

                    const typeStr = (r.orderType || 'pickup').toLowerCase();
                    let type = 'pickup';
                    if(typeStr.includes('del')) type = 'delivery';
                    else if(typeStr.includes('dine') || typeStr.includes('table')) type = 'dine-in';

                    // Group Dine-In orders by Table Number + Date + Exact Minute they checked out
                    let groupKey = doc.id; 
                    if (type === 'dine-in') {
                        groupKey = `dinein_${r.table}_${dateStr}_${timeStr}`;
                    }

                    // The Grand Total is stamped on all docs, we only need it once!
                    const amount = Number(r.paidAmount || r.total || 0);

                    if (!groupedMap[groupKey]) {
                        groupedMap[groupKey] = {
                            id: groupKey,
                            closedAtMillis: timeMillis,
                            orderType: type,
                            customerName: r.customerName || "",
                            table: r.table || "",
                            paymentMethod: r.paymentMethod || "Cash",
                            total: amount,
                            items: r.items ? [...r.items] : [],
                            dateStr: dateStr,
                            timeStr: timeStr
                        };
                    } else {
                        if (r.items) {
                            groupedMap[groupKey].items.push(...r.items);
                        }
                    }
                });

                // Convert clean mapped objects back to sorted array
                allFetchedRecords = Object.values(groupedMap);
                allFetchedRecords.sort((a, b) => b.closedAtMillis - a.closedAtMillis);

                allFetchedRecords.forEach(r => {
                    const total = r.total;
                    totalSales += total;

                    if (r.orderType === 'dine-in') dineInSales += total;
                    else if (r.orderType === 'delivery') deliverySales += total;
                    else pickupSales += total;

                    let itemsHtml = "";
                    if (r.items && r.items.length > 0) {
                        itemsHtml = r.items.map(i => {
                            let mods = "";
                            if (i.modifiers && i.modifiers.length > 0) mods = ` <span style="color:#aaa; font-size:0.8rem;">(${i.modifiers.join(', ')})</span>`;
                            return `<div style="margin-bottom:4px;"><b>${i.quantity}x</b> ${i.name}${mods}</div>`;
                        }).join("");
                    } else {
                        itemsHtml = "<span style='color:#aaa;'>No items</span>";
                    }

                    const nameDisplay = (r.orderType === 'dine-in') ? `Table ${r.table}` : `<b>${r.customerName || "Customer"}</b>`;

                    let typeBadge = `<span style="background:#a5d6a7; color:#000; padding:4px 8px; border-radius:4px; font-size:0.8rem; font-weight:bold;">Pickup</span>`;
                    if (r.orderType === 'delivery') typeBadge = `<span style="background:#90caf9; color:#000; padding:4px 8px; border-radius:4px; font-size:0.8rem; font-weight:bold;">Delivery</span>`;
                    if (r.orderType === 'dine-in') typeBadge = `<span style="background:#ffcc80; color:#000; padding:4px 8px; border-radius:4px; font-size:0.8rem; font-weight:bold;">Dine-In</span>`;

                    const payBadge = `<span style="background:#444; color:#fff; padding:4px 8px; border-radius:4px; font-size:0.8rem; font-weight:bold;">${r.paymentMethod || "Cash"}</span>`;

                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td style="padding:12px; border-bottom:1px solid var(--ent-border);">
                            <div style="font-weight:bold; color:var(--text-main);">${r.dateStr}</div>
                            <div style="font-size:0.85rem; color:var(--text-muted);">${r.timeStr}</div>
                        </td>
                        <td style="padding:12px; border-bottom:1px solid var(--ent-border);">${typeBadge}</td>
                        <td style="padding:12px; border-bottom:1px solid var(--ent-border); color:var(--text-main);">${nameDisplay}</td>
                        <td style="padding:12px; border-bottom:1px solid var(--ent-border); color:var(--text-main);">${itemsHtml}</td>
                        <td style="padding:12px; border-bottom:1px solid var(--ent-border);">${payBadge}</td>
                        <td style="padding:12px; border-bottom:1px solid var(--ent-border); font-weight:bold; color:var(--gold); font-size:1.1rem;">${total.toFixed(2).replace('.', ',')} €</td>
                    `;
                    recordsBody.appendChild(row);
                });

                updateSummary(totalSales, dineInSales, pickupSales, deliverySales);
            })
            .catch((error) => {
                console.error("Error loading records: ", error);
                recordsBody.innerHTML = "<tr><td colspan='6' style='text-align:center; color:var(--danger);'>Error loading records. Please try again.</td></tr>";
            });
    }

    // --- Helpers ---
    function getStartOfDay(date) { const d = new Date(date); d.setHours(0, 0, 0, 0); return d; }
    function getEndOfDay(date) { const d = new Date(date); d.setHours(23, 59, 59, 999); return d; }

    function updateSummary(total, dineIn, pickup, delivery) {
        if(document.getElementById('sum-total')) document.getElementById('sum-total').innerText = total.toFixed(2).replace('.', ',') + " €";
        if(document.getElementById('sum-dine')) document.getElementById('sum-dine').innerText = dineIn.toFixed(2).replace('.', ',') + " €";
        if(document.getElementById('sum-pickup')) document.getElementById('sum-pickup').innerText = pickup.toFixed(2).replace('.', ',') + " €";
        if(document.getElementById('sum-delivery')) document.getElementById('sum-delivery').innerText = delivery.toFixed(2).replace('.', ',') + " €";
    }

    // --- Export to CSV ---
    if(exportBtn) {
        exportBtn.addEventListener('click', () => {
            if(allFetchedRecords.length === 0) {
                alert("No data to export.");
                return;
            }

            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += "Date,Time,OrderType,Table/Customer,Items,TotalAmount(EUR)\\n";

            allFetchedRecords.forEach(r => {
                const name = (r.orderType === 'dine-in') ? `Table ${r.table}` : (r.customerName || "Customer");
                const total = Number(r.total || 0).toFixed(2);
                
                let itemStr = "";
                if(r.items) itemStr = r.items.map(i => `${i.quantity}x ${i.name}`).join(" | ");
                itemStr = itemStr.replace(/,/g, "").replace(/"/g, "'"); 

                csvContent += `${r.dateStr},${r.timeStr},${r.orderType},${name},"${itemStr}",${total}\\n`;
            });

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `sales_report_${startDateInput.value}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }
});
