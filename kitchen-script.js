// --- 1. CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyAVh2kVIuFcrt8Dg88emuEd9CQlqjJxDrA",
  authDomain: "zaffran-delight.firebaseapp.com",
  projectId: "zaffran-delight",
  storageBucket: "zaffran-delight.firebasestorage.app",
  messagingSenderId: "1022960860126",
  appId: "1:1022960860126:web:1e06693dea1d0247a0bb4f"
};

// --- MASTER MENU LIST (For Numbering) ---
// This determines the number (Index 0 = #1, Index 1 = #2...)
const MENU_ITEMS = [
    { name: "Tomatensuppe", price: 5.00 },        // 1
    { name: "Daal Linsensuppe", price: 5.00 },    // 2
    { name: "Hähnchen Suppe", price: 6.00 },      // 3
    { name: "Mulligatawny Suppe", price: 6.50 },
    { name: "Veg. Samosa", price: 5.00 },
    { name: "Chicken Samosa", price: 5.50 },
    { name: "Aloo Tiki", price: 5.00 },
    { name: "Mix Pakora", price: 5.50 },
    { name: "Paneer Pakora", price: 6.00 },
    { name: "Aloo Pakora", price: 5.50 },        // 10
    { name: "Gobi Pakora", price: 5.50 },
    { name: "Mashroom Pakora", price: 5.50 },
    { name: "Chicken Pakora", price: 6.00 },
    { name: "Prawn Pakora", price: 7.50 },
    { name: "Vegi Mix", price: 13.00 },
    { name: "Palak Aallu", price: 13.00 },
    { name: "Saag Aallu", price: 13.00 },
    { name: "Tarka Daal", price: 12.50 },
    { name: "Bhindi Masala", price: 13.00 },
    { name: "Baingen Aallu", price: 13.00 },     // 20
    { name: "Mushroom Aallu", price: 13.00 },
    { name: "Gobi Aallu", price: 13.00 },
    { name: "Channa Masala", price: 12.50 },
    { name: "Veg. Korma", price: 13.50 },
    { name: "Nauratan Korma", price: 14.00 },
    { name: "Shahi Paneer", price: 14.00 },
    { name: "Paneer Tikka Masala", price: 14.50 },
    { name: "Paneer Jalfrezi", price: 14.00 },
    { name: "Paneer Bhunna Masala", price: 14.00 },
    { name: "Palak Paneer", price: 14.00 },      // 30
    { name: "Paneer Muttar Aallu", price: 14.50 },
    { name: "Chicken Curry", price: 14.50 },
    { name: "Chicken Tikka Masala", price: 15.50 },
    { name: "Chicken Korma", price: 15.00 },
    { name: "Butter Chicken", price: 15.50 },
    { name: "Kashmiri Chicken", price: 15.50 },
    { name: "Chicken Goan Curry", price: 15.50 },
    { name: "Chicken Jalfrezi", price: 15.50 },
    { name: "Chicken Kadai", price: 15.50 },
    { name: "Chicken Bhuna", price: 15.50 },     // 40
    { name: "Vegi Chicken", price: 15.00 },
    { name: "Chicken Palak", price: 15.50 },
    { name: "Chicken Dhansik", price: 15.50 },
    { name: "Chicken Madras", price: 15.50 },
    { name: "Chicken Vindalo", price: 15.50 },
    { name: "Lamb Curry", price: 17.00 },
    { name: "Lamb Tikka Masala", price: 17.50 },
    { name: "Lamb Korma", price: 17.00 },
    { name: "Butter Lamb", price: 17.50 },
    { name: "Kashmiri Lamb", price: 17.50 },     // 50
    { name: "Lamb Goan Curry", price: 17.50 },
    { name: "Lamb Jalfrezi", price: 17.50 },
    { name: "Lamb Kadai", price: 17.50 },
    { name: "Lamb Bhuna", price: 17.50 },
    { name: "Vegi Lamb", price: 17.00 },
    { name: "Lamb Palak", price: 17.50 },
    { name: "Lamb Dhansik", price: 17.50 },
    { name: "Lamb Madras", price: 17.50 },
    { name: "Lamb Vindalo", price: 17.50 },
    { name: "Prawn Curry", price: 18.50 },       // 60
    { name: "Prawn Korma", price: 18.50 },
    { name: "Prawn Tikka Masala", price: 18.50 },
    { name: "Fish Curry", price: 18.50 },
    { name: "Fish Tikka Masala", price: 18.50 },
    { name: "Chicken Tikka", price: 17.50 },
    { name: "Tandoori Chicken", price: 17.50 },
    { name: "Malai Tikka", price: 17.50 },
    { name: "Haryali Tikka", price: 17.50 },
    { name: "Lamb Tikka", price: 18.50 },
    { name: "Lamb Chops", price: 20.50 },        // 70
    { name: "Seekh Kabab", price: 19.50 },
    { name: "Prawn Tikka", price: 20.50 },
    { name: "Paneer Tikka", price: 17.50 },
    { name: "Fish Tawa Fry", price: 20.50 },
    { name: "Zafrani Mix Grill", price: 24.00 },
    { name: "Vegi Biryani", price: 14.50 },
    { name: "Chicken Bombay Biryani", price: 16.50 },
    { name: "Lamb Karachi Biryani", price: 17.50 },
    { name: "Prawn Zafran Biryani", price: 20.50 },
    { name: "Frisches Tandoori Brot", price: 3.50 }, // 80
    { name: "Chapati Roti", price: 3.50 },
    { name: "Naan", price: 3.00 },
    { name: "Allo Naan", price: 4.50 },
    { name: "Cheese Naan", price: 5.00 },
    { name: "Butter Naan", price: 3.50 },
    { name: "Garlic Naan", price: 4.50 },
    { name: "Tandoori Parantha", price: 4.50 },
    { name: "Mint Sauce", price: 3.00 },
    { name: "Natur Joghurt", price: 2.50 },
    { name: "Raita", price: 4.00 },              // 90
    { name: "Mango Chutney", price: 3.00 },
    { name: "Imli (Tamarind) Chutney", price: 3.00 },
    { name: "Laal Chutney (scharfe...)", price: 3.50 },
    { name: "Green Chutney", price: 3.50 },
    { name: "Pickles", price: 3.50 },
    { name: "Soße nach Wahl", price: 5.00 },
    { name: "Gemüse-Frühlingsrollen", price: 5.00 },
    { name: "Pommes frites", price: 3.50 },
    { name: "Chicken Nuggets (6 Stk.)", price: 4.50 },
    { name: "Basmati - Reis", price: 3.50 },     // 100
    { name: "Zeera - Reis", price: 4.00 },
    { name: "Zafrani - Reis", price: 5.50 },
    { name: "Gemischter Salat", price: 6.00 },
    { name: "Chicken Salat", price: 7.50 },
    { name: "Zafrani Chicken Salat", price: 8.50 },
    { name: "Mango Kulfi", price: 5.50 },
    { name: "Almond Kulfi", price: 5.50 },
    { name: "Pista Kulfi", price: 5.50 },
    { name: "Gulab Jamun", price: 5.50 },
    { name: "Ras Malai", price: 5.50 },          // 110
    { name: "Lassi", price: 4.00 },
    { name: "Mango Lassi", price: 4.50 },
    { name: "Rosé Lassi", price: 4.50 },
    { name: "Coca Cola", price: 3.50 },
    { name: "Cola Zero", price: 3.50 },
    { name: "Sprite", price: 3.50 },
    { name: "Fanta", price: 3.50 },
    { name: "Pinacolada", price: 5.50 },
    { name: "Mint-Margarita", price: 5.50 },     // 119
    { name: "Ipanema", price: 5.50 }             // 120
];

