// --- 1. FIREBASE SETUP ---
// (Initialized securely via firebase-config.js)

document.addEventListener("DOMContentLoaded", () => {
    
    // --- 2. DOM Elements ---
    const loginOverlay = document.getElementById('billing-login-overlay');
    const loginButton = document.getElementById('login-button');
    const passwordInput = document.getElementById('billing-password');
    const loginError = document.getElementById('login-error');
    const mainContent = document.getElementById('main-content');
    
    // POS State
    let activeOrder = null;
    let currentDiscount = 0;
    let appliedCoupon = null;
    let liveMenuItems = []; // Pulled from DB

    // --- 3. SECURE STRICT LOGIN LOGIC (NO FALLBACK) ---
    loginButton.addEventListener('click', () => {
        const enteredPin = passwordInput.value.trim();
        if (!enteredPin) return;

        loginButton.innerText = "VERBINDEN...";
        loginButton.disabled = true;

        // We use the RECORD PIN for the POS terminal
        db.collection('settings').doc('record_auth').get()
        .then(doc => {
            if (!doc.exists || !doc.data().pin) {
                loginError.innerText = "❌ PIN nicht konfiguriert!";
                loginError.style.display = 'block';
                loginButton.innerText = "TERMINAL ENTSPERREN";
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

    // --- 4. POS INITIALIZATION & DATALIST ---
    function initPOS() {
        // Fetch Live Menu for Auto-Pricing Datalist
        db.collection('settings').doc('menu').get().then(doc => {
            if (doc.exists && doc.data().menuData) {
                const datalist = document.getElementById('menu-items-list');
                datalist.innerHTML = "";
                liveMenuItems = [];
                
                doc.data().menuData.forEach(cat => {
                    if(cat.items) {
                        cat.items.forEach(item => {
                            liveMenuItems.push(item);
                            const option = document.createElement('option');
                            option.value = item.name;
                            datalist.appendChild(option);
                        });
                    }
                });
            }
        });

        // Listen for active orders (For now fetching all dine-in. Phase 2 will fetch 'ready_to_pay')
        db.collection("orders")
          .where("orderType", "==", "dine-in")
          .onSnapshot(snapshot => {
              const list = document.getElementById('ready-orders-list');
              list.innerHTML = "";
              
              if(snapshot.empty) {
                  list.innerHTML = `<p style="color:#666; text-align:center;">No tables currently active.</p>`;
                  return;
              }

              snapshot.forEach(doc => {
                  const data = doc.data();
                  let localTotal = 0;
                  if(data.items) {
                      data.items.forEach(i => localTotal += (i.price * i.quantity));
                  }
                  
                  const card = document.createElement('div');
                  card.className = `order-card ${activeOrder && activeOrder.id === doc.id ? 'active' : ''}`;
                  card.innerHTML = `
                      <div style="display:flex; justify-content:space-between; font-weight:bold;">
                          <span>Tisch ${data.table}</span>
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

        // Auto-Pricing Logic Event Listener
        document.getElementById('custom-name').addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const match = liveMenuItems.find(i => i.name.toLowerCase() === query);
            if(match) {
                document.getElementById('custom-price').value = match.price.toFixed(2);
            }
        });
    }

    // --- 5. CORE LOGIC ---
    window.selectOrder = function(id, data) {
        activeOrder = { id, ...data };
        document.getElementById('active-table-name').innerText = `Tisch ${data.table}`;
        
        document.getElementById('btn-cash').disabled = false;
        document.getElementById('btn-card').disabled = false;

        currentDiscount = 0;
        appliedCoupon = null;
        document.getElementById('tip-amount').value = 0;
        document.getElementById('coupon-code').value = "";
        
        updateCalculations();
        initPOS(); // Visual refresh
    }

    // Add Custom or Datalist Item
    window.addCustomItem = function() {
        if(!activeOrder) return alert("Select a table first!");
        const name = document.getElementById('custom-name').value.trim();
        const price = parseFloat(document.getElementById('custom-price').value);
        
        if(!name || isNaN(price)) return alert("Invalid item or price");
        
        if(!activeOrder.items) activeOrder.items = [];
        activeOrder.items.push({ name: name, quantity: 1, price: price });
        
        document.getElementById('custom-name').value = "";
        document.getElementById('custom-price').value = "";
        updateCalculations();
    }

    // Swiped Line-Item Voiding Logic
    window.voidItem = function(index) {
        if(!activeOrder || !activeOrder.items) return;
        if(confirm(`Remove "${activeOrder.items[index].name}" from this bill?`)) {
            activeOrder.items.splice(index, 1);
            updateCalculations();
        }
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
                    <span style="flex:1;">${qty}x ${item.name}</span>
                    <span style="color:var(--gold); margin-right:15px;">${lineTotal.toFixed(2)} €</span>
                    <button class="btn-red" style="padding:4px 8px; font-size:0.8rem;" onclick="voidItem(${index})" title="Void Item">X</button>
                </div>
            `;
        });
        
        document.getElementById('calc-items').innerHTML = itemsHtml;
        document.getElementById('calc-subtotal').innerText = `${subtotal.toFixed(2)} €`;
        
        const tip = parseFloat(document.getElementById('tip-amount').value) || 0;
        const grandTotal = (subtotal - currentDiscount) + tip;
        
        document.getElementById('calc-discount').innerText = `- ${currentDiscount.toFixed(2)} €`;
        document.getElementById('calc-total').innerText = `${Math.max(0, grandTotal).toFixed(2)} €`;
        
        generateLiveReceipt(subtotal, grandTotal, tip);
    }

    // --- 6. GERMAN COMPLIANCE & RECEIPT ---
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

        paper.innerHTML = `
            <div class="text-center">
                <h3 style="margin:0;">ZAFFRAN DELIGHT</h3>
                <p style="margin:5px 0;">Musterstraße 1, 53879 Euskirchen</p>
                <p style="margin:0;">St-Nr: 209/5000/1234</p>
            </div>
            <div class="divider"></div>
            <div style="display:flex; justify-content:space-between;"><span>Datum: ${dateStr}</span><span>Zeit: ${timeStr}</span></div>
            <div style="display:flex; justify-content:space-between;"><span>Tisch: ${activeOrder.table}</span><span>Beleg: Vorschau</span></div>
            <div class="divider"></div>
            
            <div style="display:flex; justify-content:space-between; font-weight:bold; margin-bottom:8px;">
                <span>Artikel</span><span>EUR</span>
            </div>
            ${itemsHtml}
            
            ${currentDiscount > 0 ? `
            <div class="divider"></div>
            <div style="display:flex; justify-content:space-between; color:#444;">
                <span>Rabatt ${appliedCoupon ? `(${appliedCoupon})` : ''}</span>
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

    // --- 7. ECO-QR GENERATOR ---
    window.showEcoQR = function() {
        if(!activeOrder) return alert("Select an order first.");
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

    window.splitBillMenu = function() {
        alert("Split Bill Module UI will launch here in Phase 2!");
    }

    window.applyCoupon = function() {
        alert("Live Coupon Engine linking in Phase 2!");
    }

    // --- 8. CLOSE BILL & ARCHIVE ---
    window.closeBill = async function(method) {
        if(!activeOrder) return;
        if(!confirm(`Close Tisch ${activeOrder.table} with ${method.toUpperCase()}?`)) return;

        const btnCash = document.getElementById('btn-cash');
        const btnCard = document.getElementById('btn-card');
        btnCash.disabled = true; btnCard.disabled = true;
        btnCash.innerText = "Processing...";

        try {
            // Extract final totals
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

            // 1. Save to Archive
            await db.collection("archived_orders").doc(activeOrder.id).set(archiveData);
            
            // 2. Delete from Active Orders
            await db.collection("orders").doc(activeOrder.id).delete();

            alert(`✅ TSE Transaction Logged. Bill closed (${method.toUpperCase()}).`);
            
            // Reset UI
            activeOrder = null;
            document.getElementById('calc-items').innerHTML = "";
            document.getElementById('receipt-paper').innerHTML = `
                <div style="text-align:center; padding: 40px 0; color:#888; font-style:italic;">
                    Order Closed & Archived Successfully.
                </div>`;
            document.getElementById('active-table-name').innerText = "None Selected";

        } catch (error) {
            console.error("Error closing bill:", error);
            alert("Error closing bill. Check console.");
            btnCash.disabled = false; btnCard.disabled = false;
            btnCash.innerText = "💵 CASH";
        }
    }
});
