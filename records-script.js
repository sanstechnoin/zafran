// --- 2. DOM & State ---
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

    // --- 🚨 VAULT STATE VARIABLES 🚨 ---
    let allFetchedRecords = []; 
    let currentDisplayRecords = []; 
    let isEditMode = false;
    let currentView = 'active'; // 'active' or 'trash'

    // --- 3. SECURE STRICT LOGIN LOGIC (NO FALLBACK) ---
    loginButton.addEventListener('click', () => {
        const enteredPin = passwordInput.value.trim();
        if (!enteredPin) return;

        const originalBtnText = loginButton.innerText;
        loginButton.innerText = "Verbinden...";
        loginButton.disabled = true;

        // Fetch Kitchen PIN from DB
        db.collection('settings').doc('record_auth').get()
        .then(doc => {
            if (!doc.exists || !doc.data().pin) {
                loginError.innerText = "❌ PIN nicht im Admin Panel konfiguriert!";
                loginError.style.display = 'block';
                loginButton.innerText = originalBtnText;
                loginButton.disabled = false;
                return;
            }

            const realPin = doc.data().pin;

            if (enteredPin === realPin) {
                const hiddenEmail = "webmaster@zafraneuskirchen.de";
                const hiddenPass  = "!Zafran2025";
                
                firebase.auth().signInWithEmailAndPassword(hiddenEmail, hiddenPass)
                .then(() => {
                    loginOverlay.style.display = 'none';
                    contentWrapper.style.opacity = '1';
                    initializeRecordsPage(); 
                })
                .catch((error) => {
                    console.error("Auth Error:", error);
                    loginError.innerText = "❌ Systemfehler: Service Key abgelehnt.";
                    loginError.style.display = 'block';
                    loginButton.innerText = originalBtnText;
                    loginButton.disabled = false;
                });
            } else {
                loginError.innerText = "❌ Falscher PIN.";
                loginError.style.display = 'block';
                loginButton.innerText = originalBtnText;
                loginButton.disabled = false;
            }
        })
        .catch(err => {
            console.error("Network Error:", err);
            loginError.innerText = "❌ Netzwerkfehler.";
            loginError.style.display = 'block';
            loginButton.innerText = originalBtnText;
            loginButton.disabled = false;
        });
    });

    passwordInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter' && !loginButton.disabled) loginButton.click();
    });

    function initializeRecordsPage() {
        statusDot.classList.add('online');
        connectionText.textContent = "System Online";
        
        const today = new Date().toISOString().split('T')[0];
        startDateInput.value = today;
        endDateInput.value = today;

        filterBtn.addEventListener('click', fetchRecords);
        printBtn.addEventListener('click', () => window.print());
        exportBtn.addEventListener('click', exportToCSV);
        
        initBankVaultUI(); // Initialize the Vault UI & Custom Modals
        fetchRecords();
    }

    // --- 🚨 4. THE ADMIN VAULT & CUSTOM MODAL LOGIC 🚨 ---
    function initBankVaultUI() {
        const tableContainer = recordsTbody.parentNode; 
        
        // 1. Create the Top Vault Bar
        const vaultHeader = document.createElement('div');
        vaultHeader.style.cssText = "display:flex; justify-content:space-between; align-items:center; margin-top:20px; margin-bottom:15px; padding:12px 20px; background:rgba(212, 175, 55, 0.05); border:1px dashed var(--gold); border-radius:8px;";
        vaultHeader.innerHTML = `
            <div>
                <strong style="color:var(--gold); font-size:1.2rem;">🏛️ Admin Vault</strong>
                <span id="vault-status" style="margin-left:10px; font-size:0.9rem; color:#aaa;">(Locked)</span>
            </div>
            <div>
                <button id="btn-vault-trash" class="btn-tool" style="background:transparent; border:1px solid #ff5252; color:#ff5252; padding:6px 12px; margin-right:10px; display:none; font-weight:bold;">🗑️ View Trash Bin</button>
                <button id="btn-vault-unlock" class="btn-tool" style="background:transparent; border:1px solid var(--gold); color:var(--gold); padding:6px 12px; font-weight:bold;">🔒 Unlock Edit Mode</button>
            </div>
        `;

        // 2. Create the Red Action Bar
        const bulkActionBar = document.createElement('div');
        bulkActionBar.id = "bulk-action-bar";
        bulkActionBar.style.cssText = "display:none; padding:15px; background:rgba(220, 53, 69, 0.1); border:1px solid #ff5252; border-radius:8px; margin-bottom:15px;";
        bulkActionBar.innerHTML = `
            <span style="color:#ff5252; font-weight:bold; margin-right:20px;">⚠️ EDIT MODE ACTIVE</span>
            <button id="btn-bulk-void" style="background:#ff5252; color:white; border:none; padding:8px 15px; border-radius:4px; font-weight:bold; cursor:pointer;">🗑️ Move Selected to Trash</button>
            <button id="btn-bulk-restore" style="background:#28a745; color:white; border:none; padding:8px 15px; border-radius:4px; font-weight:bold; cursor:pointer; display:none;">♻️ Restore Selected</button>
            <button id="btn-bulk-delete" style="background:#8B0000; color:white; border:none; padding:8px 15px; border-radius:4px; font-weight:bold; cursor:pointer; display:none; margin-left:10px;">💀 Permanently Delete</button>
            
            <button id="btn-vault-lock" style="background:#444; color:white; border:none; padding:8px 15px; border-radius:4px; cursor:pointer; float:right;">Lock Vault</button>
        `;

        tableContainer.parentNode.insertBefore(vaultHeader, tableContainer);
        tableContainer.parentNode.insertBefore(bulkActionBar, tableContainer);

        // 3. Create the Custom In-House Modals
        const modalHtml = `
            <div id="vault-custom-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:10000; align-items:center; justify-content:center;">
                
                <div id="vault-pass-box" style="display:none; background:#222; padding:30px; border-radius:12px; border:2px solid var(--gold); text-align:center; width:90%; max-width:400px; box-shadow:0 10px 30px rgba(0,0,0,0.8);">
                    <h3 style="color:var(--gold); margin-top:0; font-size:1.5rem;">🔒 Vault Security</h3>
                    <p style="color:#ccc; margin-bottom:20px;">Enter Master Deletion Password:</p>
                    <input type="password" id="vault-pass-input" style="width:100%; padding:12px; background:#111; color:white; border:1px solid #555; border-radius:4px; text-align:center; font-size:1.2rem; margin-bottom:20px;">
                    <p id="vault-pass-error" style="color:#ff5252; margin-top:-10px; margin-bottom:15px; display:none; font-size:0.9rem;">Incorrect Password</p>
                    <div style="display:flex; gap:10px;">
                        <button onclick="closeVaultModal()" style="flex:1; padding:12px; background:#444; color:white; border:none; border-radius:6px; cursor:pointer; font-weight:bold;">Cancel</button>
                        <button onclick="submitVaultPassword()" style="flex:1; padding:12px; background:var(--gold); color:black; border:none; border-radius:6px; font-weight:bold; cursor:pointer;">Unlock</button>
                    </div>
                </div>

                <div id="vault-confirm-box" style="display:none; background:#222; padding:30px; border-radius:12px; border:2px solid #ff5252; text-align:center; width:90%; max-width:400px; box-shadow:0 10px 30px rgba(0,0,0,0.8);">
                    <h3 style="color:#ff5252; margin-top:0; font-size:1.5rem;">⚠️ Confirm Action</h3>
                    <p id="vault-confirm-msg" style="color:white; margin-bottom:25px; font-size:1.1rem; white-space:pre-wrap;"></p>
                    <div style="display:flex; gap:10px;">
                        <button onclick="closeVaultModal()" style="flex:1; padding:12px; background:#444; color:white; border:none; border-radius:6px; cursor:pointer; font-weight:bold;">Cancel</button>
                        <button id="vault-confirm-btn" style="flex:1; padding:12px; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer;"></button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        document.getElementById('vault-pass-input').addEventListener('keyup', (e) => {
            if (e.key === 'Enter') submitVaultPassword();
        });

        // --- BUTTON LISTENERS ---
        document.getElementById('btn-vault-unlock').onclick = () => {
            if (!isEditMode) showVaultModal('password');
        };

        document.getElementById('btn-vault-lock').onclick = () => {
            isEditMode = false;
            currentView = 'active'; 
            document.getElementById('vault-status').innerText = "(Locked)";
            document.getElementById('vault-status').style.color = "#aaa";
            document.getElementById('btn-vault-unlock').style.display = 'inline-block';
            document.getElementById('btn-vault-trash').style.display = 'none';
            document.getElementById('btn-vault-trash').innerText = "🗑️ View Trash Bin";
            document.getElementById('btn-vault-trash').style.color = "#ff5252";
            document.getElementById('btn-vault-trash').style.borderColor = "#ff5252";
            bulkActionBar.style.display = 'none';
            updateTableView();
        };

        document.getElementById('btn-vault-trash').onclick = (e) => {
            const btnVoid = document.getElementById('btn-bulk-void');
            const btnRestore = document.getElementById('btn-bulk-restore');
            const btnDelete = document.getElementById('btn-bulk-delete');

            if (currentView === 'active') {
                currentView = 'trash';
                e.target.innerText = "🔙 Back to Active Orders";
                e.target.style.color = "#28a745";
                e.target.style.borderColor = "#28a745";
                btnVoid.style.display = 'none';
                btnRestore.style.display = 'inline-block';
                btnDelete.style.display = 'inline-block';
            } else {
                currentView = 'active';
                e.target.innerText = "🗑️ View Trash Bin";
                e.target.style.color = "#ff5252";
                e.target.style.borderColor = "#ff5252";
                btnVoid.style.display = 'inline-block';
                btnRestore.style.display = 'none';
                btnDelete.style.display = 'none';
            }
            updateTableView();
        };

        document.getElementById('btn-bulk-void').onclick = () => processBulkAction('void');
        document.getElementById('btn-bulk-restore').onclick = () => processBulkAction('restore');
        document.getElementById('btn-bulk-delete').onclick = () => processBulkAction('delete');
    }

    // --- GLOBAL MODAL CONTROLLERS ---
    window.showVaultModal = function(type, options) {
        const overlay = document.getElementById('vault-custom-modal');
        const passBox = document.getElementById('vault-pass-box');
        const confirmBox = document.getElementById('vault-confirm-box');
        
        overlay.style.display = 'flex';

        if (type === 'password') {
            passBox.style.display = 'block';
            confirmBox.style.display = 'none';
            document.getElementById('vault-pass-input').value = '';
            document.getElementById('vault-pass-error').style.display = 'none';
            setTimeout(() => document.getElementById('vault-pass-input').focus(), 100);
        } else {
            passBox.style.display = 'none';
            confirmBox.style.display = 'block';
            document.getElementById('vault-confirm-msg').innerText = options.msg;
            
            const btn = document.getElementById('vault-confirm-btn');
            btn.innerText = options.btnText;
            btn.style.background = options.btnColor;
            
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', options.callback);
        }
    };

    window.closeVaultModal = function() {
        document.getElementById('vault-custom-modal').style.display = 'none';
    };

    window.submitVaultPassword = function() {
        const input = document.getElementById('vault-pass-input').value;
        const errorEl = document.getElementById('vault-pass-error');
        
        // Disable button while checking
        const unlockBtn = document.querySelector('#vault-pass-box button:last-child');
        const originalText = unlockBtn.innerText;
        unlockBtn.innerText = "Checking...";
        unlockBtn.disabled = true;
        errorEl.style.display = 'none';

        // STRICT NO-FALLBACK CHECK FROM DB
        db.collection('settings').doc('vault_auth').get()
        .then(doc => {
            if (!doc.exists || !doc.data().pin) {
                errorEl.innerText = "❌ Master-Passwort nicht im Admin Panel konfiguriert!";
                errorEl.style.display = 'block';
                unlockBtn.innerText = originalText;
                unlockBtn.disabled = false;
                return;
            }

            const realMasterPass = doc.data().pin;

            if (input === realMasterPass) {
                closeVaultModal();
                isEditMode = true;
                document.getElementById('vault-status').innerText = "(UNLOCKED)";
                document.getElementById('vault-status').style.color = "#ff5252";
                document.getElementById('btn-vault-unlock').style.display = 'none';
                document.getElementById('btn-vault-trash').style.display = 'inline-block';
                document.getElementById('bulk-action-bar').style.display = 'block';
                updateTableView();
            } else {
                errorEl.innerText = "❌ Falsches Master-Passwort.";
                errorEl.style.display = 'block';
            }
            unlockBtn.innerText = originalText;
            unlockBtn.disabled = false;
        })
        .catch(err => {
            console.error("Vault Auth Error:", err);
            errorEl.innerText = "❌ Netzwerkfehler.";
            errorEl.style.display = 'block';
            unlockBtn.innerText = originalText;
            unlockBtn.disabled = false;
        });
    };

    window.toggleAllChecks = function(masterCb) {
        document.querySelectorAll('.row-check').forEach(cb => cb.checked = masterCb.checked);
    };

    window.processBulkAction = async function(action) {
        const checked = document.querySelectorAll('.row-check:checked');
        if (checked.length === 0) return alert("Please select at least one record using the checkboxes.");
        
        let msg = ""; let btnText = ""; let btnColor = "";
        
        if(action === 'void') {
            msg = `Move ${checked.length} record(s) to the Trash Bin?`;
            btnText = "🗑️ Move to Trash"; btnColor = "#ff5252";
        } else if(action === 'restore') {
            msg = `Restore ${checked.length} record(s) back to active revenue?`;
            btnText = "♻️ Restore"; btnColor = "#28a745";
        } else if(action === 'delete') {
            msg = `💀 PERMANENTLY DELETE ${checked.length} record(s)?\n\nTHIS CANNOT BE UNDONE!`;
            btnText = "💀 Delete Forever"; btnColor = "#8B0000";
        }
        
        showVaultModal('confirm', {
            msg: msg, btnText: btnText, btnColor: btnColor,
            callback: async () => {
                closeVaultModal();
                filterBtn.disabled = true;
                filterBtn.innerHTML = "Processing...";

                try {
                    const batch = db.batch();
                    checked.forEach(cb => {
                        const ids = cb.dataset.docids.split(',');
                        ids.forEach(id => {
                            if (!id.trim()) return;
                            const docRef = db.collection('archived_orders').doc(id.trim());
                            if (action === 'void') batch.update(docRef, { isVoided: true });
                            else if (action === 'restore') batch.update(docRef, { isVoided: false });
                            else if (action === 'delete') batch.delete(docRef);
                        });
                    });

                    await batch.commit();
                    fetchRecords(); 
                } catch (e) {
                    console.error("Batch Error:", e);
                    alert("Error processing request: " + e.message);
                    filterBtn.disabled = false;
                    filterBtn.innerHTML = "<span>🔍</span> Filter Records";
                }
            }
        });
    };

    function updateTableHeaders() {
        const thead = recordsTbody.parentElement.querySelector('thead');
        if (!thead) return;
        let tr = thead.querySelector('tr');
        if (!tr) return;

        let headers = `
            <th>Date</th>
            <th>Time</th>
            <th>Table / Customer</th>
            <th>Type</th>
            <th>Payment</th>
            <th style="text-align:right;">Amount</th>
            <th style="text-align:center;">Action</th>
        `;

        if (isEditMode) {
            headers = `<th style="width:40px; text-align:center;"><input type="checkbox" id="check-all" onclick="toggleAllChecks(this)" style="transform:scale(1.5); cursor:pointer;"></th>` + headers;
        }
        tr.innerHTML = headers;
    }

    function updateTableView() {
        currentDisplayRecords = allFetchedRecords.filter(r => currentView === 'trash' ? r.isVoided : !r.isVoided);
        
        updateTableHeaders();
        renderRecords(currentDisplayRecords);
        calculateKPIs(currentDisplayRecords);
    }

    // --- 5. DATA FETCHING ---
    async function fetchRecords() {
        let startDate = new Date(startDateInput.value + 'T00:00:00');
        let endDate = new Date(endDateInput.value + 'T23:59:59');

        if (isNaN(startDate) || isNaN(endDate)) { alert("Please check dates."); return; }

        filterBtn.disabled = true;
        filterBtn.innerHTML = "<span>⏳</span> Loading...";
        let colCount = isEditMode ? 8 : 7;
        recordsTbody.innerHTML = `<tr><td colspan="${colCount}" style="text-align:center; padding:30px; color:#888;">Retrieving Data from Cloud...</td></tr>`;

        try {
            const query = db.collection("archived_orders")
                .where("closedAt", ">=", firebase.firestore.Timestamp.fromDate(startDate))
                .where("closedAt", "<=", firebase.firestore.Timestamp.fromDate(endDate))
                .orderBy("closedAt", "asc"); 

            const snapshot = await query.get();
            let groupedRecords = {};

            snapshot.docs.forEach(doc => {
                const data = doc.data();
                
                let groupKey = doc.id; 
                
                if ((data.orderType === 'dine-in' || !data.orderType) && data.table && data.closedAt) {
                    let timeVal = 0;
                    if (typeof data.closedAt.toMillis === 'function') {
                        timeVal = data.closedAt.toMillis();
                    } else if (data.closedAt.seconds) {
                        timeVal = data.closedAt.seconds * 1000;
                    }
                    groupKey = `table_${data.table}_${timeVal}`;
                }

                if (!groupedRecords[groupKey]) {
                    groupedRecords[groupKey] = { 
                        id: groupKey, 
                        docIds: [doc.id], 
                        ...data, 
                        items: data.items ? [...data.items] : [] 
                    };
                } else {
                    groupedRecords[groupKey].docIds.push(doc.id);
                    if (data.items) {
                        groupedRecords[groupKey].items.push(...data.items);
                    }
                }
            });

            const cleanRecords = Object.values(groupedRecords);
            allFetchedRecords = cleanRecords.reverse(); 
            updateTableView(); 

        } catch (error) {
            console.error("Error:", error);
            let colCount = isEditMode ? 8 : 7;
            recordsTbody.innerHTML = `<tr><td colspan="${colCount}" style="color:#ff5252; text-align:center; padding:20px;">
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
        let colCount = isEditMode ? 8 : 7;

        if (records.length === 0) {
            let emptyMsg = currentView === 'trash' ? "Trash Bin is empty." : "No sales records found for this period.";
            recordsTbody.innerHTML = `<tr><td colspan="${colCount}" style="text-align:center; padding:30px; color:#666;">${emptyMsg}</td></tr>`;
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
	    
            let payBadge = `<span class="badge" style="background:#28a745; color:white; border:none; padding:3px 6px; border-radius:4px; font-size:0.75rem;">💵 CASH</span>`;
            if (record.paymentCollected === 'card') {
                payBadge = `<span class="badge" style="background:#007bff; color:white; border:none; padding:3px 6px; border-radius:4px; font-size:0.75rem;">💳 CARD</span>`;
            }

            let amountDisplay = `${Number(amount).toFixed(2).replace('.', ',')} €`;

            let rowHtml = `
                <td>${recordDate}</td>
                <td>${recordTime}</td>
                <td style="font-weight:600; color:#fff;">${tableName}</td>
                <td>${typeBadge}</td>
		        <td>${payBadge}</td>
                <td style="text-align:right; font-family:monospace; font-size:1rem; color:var(--success);">${Number(amount).toFixed(2)} €</td>
                <td style="text-align:center;">
                    <button class="btn-tool" style="padding:4px 10px; font-size:0.8rem; background:transparent; border:1px solid #555;" onclick="window.showDetail('${record.id}')">View</button>
                </td>
            `;

            if (isEditMode) {
                const docIdsStr = record.docIds ? record.docIds.join(',') : record.id;
                rowHtml = `<td style="text-align:center;"><input type="checkbox" class="row-check" data-docids="${docIdsStr}" style="transform:scale(1.5); cursor:pointer;"></td>` + rowHtml;
            }

            const tr = document.createElement('tr');
            if (currentView === 'trash') tr.style.opacity = '0.5'; 
            tr.innerHTML = rowHtml;
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

    // --- 6. SIDE PANEL & THERMAL PRINT LOGIC ---
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

        const printBtn = document.querySelector('#detailPanel button.btn-primary');
        if (printBtn) {
            printBtn.removeAttribute('onclick');
            printBtn.onclick = function() {
                printThermalReceipt(record, calculatedSubtotal, discountAmount, couponName);
            };
        }

        detailPanel.classList.add('open');
    }

    function printThermalReceipt(record, calcSubtotal, discountAmount, couponName) {
        let dateStr = "N/A", timeStr = "N/A";
        if (record.closedAt && record.closedAt.toDate) {
            const d = record.closedAt.toDate();
            dateStr = d.toLocaleDateString('de-DE');
            timeStr = d.toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'});
        }

        let tableName = record.table ? `Tisch ${record.table}` : (record.customerName || "Gast");
        let orderIdShort = record.id ? record.id.substring(0, 6).toUpperCase() : Math.floor(Math.random()*10000).toString();
        
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

        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let tseSig = '';
        for(let i=0; i<40; i++) tseSig += chars.charAt(Math.floor(Math.random() * chars.length));

        const receiptHtml = `
        <html>
        <head>
            <title>Kassenbon #${orderIdShort}</title>
            <style>
                @page { margin: 0; }
                body { font-family: 'Courier New', Courier, monospace; font-size: 13px; color: #000; background: #fff; margin: 0; padding: 15px; width: 300px; box-sizing: border-box; }
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
            <div style="display:flex; justify-content:space-between;"><span>Datum: ${dateStr}</span><span>Zeit: ${timeStr}</span></div>
            <div style="display:flex; justify-content:space-between;"><span>Kunde: ${tableName}</span><span>Beleg: #${orderIdShort}</span></div>
            <div class="divider"></div>
            <div class="bold" style="display:flex; justify-content:space-between; margin-bottom: 8px;"><span>Artikel</span><span>EUR</span></div>
            ${itemsHtml}
            ${discountHtml}
            <div class="thick-divider"></div>
            <div class="bold" style="display:flex; justify-content:space-between; font-size: 16px;"><span>GESAMTBETRAG</span><span>${finalPaid.toFixed(2).replace('.', ',')} €</span></div>
            <div class="divider"></div>
            <div style="display:flex; justify-content:space-between; font-size: 11px;"><span>Netto</span><span>${netAmount.toFixed(2).replace('.', ',')}</span></div>
            <div style="display:flex; justify-content:space-between; font-size: 11px;"><span>MwSt (${taxLabel})</span><span>${taxAmount.toFixed(2).replace('.', ',')}</span></div>
            <div class="divider"></div>
            <div class="text-center" style="font-size: 10px; margin-top: 15px; color: #444;">
                <p>TSE-Signatur (KassenSichV):</p>
                <p style="word-break: break-all; margin-top: 5px;">TSE-${tseSig}</p>
                <p>Seriennummer: ER3984719002</p>
                <p style="margin-top:15px; color:#000; font-size: 12px;" class="bold">Vielen Dank für Ihren Besuch!</p>
            </div>
            <script>window.onload = function() { setTimeout(function() { window.print(); setTimeout(function() { window.close(); }, 500); }, 250); }</script>
        </body>
        </html>
        `;

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

    // --- 7. EXPORT TO CSV ---
    function exportToCSV() {
        if(currentDisplayRecords.length === 0) {
            alert("No data to export.");
            return;
        }

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Date,Time,OrderType,Payment,Table/Customer,Items,TotalAmount(EUR)\n";

        currentDisplayRecords.forEach(r => {
            let dateStr = "", timeStr = "";
            if (r.closedAt && r.closedAt.toDate) {
                const d = r.closedAt.toDate();
                dateStr = d.toLocaleDateString('de-DE');
                timeStr = d.toLocaleTimeString('de-DE');
            }            
            const name = (r.orderType === 'dine-in') ? `Table ${r.table}` : (r.customerName || "Customer");
            const total = Number(r.paidAmount || r.total || 0).toFixed(2);            
            
            let payText = "CASH";
            if (r.paymentCollected === 'card') payText = "CARD";

            let itemStr = "";
            if(r.items) itemStr = r.items.map(i => `${i.quantity}x ${i.name}`).join(" | ");
            itemStr = itemStr.replace(/,/g, "").replace(/"/g, "'"); 
            
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