// --- HELPER TO GET NUMBER ---
function getDishNumber(name) {
    const index = MENU_ITEMS.findIndex(item => item.name === name);
    return index !== -1 ? ` - ${index + 1}` : ""; // Returns " - 45"
}

// --- 2. INIT FIREBASE ---
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// --- 3. DOM ELEMENTS ---
const connectionIconEl = document.getElementById('connection-icon');
const loginOverlay = document.getElementById('kitchen-login-overlay');
const loginButton = document.getElementById('login-button');
const passwordInput = document.getElementById('kitchen-password');
const loginError = document.getElementById('login-error');
const kdsContentWrapper = document.getElementById('kds-content-wrapper');
const dineInGrid = document.getElementById('dine-in-grid');
const pickupGrid = document.getElementById('pickup-grid');

// Popups
const newOrderPopup = document.getElementById('new-order-popup-overlay');
const popupOrderDetails = document.getElementById('popup-order-details');
const acceptOrderBtn = document.getElementById('accept-order-btn');

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

// --- 4. LOGIN LOGIC ---
document.addEventListener("DOMContentLoaded", () => {
    loginButton.addEventListener('click', () => {
        if (passwordInput.value === KITCHEN_PASSWORD) {
            loginOverlay.classList.add('hidden');
            kdsContentWrapper.style.opacity = '1';
            
            // Unlock Audio
            alertAudio.play().then(() => {
                alertAudio.pause();
                alertAudio.currentTime = 0;
            }).catch(e => console.log(e));

            initializeKDS(); 
        } else {
            loginError.style.display = 'block';
        }
    });
    passwordInput.addEventListener('keyup', (e) => e.key === 'Enter' && loginButton.click());
});

