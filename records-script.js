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

    // --- 4. NEW SECURE LOGIN LOGIC ---
    loginButton.addEventListener('click', () => {
        // 1. Check if the staff typed the correct simple PIN ("zafran")
        if (passwordInput.value === RECORDS_PASSWORD) {
            
            // 2. If correct, secretly log them in with the real account
            const hiddenEmail = "webmaster@zafraneuskirchen.de";
            const hiddenPass  = "!Zafran2025";

            loginButton.innerText = "Verbinden..."; // Optional: Show loading text
            
            firebase.auth().signInWithEmailAndPassword(hiddenEmail, hiddenPass)
            .then((userCredential) => {
                // Success! The system is now logged in securely.
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
            // Wrong PIN entered
            loginError.innerText = "Falsches Passwort";
            loginError.style.display = 'block';
        }
    });

    passwordInput.addEventListener('keyup', (e) => e.key === 'Enter' && loginButton.click());

    function initializeRecordsPage() {
        // Init UI
        statusDot.classList.add('online');
        connectionText.textContent = "System Online";
        
        // Set Today's Date
        const today = new Date().toISOString().split('T')[0];
        startDateInput.value = today;
        endDateInput.value = today;

        // Listeners
        filterBtn.addEventListener('click', fetchRecords);
        printBtn.addEventListener('click', () => window.print());
        exportBtn.addEventListener('click', exportToCSV);
        
        // Auto Load
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
            // Query for archived orders
            const query = db.collection("archived_orders")
                .where("closedAt", ">=", firebase.firestore.Timestamp.fromDate(startDate))
                .where("closedAt", "<=", firebase.firestore.Timestamp.fromDate(endDate))
                .orderBy("closedAt", "asc"); 

            const snapshot = await query.get();
            
            // --- THE FIX: SAFELY GROUP ORDERS FOR THE SAME TABLE ---
            let groupedRecords = {};

            snapshot.docs.forEach(doc => {
                const data = doc.data();
                
                // Identify the same checkout by Table and Exact Time
                let groupKey = doc.id; 
                
                if ((data.orderType === 'dine-in' || !data.orderType) && data.table && data.closedAt) {
                    // Safely get milliseconds from the Firestore Timestamp
                    let timeVal = 0;
                    if (typeof data.closedAt.toMillis === 'function') {
                        timeVal = data.closedAt.toMillis();
                    } else if (data.closedAt.seconds) {
                        timeVal = data.closedAt.seconds * 1000;
                    }
                    groupKey = `table_${data.table}_${timeVal}`;
                }

                if (!groupedRecords[groupKey]) {
                    // Save first instance of this bill
                    groupedRecords[groupKey] = { 
                        id: doc.id, 
                        ...data, 
                        items: data.items ? [...data.items] : [] 
                    };
                } else {
                    // Combine items from split orders, do not duplicate total amount!
                    if (data.items) {
                        groupedRecords[groupKey].items.push(...data.items);
                    }
                }
            });

            // Convert grouped object back to array
            const cleanRecords = Object.values(groupedRecords);
            
            // Reverse so newest is on top
            allFetchedRecords = cleanRecords.reverse(); 
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
            
            // --- NEW: COUPON & AMOUNT LOGIC ---
            const finalPaid = Number(record.paidAmount || record.total || 0);
            const couponCode = record.couponCode || record.discountCode || null;
            
            // Logic to determine Table or Customer Name
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

            // --- NEW: DRAW AMOUNT WITH OPTIONAL COUPON BADGE ---
            let amountDisplay = `${finalPaid.toFixed(2).replace('.', ',')} €`;
            if (couponCode) {
                amountDisplay += `<br><span style="font-size:0.7rem; color:#f39c12; background:rgba(243,156,18,0.1); padding:2px 6px; border-radius:3px; margin-top:4px; display:inline-block; border:1px solid rgba(243,156,18,0.3);">🎫 ${couponCode}</span>`;
            }

            // Create Table Row
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${recordDate}</td>
                <td>${recordTime}</td>
                <td style="font-weight:600; color:#fff;">${tableName}</td>
                <td>${typeBadge}</td>
                <td style="text-align:right; font-family:monospace; font-size:1rem; color:var(--success);">${amountDisplay}</td>
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

        // --- NEW: THE RECEIPT MATH (SUBTOTAL -> DISCOUNT -> TOTAL) ---
        const originalTotal = Number(record.total || 0);
        const finalPaid = Number(record.paidAmount || record.total || 0);
        const couponCode = record.couponCode || record.discountCode || null;

        if (couponCode) {
            // Draw Subtotal Line
            const subRow = document.createElement('div');
            subRow.style.cssText = "display:flex; justify-content:space-between; padding-top:15px; margin-top:10px; border-top:1px dashed #444; color:#aaa;";
            subRow.innerHTML = `<span>Subtotal</span><span>${originalTotal.toFixed(2).replace('.', ',')} €</span>`;
            panelItems.appendChild(subRow);

            // Draw Discount Line
            let discAmount = originalTotal - finalPaid;
            const discRow = document.createElement('div');
            discRow.style.cssText = "display:flex; justify-content:space-between; padding-top:5px; color:#f39c12;";
            discRow.innerHTML = `<span>Rabatt (🎫 ${couponCode})</span><span>- ${discAmount.toFixed(2).replace('.', ',')} €</span>`;
            panelItems.appendChild(discRow);
        }

        panelTotal.innerText = `${finalPaid.toFixed(2).replace('.', ',')} €`;
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
            
            // Item Summary
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
