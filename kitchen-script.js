// --- 1. INITIALIZE FIREBASE via config file---

// --- 2. HELPER: GET DISH NUMBER & ALLERGY ---
function getDishNumber(name) {
    const item = MENU_ITEMS.find(m => m.name === name);
    return item ? ` - ${item.id}` : "";
}

function getAllergyBadge(name) {
    const item = MENU_ITEMS.find(m => m.name === name);
    return (item && item.allergy) ? `<span style="color:#ff4444; font-size:0.8em; margin-left:10px; font-weight:bold; border:1px solid #ff4444; padding:2px 6px; border-radius:4px;">[Allergie: ${item.allergy}]</span>` : "";
}

// --- 3. DOM ELEMENTS ---
const connectionIconEl = document.getElementById('connection-icon');
const loginOverlay = document.getElementById('kitchen-login-overlay');
const loginButton = document.getElementById('login-button');
const passwordInput = document.getElementById('kitchen-password');
const loginError = document.getElementById('login-error');
const kdsContentWrapper = document.getElementById('kds-content-wrapper');
const dineInGrid = document.getElementById('dine-in-grid');
const pickupGrid = document.getElementById('pickup-grid');

// Popups & Controls
const newOrderPopup = document.getElementById('new-order-popup-overlay');
const popupOrderDetails = document.getElementById('popup-order-details');
const actionButtonsContainer = document.getElementById('popup-action-buttons');
const masterClearBtn = document.getElementById('master-clear-btn');

// Waiter Call
const waiterCallOverlay = document.getElementById('waiter-call-overlay');
const waiterCallTableText = document.getElementById('waiter-call-table');
const dismissWaiterBtn = document.getElementById('dismiss-waiter-btn');
let currentWaiterCallId = null;

// Audio
const alertAudio = document.getElementById('alertSound');
const KITCHEN_PASSWORD = "zafran"; 
const TOTAL_DINE_IN_TABLES = 12;
let allOrders = {};

// --- NEW QUEUE VARIABLES ---
let newOrderQueue = []; 

// --- 4. SECURE LOGIN LOGIC ---
document.addEventListener("DOMContentLoaded", () => {
    loginButton.addEventListener('click', () => {
        // 1. Check if staff typed "zafran"
        if (passwordInput.value === KITCHEN_PASSWORD) {
            
            // 2. Secretly Log in to Firebase
            const hiddenEmail = "webmaster@zafraneuskirchen.de";
            const hiddenPass  = "!Zafran2025";

            const originalText = loginButton.innerText;
            loginButton.innerText = "Verbinden...";
            loginButton.disabled = true;

            firebase.auth().signInWithEmailAndPassword(hiddenEmail, hiddenPass)
            .then(() => {
                // Success! Unlock screen
                loginOverlay.classList.add('hidden');
                kdsContentWrapper.style.opacity = '1';
                
                // Unlock Audio for Alerts
                alertAudio.play().then(() => {
                    alertAudio.pause();
                    alertAudio.currentTime = 0;
                }).catch(e => console.log("Audio Init:", e));

                // Start the App
                initializeKDS(); 
            })
            .catch((error) => {
                console.error("Login Error:", error);
                loginError.innerText = "Verbindungsfehler (Auth)";
                loginError.style.display = 'block';
                loginButton.innerText = originalText;
                loginButton.disabled = false;
            });

        } else {
            loginError.innerText = "Falsches Passwort";
            loginError.style.display = 'block';
        }
    });

    passwordInput.addEventListener('keyup', (e) => e.key === 'Enter' && loginButton.click());
});