// --- 5. INITIALIZE KDS ---
function initializeKDS() {
    createDineInTables();

    // Listen for Clear Buttons
    dineInGrid.querySelectorAll('.clear-table-btn').forEach(btn => {
        btn.addEventListener('click', () => handleClearOrder(btn.dataset.tableId, 'dine-in', btn));
    });

    // START LISTENER
    db.collection("orders")
      .where("status", "in", ["new", "seen", "ready", "cooked"]) 
      .onSnapshot((snapshot) => {
            connectionIconEl.textContent = '✅'; 
            let hasNewOrder = false;
            let newestOrderData = null;
            let changedTables = new Set();

            snapshot.docChanges().forEach((change) => {
                const orderData = change.doc.data();
                const isOnline = orderData.orderType === 'pickup' || orderData.orderType === 'delivery';

                // Waiter Call
                if (orderData.orderType === 'assistance') {
                    if (change.type === "added") showWaiterCall(orderData.table, change.doc.id);
                    if (change.type === "removed" && currentWaiterCallId === change.doc.id) waiterCallOverlay.classList.add('hidden');
                    return;
                }

                // New Order Alert
                if (change.type === "added" && orderData.status === "new") {
                    hasNewOrder = true;
                    newestOrderData = orderData;
                    // Mark as 'seen' locally to stop repeating
                    db.collection("orders").doc(orderData.id).update({ status: "seen" }); 
                }

                // Tracking
                if(!isOnline) changedTables.add(orderData.table);
                if (change.type === "added" || change.type === "modified") {
                    allOrders[orderData.id] = orderData;
                }
                if (change.type === "removed") {
                    delete allOrders[orderData.id];
                    if(!isOnline) changedTables.add(orderData.table);
                }
            });

            // Refresh UI
            renderOnlineGrid();
            changedTables.forEach(tableIdentifier => {
                if (!isNaN(parseInt(tableIdentifier))) renderDineInTable(tableIdentifier);
            });

            // Trigger Popup
            if (hasNewOrder && newestOrderData) {
                showNewOrderPopup(newestOrderData);
            }
      }, (error) => {
          console.error("Firebase Error:", error);
          connectionIconEl.textContent = '❌'; 
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

// --- POPUP LOGIC ---
function showNewOrderPopup(order) {
    let title = "";
    if (order.orderType === 'pickup') title = `🛍️ Pickup: ${order.customerName}`;
    else if (order.orderType === 'delivery') title = `🚚 Delivery: ${order.customerName}`;
    else title = `🍽️ Table ${order.table}`;

    // Item List with Numbers
    let itemsHtml = order.items.map(item => 
        `<li>${item.quantity}x ${item.name} <strong style="color:var(--gold);">${getDishNumber(item.name)}</strong></li>`
    ).join('');

    popupOrderDetails.innerHTML = `
        <h2>${title}</h2>
        <ul>${itemsHtml}</ul>
        ${order.notes ? `<p style="color:#ff8888;">⚠️ ${order.notes}</p>` : ''}
    `;
    
    newOrderPopup.classList.remove('hidden');
    alertAudio.play().catch(e => console.log(e));

    acceptOrderBtn.onclick = () => {
        newOrderPopup.classList.add('hidden');
        alertAudio.pause();
        alertAudio.currentTime = 0;
    };
}

// --- RENDER DINE-IN ---
function renderDineInTable(tableId) {
    const tableBox = document.getElementById(`table-${tableId}`);
    if (!tableBox) return;
    const orderList = tableBox.querySelector('.order-list');
    const emptyMsg = tableBox.querySelector('.order-list-empty');
    const clearBtn = tableBox.querySelector('.clear-table-btn'); 

    const ordersForThisTable = Object.values(allOrders).filter(o => o.table === tableId && o.orderType !== 'pickup' && o.orderType !== 'delivery');
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
            
            // If cooked/ready, dim it
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

        pickupGrid.innerHTML += `
            <div class="pickup-box" style="border-top: 3px solid ${typeColor}; ${isReady ? 'opacity:0.6;' : ''}">
                <div class="table-header">
                    <h2>${order.customerName}</h2> 
                    <span class="order-time">@ ${time}</span>
                </div>
                <div style="margin-bottom:8px;"><span style="background:${typeColor}; padding:2px 6px; border-radius:4px;">${typeBadge}</span></div>
                <div style="font-weight:bold; color:#D4AF37;">Target: ${order.timeSlot}</div>
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
    
    const tableOrders = Object.values(allOrders).filter(o => o.table === tableId && o.orderType !== 'pickup' && o.orderType !== 'delivery');
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

function showWaiterCall(tableNum, docId) {
    currentWaiterCallId = docId;
    waiterCallTableText.innerText = `TABLE ${tableNum}`;
    waiterCallOverlay.classList.remove('hidden');
    alertAudio.play().catch(e => console.log(e));
}

dismissWaiterBtn.addEventListener('click', () => {
    if(currentWaiterCallId) {
        db.collection("orders").doc(currentWaiterCallId).delete();
        waiterCallOverlay.classList.add('hidden');
    }
});
