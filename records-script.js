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

// --- 3. DOM & State ---
document.addEventListener("DOMContentLoaded", () => {
    // UI Elements
    const loginOverlay = document.getElementById('records-login-overlay');
    const loginButton = document.getElementById('login-button');
    const passwordInput = document.getElementById('records-password');
    const loginError = document.getElementById('login-error');
    const contentWrapper = document.getElementById('records-content-wrapper');
    const statusDot = document.getElementById('status-dot');
    const connectionText = document.getElementById('connection-text');

    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const filterBtn = document.getElementById('filter-btn');
    const exportBtn = document.getElementById('export-btn');
    const printBtn = document.getElementById('print-btn');

    const totalRevenueEl = document.getElementById('total-revenue');
    const totalOrdersEl = document.getElementById('total-orders');
    const avgTicketEl = document.getElementById('avg-ticket');
    const recordsTbody = document.getElementById('records-list');

    // Side Panel Elements
    const detailPanel = document.getElementById('detailPanel');
    const panelTitle = document.getElementById('panel-title');
    const panelId = document.getElementById('panel-id');
    const panelTime = document.getElementById('panel-time');
    const panelItems = document.getElementById('panel-items');
    const panelTotal = document.getElementById('panel-total');

    const RECORDS_PASSWORD = "zafran"; 
    let allFetchedRecords = []; 

    // --- 4. SECURE LOGIN LOGIC ---
    loginButton.addEventListener('click', () => {
        if (passwordInput.value === RECORDS_PASSWORD) {
            
            const hiddenEmail = "webmaster@zafraneuskirchen.de";
            const hiddenPass  = "!Zafran2025";

            loginButton.innerText = "Verbinden..."; 
            
            firebase.auth().signInWithEmailAndPassword(hiddenEmail, hiddenPass)
            .then((userCredential) => {
                loginOverlay.style.display = 'none';
                contentWrapper.style.opacity = '1';
                initializeRecordsPage(); 
            })
            .catch((error) => {
                console.error("Login Error:", error);
                loginError.innerText = "Systemfehler: Login nicht möglich.";
                loginError.style.display = 'block';
                loginButton.innerText = "UNLOCK DASHBOARD";
            });

        } else {
            loginError.innerText = "Falsches Passwort";
            loginError.style.display = 'block';
        }
    });

    passwordInput.addEventListener('keyup', (e) => e.key === 'Enter' && loginButton.click());

    function initializeRecordsPage() {
        statusDot.classList.add('online');
        connectionText.textContent = "System Online";
        
        const today = new Date().toISOString().split('T')[0];
        startDateInput.value = today;
        endDateInput.value = today;

        filterBtn.addEventListener('click', fetchRecords);
        printBtn.addEventListener('click', () => window.print());
        exportBtn.addEventListener('click', exportToCSV);
        
        fetchRecords();
    }

    async function fetchRecords() {
        let startDate = new Date(startDateInput.value + 'T00:00:00');
        let endDate = new Date(endDateInput.value + 'T23:59:59');

        if (isNaN(startDate) || isNaN(endDate)) { alert("Please check dates."); return; }

        filterBtn.disabled = true;
        filterBtn.innerHTML = "<span>⏳</span> Loading...";
        recordsTbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:#888;">Retrieving Data from Cloud...</td></tr>`;

        try {
            const query = db.collection("archived_orders")
                .where("closedAt", ">=", firebase.firestore.Timestamp.fromDate(startDate))
                .where("closedAt", "<=", firebase.firestore.Timestamp.fromDate(endDate))
                .orderBy("closedAt", "asc"); 

            const snapshot = await query.get();
            
            // --- THE SIMPLE FIX: MERGE MULTIPLE ORDERS FOR THE SAME TABLE ---
            const groupedMap = new Map();

            snapshot.docs.forEach(doc => {
                const data = doc.data();
                let groupKey = doc.id; 
                
                // Group by Table Number and the exact millisecond they paid
                if ((data.orderType === 'dine-in' || !data.orderType) && data.table && data.closedAt) {
                    groupKey = data.table + "_" + data.closedAt.toMillis();
                }

                if (!groupedMap.has(groupKey)) {
                    // First document for this table's checkout
                    groupedMap.set(groupKey, { id: doc.id, ...data, items: data.items ? [...data.items] : [] });
                } else {
                    // Extra document for the same checkout, just add the items to the main bill
                    if (data.items) {
                        groupedMap.get(groupKey).items.push(...data.items);
                    }
                }
            });

            let records = Array.from(groupedMap.values());
            
            // Re-sort ascending to match original logic, then reverse so newest is on top
            records.sort((a, b) => {
                const timeA = a.closedAt ? a.closedAt.toMillis() : 0;
                const timeB = b.closedAt ? b.closedAt.toMillis() : 0;
                return timeA - timeB;
            });

            allFetchedRecords = records.reverse(); 
            // --- END OF FIX ---
            
            renderRecords(allFetchedRecords);
            calculateKPIs(allFetchedRecords);

        } catch (error) {
            console.error("Error:", error);
            recordsTbody.innerHTML = `<tr><td colspan="6" style="color:#ff5252; text-align:center; padding:20px;">
                <strong>System Error:</strong> ${error.message}<br>
                <small>Check browser console (F12) for Index Creation Link if first run.</small>
            </td></tr>`;
        } finally {
            filterBtn.disabled = false;
            filterBtn.innerHTML = "<span>🔍</span> Filter Records";
        }
    }

    function renderRecords(records) {
        recordsTbody.innerHTML = ""; 

        if (records.length === 0) {
            recordsTbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:#666;">No sales records found for this period.</td></tr>`;
            return;
        }

        records.forEach(record => {
            let recordDate = "N/A";
            let recordTime = "N/A";
            
            if (record.closedAt && record.closedAt.toDate) {
                const dateObj = record.closedAt.toDate();
                recordDate = dateObj.toLocaleDateString('de-DE');
                recordTime = dateObj.toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'});
            }
            
            const amount = record.paidAmount || record.total || 0;
            
            let tableName = record.table || "Unknown";
            let typeBadge = "";
            
            if (record.orderType === 'pickup') {
                typeBadge = `<span class="badge badge-pickup">Pickup</span>`;
                tableName = record.customerName || "Walk-in";
            } else if (record.orderType === 'delivery') {
                typeBadge = `<span class="badge badge-delivery">Delivery</span>`;
                tableName = record.customerName || "Delivery";
            } else {
                typeBadge = `<span class="badge badge-dinein">Dine-In</span>`;
                tableName = `Table ${tableName}`;
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${recordDate}</td>
                <td>${recordTime}</td>
                <td style="font-weight:600; color:#fff;">${tableName}</td>
                <td>${typeBadge}</td>
                <td style="text-align:right; font-family:monospace; font-size:1rem; color:var(--success);">${Number(amount).toFixed(2)} €</td>
                <td style="text-align:center;">
                    <button class="btn-tool" style="padding:4px 10px; font-size:0.8rem; background:transparent; border:1px solid #555;" onclick="window.showDetail('${record.id}')">View</button>
                </td>
            `;
            recordsTbody.appendChild(tr);
        });
    }

    function calculateKPIs(records) {
        let totalRevenue = 0;
        records.forEach(r => totalRevenue += Number(r.paidAmount || r.total || 0));
        
        const count = records.length;
        const avg = count > 0 ? (totalRevenue / count) : 0;

        totalRevenueEl.textContent = `${totalRevenue.toFixed(2)} €`;
        totalOrdersEl.textContent = count;
        avgTicketEl.textContent = `${avg.toFixed(2)} €`;
    }

    // --- SIDE PANEL LOGIC ---
    window.showDetail = function(id) {
        const record = allFetchedRecords.find(r => r.id === id);
        if(!record) return;

        let title = record.table;
        if(record.orderType === 'pickup' || record.orderType === 'delivery') title = record.customerName;

        panelTitle.innerText = record.orderType === 'dine-in' ? `Table ${title}` : title;
        panelId.innerText = `#${record.id.substring(0, 8)}...`;
        
        if (record.closedAt && record.closedAt.toDate) {
            panelTime.innerText = record.closedAt.toDate().toLocaleString('de-DE');
        }

        panelItems.innerHTML = "";
        if (record.items && Array.isArray(record.items)) {
            record.items.forEach(item => {
                const price = item.price || 0;
                const row = document.createElement('div');
                row.className = 'receipt-item';
                row.innerHTML = `
                    <span>${item.quantity}x ${item.name}</span>
                    <span>${(item.quantity * price).toFixed(2)} €</span>
                `;
                panelItems.appendChild(row);
            });
        } else {
            panelItems.innerHTML = "<p style='color:#666;'>No item details stored.</p>";
        }

        const total = record.paidAmount || record.total || 0;
        panelTotal.innerText = `${Number(total).toFixed(2)} €`;

        detailPanel.classList.add('open');
    }

    window.closePanel = function() {
        detailPanel.classList.remove('open');
    }

    // --- EXPORT TO CSV ---
    function exportToCSV() {
        if(allFetchedRecords.length === 0) {
            alert("No data to export.");
            return;
        }

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Date,Time,OrderType,Table/Customer,Items,TotalAmount(EUR)\n";

        allFetchedRecords.forEach(r => {
            let dateStr = "", timeStr = "";
            if (r.closedAt && r.closedAt.toDate) {
                const d = r.closedAt.toDate();
                dateStr = d.toLocaleDateString('de-DE');
                timeStr = d.toLocaleTimeString('de-DE');
            }
            
            const name = (r.orderType === 'dine-in') ? `Table ${r.table}` : (r.customerName || "Customer");
            const total = Number(r.paidAmount || r.total || 0).toFixed(2);
            
            let itemStr = "";
            if(r.items) itemStr = r.items.map(i => `${i.quantity}x ${i.name}`).join(" | ");
            itemStr = itemStr.replace(/,/g, "").replace(/"/g, "'"); 

            csvContent += `${dateStr},${timeStr},${r.orderType},${name},"${itemStr}",${total}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `sales_report_${startDateInput.value}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});