// --- 5. INITIALIZE KDS ---
function initializeKDS() {
    createDineInTables();

    // Listen for Clear Buttons (Single Table)
    dineInGrid.querySelectorAll('.clear-table-btn').forEach(btn => {
        btn.addEventListener('click', () => handleClearOrder(btn.dataset.tableId, 'dine-in', btn));
    });

    // Listen for MASTER CLEAR Button
    if(masterClearBtn) {
        masterClearBtn.addEventListener('click', handleMasterClear);
    }

    // START LISTENER
    db.collection("orders")
      .where("status", "in", ["new", "seen", "ready", "cooked"]) 
      .onSnapshot((snapshot) => {
            if(connectionIconEl) connectionIconEl.textContent = '✅'; 
            
            dineInGrid.innerHTML = ''; // Re-render
            createDineInTables(); 
            pickupGrid.innerHTML = '';

            snapshot.docChanges().forEach((change) => {
                const orderData = change.doc.data();
                
                // Waiter Call
                if (orderData.orderType === 'assistance') {
                    if (change.type === "added") showWaiterCall(orderData.table, change.doc.id);
                    if (change.type === "removed" && currentWaiterCallId === change.doc.id) waiterCallOverlay.classList.add('hidden');
                    return;
                }

                // New Order -> Add to Queue
                if (change.type === "added" && orderData.status === "new") {
                    // Check if already in queue to prevent dupes
                    if (!newOrderQueue.find(o => o.id === orderData.id)) {
                        newOrderQueue.push(orderData);
                        // Sort by Time (Oldest First)
                        newOrderQueue.sort((a, b) => a.createdAt - b.createdAt);
                        processNewOrderQueue(); 
                    }
                }
            });

            // Process all docs for display
            const allDocs = [];
            snapshot.forEach(doc => allDocs.push({id: doc.id, ...doc.data()}));
            
            // Sort by Time
            allDocs.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));

            // Populate global state
            allOrders = {};
            allDocs.forEach(d => allOrders[d.id] = d);

            // Render Grids
            const tablesWithOrders = new Set();
            allDocs.forEach(order => {
                if(order.orderType === 'assistance') return;
                
                if (order.orderType === 'pickup' || order.orderType === 'delivery') {
                    // handled by renderOnlineGrid
                } else {
                    tablesWithOrders.add(order.table);
                }
            });

            renderOnlineGrid();
            tablesWithOrders.forEach(t => renderDineInTable(t));

      }, (error) => {
          console.error("Firebase Error:", error);
          if(connectionIconEl) connectionIconEl.textContent = '❌'; 
      });
}

function createDineInTables() {
    dineInGrid.innerHTML = '';
    for (let i = 1; i <= TOTAL_DINE_IN_TABLES; i++) {
        const tableBox = document.createElement('div');
        tableBox.className = 'table-box';
        tableBox.id = `table-${i}`; 
        tableBox.innerHTML = `
            <div class="table-header"><h2>Table ${i}</h2></div>
            <ul class="order-list"></ul>
            <p class="order-list-empty">Waiting for order...</p>
            <button class="clear-table-btn" data-table-id="${i}">Clear Table ${i}</button>
        `;
        dineInGrid.appendChild(tableBox);
    }
}

