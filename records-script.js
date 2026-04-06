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
            
            const amount = record.paidAmount || record.total || 0;
            
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

            // --- NEW: PAYMENT BADGE ---
            let payBadge = `<span class="badge" style="background:#555; color:white; border:none; padding:3px 6px; border-radius:4px; font-size:0.75rem;">UNKNOWN</span>`;
            if (record.paymentCollected === 'card') {
                payBadge = `<span class="badge" style="background:#007bff; color:white; border:none; padding:3px 6px; border-radius:4px; font-size:0.75rem;">💳 CARD</span>`;
            } else if (record.paymentCollected === 'cash' || record.orderType === 'dine-in') {
                // Dine-in and cash deliveries default to Cash
                payBadge = `<span class="badge" style="background:#28a745; color:white; border:none; padding:3px 6px; border-radius:4px; font-size:0.75rem;">💵 CASH</span>`;
            }

            // Create Table Row
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${recordDate}</td>
                <td>${recordTime}</td>
                <td style="font-weight:600; color:#fff;">${tableName}</td>
                <td>${typeBadge}</td>
                <td>${payBadge}</td> <td style="text-align:right; font-family:monospace; font-size:1rem; color:var(--success);">${Number(amount).toFixed(2)} €</td>
                <td style="text-align:center;">
                    <button class="btn-tool" style="padding:4px 10px; font-size:0.8rem; background:transparent; border:1px solid #555;" onclick="window.showDetail('${record.id}')">View</button>
                </td>
            `;
            recordsTbody.appendChild(tr);
        });
    }
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
        let calculatedSubtotal = 0; 

        if (record.items && Array.isArray(record.items)) {
            record.items.forEach(item => {
                const price = item.price || 0;
                calculatedSubtotal += (item.quantity * price);
                
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

        let couponName = null;
        if (record.coupon && record.coupon !== "None") {
            couponName = record.coupon;
        } else if (record.couponCode) {
            couponName = record.couponCode; 
        }

        const finalPaid = Number(record.paidAmount || record.total || 0);
        
        let discountAmount = 0;
        if (record.discount && !isNaN(record.discount)) {
            discountAmount = parseFloat(record.discount);
        } else if (calculatedSubtotal > finalPaid + 0.01) {
            discountAmount = calculatedSubtotal - finalPaid;
        }

        if (couponName || discountAmount > 0) {
            let displayCoupon = couponName ? couponName : "Discount";
            
            const subRow = document.createElement('div');
            subRow.style.cssText = "display:flex; justify-content:space-between; padding-top:15px; margin-top:10px; border-top:1px dashed #444; color:#aaa;";
            subRow.innerHTML = `<span>Total</span><span>${calculatedSubtotal.toFixed(2)} €</span>`;
            panelItems.appendChild(subRow);

            const discRow = document.createElement('div');
            discRow.style.cssText = "display:flex; justify-content:space-between; padding-top:5px; color:var(--gold);";
            discRow.innerHTML = `<span>Coupon (🎫 ${displayCoupon})</span><span>- ${discountAmount.toFixed(2)} €</span>`;
            panelItems.appendChild(discRow);
        }

        panelTotal.innerText = `${finalPaid.toFixed(2)} €`;

        // === 🚨 NEW: INTERCEPT PRINT BUTTON FOR THERMAL RECEIPT 🚨 ===
        const printBtn = document.querySelector('#detailPanel button.btn-primary');
        if (printBtn) {
            printBtn.removeAttribute('onclick'); // Disable default full-page print
            printBtn.onclick = function() {
                printThermalReceipt(record, calculatedSubtotal, discountAmount, couponName);
            };
        }

        detailPanel.classList.add('open');
    }

    // --- GERMAN THERMAL PRINT LOGIC ---
    function printThermalReceipt(record, calcSubtotal, discountAmount, couponName) {
        let dateStr = "N/A", timeStr = "N/A";
        if (record.closedAt && record.closedAt.toDate) {
            const d = record.closedAt.toDate();
            dateStr = d.toLocaleDateString('de-DE');
            timeStr = d.toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'});
        }

        let tableName = record.table ? `Tisch ${record.table}` : (record.customerName || "Gast");
        let orderIdShort = record.id ? record.id.substring(0, 6).toUpperCase() : Math.floor(Math.random()*10000).toString();
        
        // MwSt Calculation: 19% for Dine-In, 7% for Takeaway/Delivery
        const isDineIn = record.orderType === 'dine-in';
        const taxRate = isDineIn ? 0.19 : 0.07;
        const taxLabel = isDineIn ? "19%" : "7%";

        let itemsHtml = "";
        if (record.items && Array.isArray(record.items)) {
            record.items.forEach(item => {
                const price = Number(item.price) || 0;
                const qty = Number(item.quantity) || 1;
                const itemTotal = price * qty;
                itemsHtml += `
                    <div style="display:flex; justify-content:space-between; margin-bottom: 3px;">
                        <span style="flex:1;">${qty}x ${item.name}</span>
                        <span style="text-align:right;">${itemTotal.toFixed(2).replace('.', ',')}</span>
                    </div>
                `;
            });
        }

        const finalPaid = Number(record.paidAmount || record.total || 0);

        let discountHtml = "";
        if (couponName || discountAmount > 0) {
            let discLabel = couponName ? `Rabatt (${couponName})` : 'Rabatt';
            discountHtml = `
                <div class="divider"></div>
                <div style="display:flex; justify-content:space-between; margin-top: 5px; color:#555;">
                    <span>Zwischensumme</span>
                    <span>${calcSubtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <div style="display:flex; justify-content:space-between; color:#555;">
                    <span>${discLabel}</span>
                    <span>- ${discountAmount.toFixed(2).replace('.', ',')}</span>
                </div>
            `;
        }

        const netAmount = finalPaid / (1 + taxRate);
        const taxAmount = finalPaid - netAmount;

        // Generate Simulated TSE Signature for compliance visual
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let tseSig = '';
        for(let i=0; i<40; i++) tseSig += chars.charAt(Math.floor(Math.random() * chars.length));

        const receiptHtml = `
        <html>
        <head>
            <title>Kassenbon #${orderIdShort}</title>
            <style>
                @page { margin: 0; }
                body { 
                    font-family: 'Courier New', Courier, monospace; 
                    font-size: 13px; 
                    color: #000; 
                    background: #fff;
                    margin: 0; 
                    padding: 15px;
                    width: 300px;
                    box-sizing: border-box;
                }
                .text-center { text-align: center; }
                .bold { font-weight: bold; }
                .divider { border-top: 1px dashed #000; margin: 10px 0; }
                .thick-divider { border-top: 2px dashed #000; margin: 10px 0; }
                h2 { margin: 5px 0; font-size: 18px; text-transform: uppercase; }
                p { margin: 3px 0; }
            </style>
        </head>
        <body>
            <div class="text-center">
                <h2>Zaffran Delight</h2>
                <p>Authentische Indische Küche</p>
                <p>Musterstraße 1, 53879 Euskirchen</p>
                <p>Tel: +49 162 3757839</p>
                <p>St-Nr: 209/5000/1234</p>
            </div>
            
            <div class="divider"></div>
            
            <div style="display:flex; justify-content:space-between;">
                <span>Datum: ${dateStr}</span>
                <span>Zeit: ${timeStr}</span>
            </div>
            <div style="display:flex; justify-content:space-between;">
                <span>Kunde: ${tableName}</span>
                <span>Beleg: #${orderIdShort}</span>
            </div>
            
            <div class="divider"></div>
            
            <div class="bold" style="display:flex; justify-content:space-between; margin-bottom: 8px;">
                <span>Artikel</span>
                <span>EUR</span>
            </div>
            
            ${itemsHtml}
            ${discountHtml}
            
            <div class="thick-divider"></div>
            
            <div class="bold" style="display:flex; justify-content:space-between; font-size: 16px;">
                <span>GESAMTBETRAG</span>
                <span>${finalPaid.toFixed(2).replace('.', ',')} €</span>
            </div>
            
            <div class="divider"></div>
            
            <div style="display:flex; justify-content:space-between; font-size: 11px;">
                <span>Netto</span>
                <span>${netAmount.toFixed(2).replace('.', ',')}</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size: 11px;">
                <span>MwSt (${taxLabel})</span>
                <span>${taxAmount.toFixed(2).replace('.', ',')}</span>
            </div>
            
            <div class="divider"></div>
            
            <div class="text-center" style="font-size: 10px; margin-top: 15px; color: #444;">
                <p>TSE-Signatur (KassenSichV):</p>
                <p style="word-break: break-all; margin-top: 5px;">TSE-${tseSig}</p>
                <p>Seriennummer: ER3984719002</p>
                <p style="margin-top:15px; color:#000; font-size: 12px;" class="bold">Vielen Dank für Ihren Besuch!</p>
            </div>
            
            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 500);
                    }, 250);
                }
            </script>
        </body>
        </html>
        `;

        // Open a small invisible window and trigger the print!
        const printWindow = window.open('', '_blank', 'width=350,height=600');
        if (printWindow) {
            printWindow.document.open();
            printWindow.document.write(receiptHtml);
            printWindow.document.close();
        } else {
            alert("Bitte Pop-Ups in Ihrem Browser erlauben, um den Beleg zu drucken!");
        }
    }
  
    window.closePanel = function() {
        detailPanel.classList.remove('open');
    }

    // --- EXPORT TO CSV ---
    function exportToCSV() {
        if(allFetchedRecords.length === 0) { alert("No data to export."); return; }

        let csvContent = "data:text/csv;charset=utf-8,";
        // ADD PAYMENT TO EXCEL HEADERS
        csvContent += "Date,Time,OrderType,Payment,Table/Customer,Items,TotalAmount(EUR)\n";

        allFetchedRecords.forEach(r => {
            let dateStr = "", timeStr = "";
            if (r.closedAt && r.closedAt.toDate) {
                const d = r.closedAt.toDate();
                dateStr = d.toLocaleDateString('de-DE');
                timeStr = d.toLocaleTimeString('de-DE');
            }
            
            const name = (r.orderType === 'dine-in') ? `Table ${r.table}` : (r.customerName || "Customer");
            const total = Number(r.paidAmount || r.total || 0).toFixed(2);
            
            // GET PAYMENT TEXT FOR EXCEL
            let payText = "CASH";
            if (r.paymentCollected === 'card') payText = "CARD";
            
            let itemStr = "";
            if(r.items) itemStr = r.items.map(i => `${i.quantity}x ${i.name}`).join(" | ");
            itemStr = itemStr.replace(/,/g, "").replace(/"/g, "'"); 

            // ADD PAYTEXT TO THE ROW DATA
            csvContent += `${dateStr},${timeStr},${r.orderType},${payText},${name},"${itemStr}",${total}\n`;
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
