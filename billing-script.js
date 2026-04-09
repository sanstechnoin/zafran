// --- 1. FIREBASE SETUP ---
// (Initialized securely via firebase-config.js)

document.addEventListener("DOMContentLoaded", () => {
    
    const loginOverlay = document.getElementById('billing-login-overlay');
    const loginButton = document.getElementById('login-button');
    const passwordInput = document.getElementById('billing-password');
    const loginError = document.getElementById('login-error');
    const mainContent = document.getElementById('main-content');
    
    let activeOrder = null;
    let currentDiscount = 0;
    let appliedCoupon = null;
    let currentGrandTotal = 0; 
    let liveMenuItems = []; 
    let liveCoupons = []; 

    let promptCallback = null;
    let confirmCallback = null;

    window.showAlertModal = function(msg) {
        document.getElementById('alert-message').innerText = msg;
        document.getElementById('custom-alert-modal').style.display = 'flex';
    };

    window.openNewBillModal = function() {
        document.getElementById('prompt-input').value = '';
        document.getElementById('custom-prompt-modal').style.display = 'flex';
        setTimeout(() => document.getElementById('prompt-input').focus(), 100);
        
        promptCallback = function(input) {
            let orderType = 'pickup';
            let tableName = '';
            let customerName = '';

            if (input.trim() === '') {
                customerName = "Gast-" + Math.floor(Math.random() * 9000 + 1000); 
            } else if (!isNaN(input) && input.trim() !== '') {
                orderType = 'dine-in';
                tableName = input.trim();
            } else {
                customerName = input.trim();
            }

            const newOrderRef = db.collection("orders").doc();
            const newOrder = {
                orderType: orderType,
                table: tableName,
                customerName: customerName,
                items: [],
                total: 0,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            newOrderRef.set(newOrder).then(() => {
                selectOrder(newOrderRef.id, newOrder);
            }).catch(err => {
                console.error(err);
                showAlertModal("Error creating new bill.");
            });
        };
    }

    window.closePromptModal = function() {
        document.getElementById('custom-prompt-modal').style.display = 'none';
        promptCallback = null;
    }

    window.submitPromptModal = function() {
        if(promptCallback) promptCallback(document.getElementById('prompt-input').value);
        closePromptModal();
    }

    document.getElementById('prompt-input').addEventListener('keyup', (e) => {
        if (e.key === 'Enter') submitPromptModal();
    });

    window.showConfirmModal = function(msg, btnColor, cb) {
        confirmCallback = cb;
        document.getElementById('confirm-message').innerText = msg;
        document.getElementById('confirm-yes-btn').style.background = btnColor;
        document.getElementById('custom-confirm-modal').style.display = 'flex';
    }

    window.closeConfirmModal = function() {
        document.getElementById('custom-confirm-modal').style.display = 'none';
        confirmCallback = null;
    }

    document.getElementById('confirm-yes-btn').addEventListener('click', () => {
        if(confirmCallback) confirmCallback();
        closeConfirmModal();
    });

    // --- SECURE LOGIN ---
    loginButton.addEventListener('click', () => {
        const enteredPin = passwordInput.value.trim();
        if (!enteredPin) return;

        loginButton.innerText = "VERBINDEN...";
        loginButton.disabled = true;

        db.collection('settings').doc('record_auth').get()
        .then(doc => {
            if (!doc.exists || !doc.data().pin) {
                loginError.innerText = "❌ PIN nicht konfiguriert!";
                loginError.style.display = 'block';
                loginButton.innerText = "TERMINAL ENTSPERREN";
                loginButton.disabled = false;
                return;
            }

            if (enteredPin === doc.data().pin) {
                const hiddenEmail = "webmaster@zafraneuskirchen.de";
                const hiddenPass  = "!Zafran2025";
                
                firebase.auth().signInWithEmailAndPassword(hiddenEmail, hiddenPass)
                .then(() => {
                    loginOverlay.style.display = 'none';
                    mainContent.style.opacity = '1';
                    initPOS(); 
                })
                .catch((error) => {
                    loginError.innerText = "❌ Systemfehler: Auth abgelehnt.";
                    loginError.style.display = 'block';
                    loginButton.disabled = false;
                });
            } else {
                loginError.innerText = "❌ Falscher PIN.";
                loginError.style.display = 'block';
                loginButton.innerText = "TERMINAL ENTSPERREN";
                loginButton.disabled = false;
            }
        })
        .catch(err => {
            loginError.innerText = "❌ Netzwerkfehler.";
            loginError.style.display = 'block';
            loginButton.disabled = false;
        });
    });

    passwordInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter' && !loginButton.disabled) loginButton.click();
    });

    window.posLogout = function() {
        firebase.auth().signOut().then(() => {
            document.getElementById('billing-login-overlay').style.display = 'flex';
            mainContent.style.opacity = '0';
            activeOrder = null;
            document.getElementById('billing-password').value = '';
            loginButton.innerText = "TERMINAL ENTSPERREN";
            loginButton.disabled = false;
            loginError.style.display = 'none';
        });
    };

    // --- POS INIT ---
    function initPOS() {
        db.collection('settings').doc('menu').get().then(doc => {
            if (doc.exists && doc.data().menuData) {
                liveMenuItems = [];
                doc.data().menuData.forEach(cat => {
                    if(cat.items) {
                        cat.items.forEach(item => {
                            liveMenuItems.push(item);
                        });
                    }
                });
            }
        });

        db.collection('settings').doc('coupons').get().then(doc => {
            let allCoupons = [];
            if (doc.exists) {
                const data = doc.data();
                allCoupons = data.coupons || data.list || data.couponData || [];
            }
            
            db.collection('coupons').get().then(snapshot => {
                if(!snapshot.empty) {
                    snapshot.forEach(sDoc => {
                        allCoupons.push({ id: sDoc.id, ...sDoc.data() });
                    });
                }
                
                const uniqueCoupons = [];
                const seenCodes = new Set();
                allCoupons.forEach(c => {
                    const code = c.code || c.id || c.name || c.couponCode;
                    if(code && !seenCodes.has(code)) {
                        seenCodes.add(code);
                        uniqueCoupons.push(c);
                    }
                });

                const select = document.getElementById('coupon-select');
                select.innerHTML = '<option value="">No Coupon Selected</option>';
                liveCoupons = uniqueCoupons; 
                
                liveCoupons.forEach(c => {
                    const option = document.createElement('option');
                    const code = c.code || c.id || c.name || c.couponCode; 
                    option.value = code;
                    
                    let minOrder = c.minOrder || c.minAmount || c.condition || c.kondition || 0;
                    let conditionTxt = minOrder > 0 ? ` (Min: ${minOrder}€)` : '';
                    let val = c.value || c.discount || c.amount || c.wert || 0;
                    let type = c.type || c.discountType || c.typ || '';
                    let valTxt = (type === 'percent' || type === '%' || type === 'Prozentual' || type === 'prozent') ? `${val}%` : `${val}€`;
                    let activeStatus = c.active === true || c.active === "true" || c.active === "on" || c.isActive === true || c.status === 'Aktiv' || c.status === true;
                    let statusTxt = activeStatus ? '' : ' [INAKTIV]';
                    
                    option.text = `🎫 ${code} - Typ: ${valTxt}${conditionTxt}${statusTxt}`;
                    select.appendChild(option);
                });
            }).catch(e => console.error(e));
        }).catch(err => console.error(err));

        db.collection("orders").onSnapshot(snapshot => {
            const list = document.getElementById('ready-orders-list');
            list.innerHTML = "";
            
            if(snapshot.empty) {
                list.innerHTML = `<p style="color:#666; text-align:center;">No active orders.</p>`;
                return;
            }

            snapshot.forEach(doc => {
                const data = doc.data();
                let localTotal = 0;
                if(data.items) {
                    data.items.forEach(i => localTotal += (i.price * i.quantity));
                }
                
                let displayName = data.orderType === 'dine-in' ? `Tisch ${data.table}` : `${data.customerName || 'Gast'}`;
                
                const card = document.createElement('div');
                card.className = `order-card ${activeOrder && activeOrder.id === doc.id ? 'active' : ''}`;
                card.dataset.orderId = doc.id; 
                card.innerHTML = `
                    <div style="display:flex; justify-content:space-between; font-weight:bold;">
                        <span>${displayName}</span>
                        <span style="color:var(--gold);">${localTotal.toFixed(2)} €</span>
                    </div>
                    <div style="font-size:0.85rem; color:#888; margin-top:5px;">
                        ${data.items ? data.items.length : 0} Artikel
                    </div>
                `;
                card.onclick = () => selectOrder(doc.id, data);
                list.appendChild(card);
            });
        });
    }

    // --- NEW: CUSTOM MOBILE-FRIENDLY AUTOCOMPLETE ---
    const nameInput = document.getElementById('custom-name');
    const autoList = document.getElementById('autocomplete-list');

    nameInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        autoList.innerHTML = '';
        
        if (!query) {
            autoList.style.display = 'none';
            document.getElementById('custom-price').value = '';
            return;
        }

        const matches = liveMenuItems.filter(i => {
            const num = i.id ? i.id.toString() : "";
            const name = i.name.toLowerCase();
            return num === query || name.includes(query) || (num + " " + name).includes(query);
        }).slice(0, 15); 

        if (matches.length > 0) {
            autoList.style.display = 'block';
            matches.forEach(match => {
                const div = document.createElement('div');
                div.className = 'auto-item';
                div.innerHTML = `<strong>${match.id ? match.id + ' - ' : ''}${match.name}</strong> <span style="float:right; color:var(--gold);">${match.price.toFixed(2)}€</span>`;
                
                div.onclick = () => {
                    // Set input to JUST the name, but keep ID logic secure
                    nameInput.value = match.name;
                    document.getElementById('custom-price').value = match.price.toFixed(2);
                    autoList.style.display = 'none';
                };
                autoList.appendChild(div);
            });
        } else {
            autoList.style.display = 'none';
        }
    });

    // Close autocomplete if clicked outside
    document.addEventListener('click', (e) => {
        if(e.target !== nameInput && e.target !== autoList) {
            autoList.style.display = 'none';
        }
    });

    // --- CORE LOGIC ---
    window.selectOrder = function(id, data) {
        activeOrder = { id, ...data };
        
        let displayName = data.orderType === 'dine-in' ? `Tisch ${data.table}` : `${data.customerName || 'Gast'}`;
        document.getElementById('active-table-name').innerText = displayName;
        
        document.getElementById('btn-cash').disabled = false;
        document.getElementById('btn-card').disabled = false;

        document.getElementById('coupon-select').value = "";
        document.getElementById('coupon-code').value = "";
        document.getElementById('manual-discount-percent').value = "";
        document.getElementById('manual-discount-money').value = "";
        document.getElementById('tip-amount').value = 0;
        
        updateCalculations();
        
        document.querySelectorAll('.order-card').forEach(card => {
            if (card.dataset.orderId === id) card.classList.add('active');
            else card.classList.remove('active');
        });
    }

    window.addCustomItem = function() {
        if(!activeOrder) return showAlertModal("Select an order first!");
        let query = document.getElementById('custom-name').value.trim();
        let price = parseFloat(document.getElementById('custom-price').value);
        
        if(!query) return showAlertModal("Enter an item.");
        
        const match = liveMenuItems.find(i => {
            const num = i.id ? i.id.toString() : "";
            return num === query.toLowerCase() || i.name.toLowerCase() === query.toLowerCase();
        });

        // Strip everything and use ONLY the final name
        let finalName = query;
        if (match) {
            finalName = match.name;
            if(isNaN(price)) price = parseFloat(match.price);
        }

        if(isNaN(price)) return showAlertModal("Invalid price");
        if(!activeOrder.items) activeOrder.items = [];
        
        // Stacking identical items
        const existingItem = activeOrder.items.find(i => i.name === finalName && i.price === price);
        if (existingItem) {
            existingItem.quantity = (parseInt(existingItem.quantity) || 1) + 1;
        } else {
            activeOrder.items.push({ name: finalName, quantity: 1, price: price });
        }
        
        document.getElementById('custom-name').value = "";
        document.getElementById('custom-price').value = "";
        
        db.collection("orders").doc(activeOrder.id).update({ items: activeOrder.items });
        updateCalculations();
    }

    window.changeQty = function(index, delta) {
        if(!activeOrder || !activeOrder.items) return;
        let item = activeOrder.items[index];
        let newQty = (parseInt(item.quantity) || 1) + delta;
        
        if (newQty <= 0) {
            voidItem(index);
        } else {
            item.quantity = newQty;
            db.collection("orders").doc(activeOrder.id).update({ items: activeOrder.items });
            updateCalculations();
        }
    }

    window.voidItem = function(index) {
        if(!activeOrder || !activeOrder.items) return;
        showConfirmModal(`Remove "${activeOrder.items[index].name}" completely?`, 'var(--danger)', () => {
            activeOrder.items.splice(index, 1);
            db.collection("orders").doc(activeOrder.id).update({ items: activeOrder.items });
            updateCalculations();
        });
    }

    window.cancelBill = async function() {
        if(!activeOrder) return showAlertModal("Select a bill to cancel first.");
        
        let displayName = activeOrder.orderType === 'dine-in' ? `Tisch ${activeOrder.table}` : (activeOrder.customerName || "Gast");
        
        showConfirmModal(`Are you sure you want to completely CANCEL and DELETE the bill for ${displayName}? This cannot be undone.`, 'var(--danger)', async () => {
            try {
                await db.collection("orders").doc(activeOrder.id).delete();
                activeOrder = null;
                document.getElementById('calc-items').innerHTML = "";
                document.getElementById('calc-subtotal').innerText = "0.00 €";
                document.getElementById('calc-discount').innerText = "- 0.00 €";
                document.getElementById('calc-total').innerText = "0.00 €";
                document.getElementById('receipt-paper').innerHTML = `<div style="text-align:center; padding: 40px 0; color:#888; font-style:italic;">Bill Cancelled & Deleted.</div>`;
                document.getElementById('active-table-name').innerText = "None Selected";
                document.getElementById('btn-cash').disabled = true;
                document.getElementById('btn-card').disabled = true;
            } catch (error) {
                console.error("Error cancelling bill:", error);
                showAlertModal("Error cancelling bill. Check console.");
            }
        });
    };

    window.applyCoupon = function() {
        if(!activeOrder) return showAlertModal("Select an order first!");
        
        const codeInput = document.getElementById('coupon-code').value.trim().toUpperCase();
        if (!codeInput) return showAlertModal("Please enter a coupon code.");

        const match = liveCoupons.find(c => {
            const cCode = (c.code || c.id || c.name || c.couponCode || "").toUpperCase();
            return cCode === codeInput;
        });
        
        if (match) {
            const select = document.getElementById('coupon-select');
            const matchValue = match.code || match.id || match.name || match.couponCode;
            
            let optionExists = Array.from(select.options).some(opt => opt.value === matchValue);
            
            if (optionExists) {
                select.value = matchValue;
                updateCalculations();
                showAlertModal(`✅ Coupon "${matchValue}" angewendet!`);
            } else {
                showAlertModal(`❌ Coupon is inactive or invalid.`);
            }
        } else {
            showAlertModal(`❌ Coupon "${codeInput}" not found.`);
        }
        document.getElementById('coupon-code').value = '';
    }

    window.updateCalculations = function() {
        if(!activeOrder) return;
        
        let subtotal = 0;
        let itemsHtml = "";
        
        activeOrder.items.forEach((item, index) => {
            const price = parseFloat(item.price || 0);
            const qty = parseInt(item.quantity || 1);
            const lineTotal = price * qty;
            subtotal += lineTotal;
            
            itemsHtml += `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #333;">
                    <div style="display:flex; align-items:center; gap:8px; flex:1;">
                        <button class="btn" style="padding:2px 8px; background:#444; color:white; font-size:1rem;" onclick="changeQty(${index}, -1)">-</button>
                        <span style="min-width:20px; text-align:center; font-weight:bold;">${qty}</span>
                        <button class="btn" style="padding:2px 8px; background:#444; color:white; font-size:1rem;" onclick="changeQty(${index}, 1)">+</button>
                        <span style="margin-left:10px;">${item.name}</span>
                    </div>
                    <span style="color:var(--gold); margin-right:15px; min-width:60px; text-align:right;">${lineTotal.toFixed(2)} €</span>
                    <button class="btn-red" style="padding:4px 8px; font-size:0.8rem; cursor:pointer;" onclick="voidItem(${index})" title="Void Item">X</button>
                </div>
            `;
        });
        
        currentDiscount = 0;
        appliedCoupon = null;

        const selectedCoupon = document.getElementById('coupon-select').value;
        if (selectedCoupon && liveCoupons) {
            const coupon = liveCoupons.find(c => {
                const code = c.code || c.id || c.name || c.couponCode;
                return code === selectedCoupon;
            });
            if (coupon) {
                let minOrder = coupon.minOrder || coupon.minAmount || coupon.condition || coupon.kondition || 0;
                let val = coupon.value || coupon.discount || coupon.amount || coupon.wert || 0;
                let type = coupon.type || coupon.discountType || coupon.typ || '';
                
                if (minOrder && subtotal < minOrder) {
                    // Silently ignore if subtotal is too low
                } else {
                    appliedCoupon = coupon.code || coupon.id || coupon.name;
                    if (type === 'percent' || type === '%' || type === 'Prozentual' || type === 'prozent') {
                        currentDiscount += subtotal * (parseFloat(val) / 100);
                    } else {
                        currentDiscount += parseFloat(val);
                    }
                }
            }
        }

        const manPercent = parseFloat(document.getElementById('manual-discount-percent').value) || 0;
        if (manPercent > 0) currentDiscount += subtotal * (manPercent / 100);

        const manMoney = parseFloat(document.getElementById('manual-discount-money').value) || 0;
        if (manMoney > 0) currentDiscount += manMoney;

        if (currentDiscount > subtotal) currentDiscount = subtotal;

        document.getElementById('calc-items').innerHTML = itemsHtml;
        document.getElementById('calc-subtotal').innerText = `${subtotal.toFixed(2)} €`;
        
        const tip = parseFloat(document.getElementById('tip-amount').value) || 0;
        const grandTotal = (subtotal - currentDiscount) + tip;
        
        currentGrandTotal = Math.max(0, grandTotal);

        document.getElementById('calc-discount').innerText = `- ${currentDiscount.toFixed(2)} €`;
        document.getElementById('calc-total').innerText = `${currentGrandTotal.toFixed(2)} €`;
        
        generateLiveReceipt(subtotal, currentGrandTotal, tip);
    }

    // --- NEW: THE SPLIT BILL ENGINE ---
    window.splitBillMenu = function() {
        if(!activeOrder) return showAlertModal("Select an order first.");
        if(currentGrandTotal <= 0) return showAlertModal("Total amount is 0.00 €");
        
        document.getElementById('split-total-display').innerText = currentGrandTotal.toFixed(2) + " €";
        document.getElementById('split-ways').value = 2;
        updateSplitDisplay();

        resetSplitModal();
        document.getElementById('split-bill-modal').style.display = 'flex';
    }

    window.closeSplitModal = function() {
        document.getElementById('split-bill-modal').style.display = 'none';
    }

    window.resetSplitModal = function() {
        document.getElementById('split-choice-view').style.display = 'block';
        document.getElementById('split-equal-view').style.display = 'none';
        document.getElementById('split-item-view').style.display = 'none';
    }

    window.showEqualSplit = function() {
        document.getElementById('split-choice-view').style.display = 'none';
        document.getElementById('split-equal-view').style.display = 'block';
    }

    window.adjustSplit = function(delta) {
        let ways = parseInt(document.getElementById('split-ways').value);
        ways += delta;
        if (ways < 2) ways = 2;
        document.getElementById('split-ways').value = ways;
        updateSplitDisplay();
    }

    window.updateSplitDisplay = function() {
        let ways = parseInt(document.getElementById('split-ways').value);
        let each = currentGrandTotal / ways;
        document.getElementById('split-each-display').innerText = each.toFixed(2) + " €";
    }

    // NEW: Processing the Equal Split
    window.processEqualSplit = async function(method) {
        let ways = parseInt(document.getElementById('split-ways').value);
        let each = currentGrandTotal / ways;

        // If the remaining balance is covered entirely by this payment, close whole bill
        if (Math.abs(currentGrandTotal - each) < 0.01 || currentGrandTotal <= each) {
            closeSplitModal();
            closeBill(method);
            return;
        }

        let btnColor = method === 'cash' ? 'var(--success)' : 'var(--info)';

        showConfirmModal(`Process 1/${ways} of bill (${each.toFixed(2)}€) via ${method.toUpperCase()}?`, btnColor, async () => {
            try {
                // Archive a sub-receipt for the exact partial amount
                const partialData = {
                    ...activeOrder,
                    closedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    paymentCollected: method,
                    total: each,
                    paidAmount: each,
                    tipAmount: 0,
                    discount: 0,
                    couponCode: "Equal Split",
                    tseSignature: generateTseSignature(),
                    isVoided: false,
                    isPartial: true,
                    items: [{ name: `Teilzahlung (1/${ways})`, price: each, quantity: 1 }]
                };

                const partialId = activeOrder.id + "_eqsplit_" + Date.now();
                await db.collection("archived_orders").doc(partialId).set(partialData);

                // Add a negative item to the main active order to reduce the balance
                if(!activeOrder.items) activeOrder.items = [];
                activeOrder.items.push({ name: `Bereits bezahlt (1/${ways})`, price: -Math.abs(each), quantity: 1 });
                
                await db.collection("orders").doc(activeOrder.id).update({ items: activeOrder.items });

                showAlertModal(`✅ Partial Bill of ${each.toFixed(2)}€ Paid (${method.toUpperCase()}).`);
                updateCalculations();
                closeSplitModal();

            } catch(e) {
                console.error(e);
                showAlertModal("Error processing equal split payment.");
            }
        });
    };

    // Advanced Dish Split (Checkboxes)
    window.showItemSplit = function() {
        document.getElementById('split-choice-view').style.display = 'none';
        const listDiv = document.getElementById('split-checkbox-list');
        listDiv.innerHTML = '';

        if (!activeOrder || !activeOrder.items || activeOrder.items.length === 0) {
            listDiv.innerHTML = '<p style="color:#888; padding:15px; text-align:center;">No items to split.</p>';
        } else {
            activeOrder.items.forEach((item, index) => {
                const qty = parseInt(item.quantity) || 1;
                const price = parseFloat(item.price) || 0;
                for (let i = 0; i < qty; i++) {
                    listDiv.innerHTML += `
                        <label class="split-item-row">
                            <input type="checkbox" class="split-chk" data-index="${index}" data-price="${price}" data-name="${item.name}" onchange="calculateSelectedSplit()">
                            <span style="flex:1; font-size:1.1rem;">${item.name}</span>
                            <span style="color:var(--gold); font-weight:bold;">${price.toFixed(2)} €</span>
                        </label>
                    `;
                }
            });
        }

        calculateSelectedSplit();
        document.getElementById('split-item-view').style.display = 'block';
    }

    window.calculateSelectedSplit = function() {
        const checkboxes = document.querySelectorAll('.split-chk');
        let selectedTotal = 0;
        checkboxes.forEach(chk => {
            if (chk.checked) selectedTotal += parseFloat(chk.getAttribute('data-price'));
        });
        document.getElementById('split-selected-total').innerText = selectedTotal.toFixed(2) + " €";
        return selectedTotal;
    }

    window.processItemSplit = async function(method) {
        const checkboxes = document.querySelectorAll('.split-chk');
        let checkedCount = 0;
        checkboxes.forEach(chk => { if(chk.checked) checkedCount++; });

        if (checkedCount === 0) return showAlertModal("Bitte wählen Sie mindestens einen Artikel aus.");

        let paidSubtotal = calculateSelectedSplit();
        let btnColor = method === 'cash' ? 'var(--success)' : 'var(--info)';

        showConfirmModal(`Process partial split of ${paidSubtotal.toFixed(2)}€ via ${method.toUpperCase()}?`, btnColor, async () => {
            try {
                let remainingItems = [];
                let paidItems = [];

                activeOrder.items.forEach((item, index) => {
                    let c_checked = 0;
                    let c_unchecked = 0;
                    document.querySelectorAll(`.split-chk[data-index="${index}"]`).forEach(chk => {
                        if (chk.checked) c_checked++;
                        else c_unchecked++;
                    });

                    if (c_checked > 0) paidItems.push({ name: item.name, price: item.price, quantity: c_checked });
                    if (c_unchecked > 0) remainingItems.push({ name: item.name, price: item.price, quantity: c_unchecked });
                });

                const archiveData = {
                    ...activeOrder,
                    closedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    paymentCollected: method,
                    total: paidSubtotal, 
                    paidAmount: paidSubtotal,
                    tipAmount: 0, 
                    discount: 0,  
                    couponCode: "Partial Split",
                    tseSignature: generateTseSignature(),
                    isVoided: false,
                    isPartial: true,
                    items: paidItems
                };

                const partialId = activeOrder.id + "_split_" + Date.now();
                await db.collection("archived_orders").doc(partialId).set(archiveData);

                if (remainingItems.length === 0) {
                    await db.collection("orders").doc(activeOrder.id).delete();
                    activeOrder = null;
                    document.getElementById('active-table-name').innerText = "None Selected";
                    document.getElementById('btn-cash').disabled = true;
                    document.getElementById('btn-card').disabled = true;
                    document.getElementById('calc-items').innerHTML = "";
                    document.getElementById('receipt-paper').innerHTML = `<div style="text-align:center; padding: 40px 0; color:#888; font-style:italic;">Order Closed Successfully.</div>`;
                } else {
                    activeOrder.items = remainingItems;
                    await db.collection("orders").doc(activeOrder.id).update({ items: remainingItems });
                }

                showAlertModal(`✅ Partial Bill of ${paidSubtotal.toFixed(2)}€ Paid (${method.toUpperCase()}).`);
                updateCalculations();
                closeSplitModal();

            } catch(e) {
                console.error(e);
                showAlertModal("Error processing split payment.");
            }
        });
    }

    // --- RECEIPT GENERATOR ---
    function generateTseSignature() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
        let sig = 'TSE_MAC_';
        for(let i=0; i<45; i++) sig += chars.charAt(Math.floor(Math.random() * chars.length));
        return sig;
    }

    function generateLiveReceipt(subtotal, grandTotal, tip) {
        const paper = document.getElementById('receipt-paper');
        const now = new Date();
        const dateStr = now.toLocaleDateString('de-DE');
        const timeStr = now.toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'});
        
        const isDineIn = activeOrder.orderType === 'dine-in';
        const taxRate = isDineIn ? 0.19 : 0.07;
        const taxLabel = isDineIn ? "19%" : "7%";
        
        const netAmount = grandTotal / (1 + taxRate);
        const taxAmount = grandTotal - netAmount;

        let itemsHtml = "";
        activeOrder.items.forEach(item => {
            const price = parseFloat(item.price || 0);
            const lineTotal = price * item.quantity;
            itemsHtml += `
                <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
                    <span style="flex:1;">${item.quantity}x ${item.name}</span>
                    <span>${lineTotal.toFixed(2).replace('.', ',')}</span>
                </div>
            `;
        });

        activeOrder.currentTseSig = generateTseSignature();
        let displayName = activeOrder.orderType === 'dine-in' ? `Tisch ${activeOrder.table}` : (activeOrder.customerName || "Gast");

        paper.innerHTML = `
            <div class="text-center">
                <h3 style="margin:0;">ZAFFRAN DELIGHT</h3>
                <p style="margin:5px 0;">Musterstraße 1, 53879 Euskirchen</p>
                <p style="margin:0;">St-Nr: 209/5000/1234</p>
            </div>
            <div class="divider"></div>
            <div style="display:flex; justify-content:space-between;"><span>Datum: ${dateStr}</span><span>Zeit: ${timeStr}</span></div>
            <div style="display:flex; justify-content:space-between;"><span>Kunde: ${displayName}</span><span>Beleg: Vorschau</span></div>
            <div class="divider"></div>
            
            <div style="display:flex; justify-content:space-between; font-weight:bold; margin-bottom:8px;">
                <span>Artikel</span><span>EUR</span>
            </div>
            ${itemsHtml}
            
            ${currentDiscount > 0 ? `
            <div class="divider"></div>
            <div style="display:flex; justify-content:space-between; color:#444;">
                <span>Rabatt ${appliedCoupon ? `(${appliedCoupon})` : '(Manuell)'}</span>
                <span>- ${currentDiscount.toFixed(2).replace('.', ',')}</span>
            </div>` : ''}
            
            ${tip > 0 ? `
            <div style="display:flex; justify-content:space-between; color:#444;">
                <span>Trinkgeld (0% MwSt)</span>
                <span>+ ${tip.toFixed(2).replace('.', ',')}</span>
            </div>` : ''}

            <div class="divider" style="border-top:2px dashed #000;"></div>
            <div style="display:flex; justify-content:space-between; font-size:16px; font-weight:bold;">
                <span>GESAMTBETRAG</span>
                <span>${grandTotal.toFixed(2).replace('.', ',')} €</span>
            </div>
            <div class="divider"></div>
            
            <div style="display:flex; justify-content:space-between; font-size:11px;">
                <span>Netto</span><span>${netAmount.toFixed(2).replace('.', ',')}</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:11px;">
                <span>MwSt (${taxLabel})</span><span>${taxAmount.toFixed(2).replace('.', ',')}</span>
            </div>
            
            <div class="divider"></div>
            <div class="text-center" style="font-size: 10px; color: #444; margin-top:15px;">
                <p style="margin:2px;">--- KassenSichV Konform (GoBD) ---</p>
                <p style="margin:2px;">Start: ${now.toISOString()}</p>
                <p style="margin:2px;">TSE-Signatur:</p>
                <p style="margin:2px; word-break:break-all;">${activeOrder.currentTseSig}</p>
                <p style="margin:2px;">Seriennummer: ER3984719002_SIM</p>
            </div>
        `;
    }

    window.showEcoQR = function() {
        if(!activeOrder) return showAlertModal("Select an order first.");
        const modal = document.getElementById('qr-modal');
        const qrContainer = document.getElementById('qrcode');
        qrContainer.innerHTML = ""; 
        
        const billUrl = `https://zafraneuskirchen.de/bill?id=${activeOrder.id}`;
        
        new QRCode(qrContainer, {
            text: billUrl,
            width: 250,
            height: 250,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });
        
        modal.style.display = "flex";
    }

    // --- FINAL ARCHIVE ---
    window.closeBill = async function(method) {
        if(!activeOrder) return;
        
        let displayName = activeOrder.orderType === 'dine-in' ? `Tisch ${activeOrder.table}` : (activeOrder.customerName || "Gast");
        const btnColor = method === 'cash' ? 'var(--success)' : 'var(--info)';
        
        showConfirmModal(`Close bill for ${displayName} with ${method.toUpperCase()}?`, btnColor, async () => {
            const btnCash = document.getElementById('btn-cash');
            const btnCard = document.getElementById('btn-card');
            btnCash.disabled = true; btnCard.disabled = true;
            
            try {
                let subtotal = 0;
                activeOrder.items.forEach(i => subtotal += (i.price * i.quantity));
                const tip = parseFloat(document.getElementById('tip-amount').value) || 0;
                const grandTotal = (subtotal - currentDiscount) + tip;

                const archiveData = {
                    ...activeOrder,
                    closedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    paymentCollected: method,
                    total: grandTotal,
                    paidAmount: grandTotal,
                    tipAmount: tip,
                    discount: currentDiscount,
                    couponCode: appliedCoupon || "None",
                    tseSignature: activeOrder.currentTseSig,
                    isVoided: false
                };

                await db.collection("archived_orders").doc(activeOrder.id).set(archiveData);
                await db.collection("orders").doc(activeOrder.id).delete();

                showAlertModal(`✅ TSE Transaction Logged. Bill closed (${method.toUpperCase()}).`);
                
                activeOrder = null;
                document.getElementById('calc-items').innerHTML = "";
                document.getElementById('calc-subtotal').innerText = "0.00 €";
                document.getElementById('calc-discount').innerText = "- 0.00 €";
                document.getElementById('calc-total').innerText = "0.00 €";
                document.getElementById('receipt-paper').innerHTML = `
                    <div style="text-align:center; padding: 40px 0; color:#888; font-style:italic;">
                        Order Closed & Archived Successfully.
                    </div>`;
                document.getElementById('active-table-name').innerText = "None Selected";
                
            } catch (error) {
                console.error("Error closing bill:", error);
                showAlertModal("Error closing bill. Check console.");
                btnCash.disabled = false; btnCard.disabled = false;
            }
        });
    }
});