// --- QUEUE & POPUP LOGIC ---
function processNewOrderQueue() {
    // If queue is empty, stop everything
    if (newOrderQueue.length === 0) {
        newOrderPopup.classList.add('hidden');
        alertAudio.loop = false;
        alertAudio.pause();
        alertAudio.currentTime = 0;
        return;
    }

    // Get the first order (Oldest)
    const currentOrder = newOrderQueue[0];
    
    // Play Sound Loop
    alertAudio.loop = true;
    alertAudio.play().catch(e => console.log(e));

    // Render Popup
    let title = "";
    if (currentOrder.orderType === 'pickup') title = `🛍️ Pickup: ${currentOrder.customerName}`;
    else if (currentOrder.orderType === 'delivery') title = `🚚 Delivery: ${currentOrder.customerName}`;
    else title = `🍽️ Table ${currentOrder.table}`;

    let itemsHtml = currentOrder.items.map(item => 
        `<li>${item.quantity}x ${item.name} <strong style="color:var(--gold);">${getDishNumber(item.name)}</strong></li>`
    ).join('');

    const pendingText = `
        <div style="font-size: 1.5rem; color: black; background: #D4AF37; padding: 10px; border-radius: 5px; margin-bottom: 20px; font-weight: bold; border: 2px solid white;">
            PENDING ORDERS: ${newOrderQueue.length}
        </div>`;

    // NEW: Grab the address if it's a delivery!
    let addressHtml = "";
    if (currentOrder.orderType === 'delivery' && currentOrder.deliveryAddress) {
        addressHtml = `
        <div style="font-size: 1.8rem; color: white; background: #222; padding: 15px; border-radius: 8px; border: 1px solid #555; margin-bottom: 20px;">
            📍 ${currentOrder.deliveryAddress.street} ${currentOrder.deliveryAddress.house}, ${currentOrder.deliveryAddress.zip}
        </div>`;
    }

    popupOrderDetails.innerHTML = `
        ${pendingText}
        <h2>${title}</h2>
        ${addressHtml}
        <ul>${itemsHtml}</ul>
        ${currentOrder.notes ? `<p style="color:#ff8888;">⚠️ ${currentOrder.notes}</p>` : ''}
    `;

    // INJECT DYNAMIC TIME BUTTONS BASED ON TYPE
    if (currentOrder.orderType === 'dine-in') {
        // --- TABLE ORDERS: ONLY "ACCEPT" BUTTON ---
        actionButtonsContainer.innerHTML = `
            <button onclick="acceptOrderWithTime(0)" style="font-size:2rem; padding:25px; width:100%; font-weight:bold; background-color:#D4AF37; color:black; border:none; border-radius:10px; cursor:pointer;">
                ACCEPT TABLE ORDER ✅
            </button>
        `;
  } else {
        // --- ONLINE ORDERS: TIMELINES & REJECT BUTTONS ---
        let custTime = currentOrder.timeSlot || "ASAP";
        let defaultMins = 0;
        let acceptLabel = `✅ ACCEPT (${custTime})`;

        // MAGIC: Change "ASAP" to default to 60/30 minutes automatically!
        if (custTime === "ASAP") {
            defaultMins = currentOrder.orderType === 'delivery' ? 60 : 30;
            acceptLabel = `✅ ACCEPT (${defaultMins} Min Standard)`;
        }

        actionButtonsContainer.innerHTML = `
            <div style="display:flex; gap:15px; width:100%;">
                <button onclick="rejectOrder()" style="flex:1; font-size:1.8rem; padding:20px; font-weight:bold; background-color:#ff4444; color:white; border:none; border-radius:10px; cursor:pointer;">
                    ❌ REJECT
                </button>
                <button onclick="acceptOrderWithTime(${defaultMins})" style="flex:2; font-size:1.8rem; padding:20px; font-weight:bold; background-color:#D4AF37; color:black; border:none; border-radius:10px; cursor:pointer;">
                    ${acceptLabel}
                </button>
            </div>
            
            <div style="display:flex; gap:10px; margin-top:15px; width:100%;">
                <button onclick="acceptOrderWithTime(30)" style="flex:1; font-size:1.6rem; padding:20px; font-weight:bold; background-color:#333; color:white; border:2px solid #555; border-radius:10px; cursor:pointer;">30 Min</button>
                <button onclick="acceptOrderWithTime(45)" style="flex:1; font-size:1.6rem; padding:20px; font-weight:bold; background-color:#333; color:white; border:2px solid #555; border-radius:10px; cursor:pointer;">45 Min</button>
                <button onclick="acceptOrderWithTime(60)" style="flex:1; font-size:1.6rem; padding:20px; font-weight:bold; background-color:#333; color:white; border:2px solid #555; border-radius:10px; cursor:pointer;">60 Min</button>
                <button onclick="acceptOrderWithTime(90)" style="flex:1; font-size:1.6rem; padding:20px; font-weight:bold; background-color:#333; color:white; border:2px solid #555; border-radius:10px; cursor:pointer;">90 Min</button>
            </div>

            <div style="display:flex; gap:10px; margin-top:10px; width:100%;">
                <input type="number" id="custom-minutes-input" placeholder="Min" min="1" style="flex:1; font-size:1.6rem; padding:15px; text-align:center; background:#222; color:white; border:2px solid #555; border-radius:10px; outline:none;">
                <button onclick="acceptCustomTime()" style="flex:3; font-size:1.6rem; padding:20px; font-weight:bold; background-color:#555; color:white; border:none; border-radius:10px; cursor:pointer;">
                    ⏳ SET CUSTOM TIME
                </button>
            </div>
        `;
    }

    newOrderPopup.classList.remove('hidden');
}

window.acceptCustomTime = function() {
    const inputVal = document.getElementById('custom-minutes-input').value;
    const addedMinutes = parseInt(inputVal, 10);
    
    if (isNaN(addedMinutes) || addedMinutes <= 0) {
        alert("Please enter a valid number of minutes.");
        return;
    }
    acceptOrderWithTime(addedMinutes);
};

window.acceptOrderWithTime = function(addedMinutes) {
    if (newOrderQueue.length === 0) return;
    const orderToAccept = newOrderQueue.shift(); 

    let finalEstimatedTime = orderToAccept.timeSlot || "ASAP";
    
    if (addedMinutes > 0) {
        const d = new Date();
        d.setMinutes(d.getMinutes() + addedMinutes);
        finalEstimatedTime = d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    }

    db.collection("orders").doc(orderToAccept.id).update({ 
        status: "seen",
        estimatedTime: finalEstimatedTime
    });
    
    processNewOrderQueue();
};

window.rejectOrder = function() {
    if (newOrderQueue.length === 0) return;
    if(!confirm("⚠️ REJECT ORDER?\n\nThis will mark the order as CANCELLED and notify the customer.\n\nAre you sure?")) return;

    const orderToReject = newOrderQueue.shift(); 
    
    db.collection("orders").doc(orderToReject.id).update({ status: "cancelled" });
    
    alertAudio.loop = false;
    alertAudio.pause();
    alertAudio.currentTime = 0;
    processNewOrderQueue();
};


// --- RENDER DINE-IN ---
function renderDineInTable(tableId) {
    const tableBox = document.getElementById(`table-${tableId}`);
    if (!tableBox) return;
    const orderList = tableBox.querySelector('.order-list');
    const emptyMsg = tableBox.querySelector('.order-list-empty');
    const clearBtn = tableBox.querySelector('.clear-table-btn'); 

    const ordersForThisTable = Object.values(allOrders).filter(o => o.table == tableId && o.orderType !== 'pickup' && o.orderType !== 'delivery');
    orderList.innerHTML = ""; 

    if (ordersForThisTable.length === 0) {
        orderList.style.display = 'none';
        emptyMsg.style.display = 'block';
        clearBtn.disabled = true; 
        clearBtn.style.backgroundColor = "#555"; 
    } else {
        orderList.style.display = 'block';
        emptyMsg.style.display = 'none';
        clearBtn.disabled = false;
        clearBtn.style.backgroundColor = "#8B0000"; 

        ordersForThisTable.sort((a, b) => a.createdAt.seconds - b.createdAt.seconds);

        ordersForThisTable.forEach(order => {
            const time = order.createdAt.toDate().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
            
            let itemsHtml = order.items.map(item => 
                `<li>${item.quantity}x ${item.name} <strong style="color:var(--gold);">${getDishNumber(item.name)}</strong></li>`
            ).join('');
            
            const isCooked = order.status === 'cooked' || order.status === 'ready';
            const dimStyle = isCooked ? 'opacity:0.5;' : '';
            const badge = isCooked ? '<span style="float:right;">✅</span>' : '';

            orderList.innerHTML += `
                <div class="order-group" style="${dimStyle} border-top:1px solid #444; padding-top:10px;">
                    <h4>Order @ ${time} ${badge}</h4>
                    <ul>${itemsHtml}</ul>
                    ${order.notes ? `<p class="order-notes">⚠️ ${order.notes}</p>` : ''}
                    <button class="btn-serve" onclick="handleServe('${order.id}')">${isCooked ? 'Undo' : 'Mark Ready'}</button>
                </div>
            `;
        });
    }
}

// --- RENDER ONLINE ---
function renderOnlineGrid() {
    pickupGrid.innerHTML = '';
    const onlineOrders = Object.values(allOrders).filter(o => o.orderType === 'pickup' || o.orderType === 'delivery');
    onlineOrders.sort((a, b) => a.createdAt.seconds - b.createdAt.seconds);

    if (onlineOrders.length === 0) {
        pickupGrid.innerHTML = `<div class="pickup-box-empty"><p>Waiting for online orders...</p></div>`;
        return;
    }

    onlineOrders.forEach(order => {
        const time = order.createdAt.toDate().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
        const isReady = order.status === 'ready' || order.status === 'cooked';
        
        let typeBadge = order.orderType === 'delivery' ? "🚚 DELIVERY" : "🛍️ PICKUP";
        let typeColor = order.orderType === 'delivery' ? "#e67e22" : "#3498db"; 

        let itemsHtml = order.items.map(item => 
            `<li>${item.quantity}x ${item.name} <strong style="color:var(--gold);">${getDishNumber(item.name)}</strong></li>`
        ).join('');

        // NEW: Translate ASAP to "SOFORT" for the Kitchen Grid
        let displayTimeSlot = order.timeSlot === "ASAP" ? "SOFORT" : order.timeSlot;
        let targetHtml = `<div style="font-weight:bold; color:#D4AF37;">Target: ${displayTimeSlot}</div>`;      
        if (order.estimatedTime && order.estimatedTime !== order.timeSlot) {
            targetHtml = `<div style="font-weight:bold; color:#4CAF50;">Target: ${order.estimatedTime} <span style="font-size:0.8rem; color:#888;">(Requested: ${displayTimeSlot})</span></div>`;
        }

        // NEW: Grab the address for the small card!
        let addressHtml = "";
        if (order.orderType === 'delivery' && order.deliveryAddress) {
            addressHtml = `<div style="font-size:0.85rem; color:#ccc; margin-bottom:8px; padding:5px; background:rgba(255,255,255,0.1); border-radius:4px;"><strong>📍</strong> ${order.deliveryAddress.street} ${order.deliveryAddress.house}, ${order.deliveryAddress.zip}</div>`;
        }

        pickupGrid.innerHTML += `
            <div class="pickup-box" style="border-top: 3px solid ${typeColor}; ${isReady ? 'opacity:0.6;' : ''}">
                <div class="table-header">
                    <h2>${order.customerName}</h2> 
                    <span class="order-time">@ ${time}</span>
                </div>
                <div style="margin-bottom:8px;"><span style="background:${typeColor}; padding:2px 6px; border-radius:4px;">${typeBadge}</span></div>
                ${addressHtml}
                ${targetHtml}
                <ul>${itemsHtml}</ul>
                ${order.notes ? `<div style="color:#ff8888;">📝 "${order.notes}"</div>` : ''}
                <button class="clear-pickup-btn" onclick="handleServe('${order.id}')">${isReady ? 'Undo' : 'Mark Ready'}</button>
            </div>`;
    });
}

// --- ACTIONS ---
window.handleServe = function(orderId) {
    const order = allOrders[orderId];
    // Toggle status
    const newStatus = (order.status === 'ready' || order.status === 'cooked') ? 'seen' : 'ready';
    db.collection("orders").doc(orderId).update({ status: newStatus });
}

window.handleClearOrder = function(tableId) {
    if(!confirm(`Clear all orders for Table ${tableId}?`)) return;
    
    const tableOrders = Object.values(allOrders).filter(o => o.table == tableId && o.orderType !== 'pickup' && o.orderType !== 'delivery');
    const batch = db.batch();
    
    tableOrders.forEach(order => {
        // Archive
        const archiveRef = db.collection("archived_orders").doc(`archive-${order.id}`);
        batch.set(archiveRef, { ...order, closedAt: firebase.firestore.FieldValue.serverTimestamp() });
        // Delete
        const docRef = db.collection("orders").doc(order.id);
        batch.delete(docRef);
    });
    batch.commit();
}

// --- MASTER CLEAR FUNCTION ---
async function handleMasterClear() {
    if(!confirm("⚠️ WARNING: This will DELETE ALL active orders from the screen.\n\nUse this to 'Reset the Day' or clear stuck orders.\n\nAre you sure?")) {
        return;
    }

    const pwd = prompt("Please enter Kitchen Password to confirm deletion:");
    if (pwd !== KITCHEN_PASSWORD) {
        alert("Wrong password. Action cancelled.");
        return;
    }

    try {
        const snapshot = await db.collection("orders").get();
        if (snapshot.empty) {
            alert("Board is already empty.");
            return;
        }

        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        alert("✅ Board Cleared! Ready for new day.");
        location.reload(); 

    } catch (error) {
        console.error("Error clearing board:", error);
        alert("Error clearing board. Check console.");
    }
}

function showWaiterCall(tableNum, docId) {
    currentWaiterCallId = docId;
    waiterCallTableText.innerText = `TABLE ${tableNum}`;
    waiterCallOverlay.classList.remove('hidden');
    alertAudio.loop = true;
    alertAudio.play().catch(e => console.log(e));
}

dismissWaiterBtn.addEventListener('click', () => {
    alertAudio.loop = false;
    alertAudio.pause();
    alertAudio.currentTime = 0;
    if(currentWaiterCallId) {
        db.collection("orders").doc(currentWaiterCallId).delete();
        waiterCallOverlay.classList.add('hidden');
    }
});
