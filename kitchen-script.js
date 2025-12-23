// --- 1. ZAFFRAN FIREBASE CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyAVh2kVIuFcrt8Dg88emuEd9CQlqjJxDrA",
  authDomain: "zaffran-delight.firebaseapp.com",
  projectId: "zaffran-delight",
  storageBucket: "zaffran-delight.firebasestorage.app",
  messagingSenderId: "1022960860126",
  appId: "1:1022960860126:web:1e06693dea1d0247a0bb4f"
};
// --- END OF FIREBASE CONFIG ---

// --- 2. Initialize Firebase ---
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// --- 3. Global State and DOM Elements ---
document.addEventListener("DOMContentLoaded", () => {

    const connectionIconEl = document.getElementById('connection-icon'); 
    const newOrderPopup = document.getElementById('new-order-popup-overlay');
    const popupOrderDetails = document.getElementById('popup-order-details');
    const acceptOrderBtn = document.getElementById('accept-order-btn');

    // Waiter Call Elements
    const waiterCallOverlay = document.getElementById('waiter-call-overlay');
    const waiterCallTableText = document.getElementById('waiter-call-table');
    const dismissWaiterBtn = document.getElementById('dismiss-waiter-btn');
    let currentWaiterCallId = null;

    // KDS Login
    const loginOverlay = document.getElementById('kitchen-login-overlay');
    const loginButton = document.getElementById('login-button');
    const passwordInput = document.getElementById('kitchen-password');
    const loginError = document.getElementById('login-error');
    const kdsContentWrapper = document.getElementById('kds-content-wrapper');

    // KDS Grid Elements
    const dineInGrid = document.getElementById('dine-in-grid');
    const pickupGrid = document.getElementById('pickup-grid');

    let orderQueue = []; // For stacking popups
    let currentPopupOrder = null; // The order currently in the popup
    let allOrders = {}; // Holds all active orders, keyed by order.id
    let notificationAudio = new Audio('notification.mp3'); 
    let alertAudio = document.getElementById('alertSound'); 

    const KITCHEN_PASSWORD = "zafran"; 
    const TOTAL_DINE_IN_TABLES = 12; 

    // --- 4. KDS Login Logic ---
    loginButton.addEventListener('click', () => {
        if (passwordInput.value === KITCHEN_PASSWORD) {
            loginOverlay.classList.add('hidden');
            kdsContentWrapper.style.opacity = '1';
            initializeKDS(); 
        } else {
            loginError.style.display = 'block';
        }
    });
    passwordInput.addEventListener('keyup', (e) => e.key === 'Enter' && loginButton.click());


    // --- 5. Main KDS Functions ---

    /**
     * Creates the 12 empty dine-in tables on page load.
     */
    function createDineInTables() {
        dineInGrid.innerHTML = ''; // Clear grid
        for (let i = 1; i <= TOTAL_DINE_IN_TABLES; i++) {
            const tableBox = document.createElement('div');
            tableBox.className = 'table-box';
            tableBox.id = `table-${i}`; 
            tableBox.innerHTML = `
                <div class="table-header">
                    <h2>Table ${i}</h2>
                </div>
                <ul class="order-list" data-table-id="${i}">
                </ul>
                <p class="order-list-empty" data-table-id="${i}">Waiting for order...</p>
            `;
            dineInGrid.appendChild(tableBox);
        }
    }

    /**
     * Initializes the main Firestore listener.
     */
    function initializeKDS() {
        createDineInTables();

        db.collection("orders")
          .where("status", "in", ["new", "seen", "ready"]) 
          .onSnapshot(
            (snapshot) => {
                connectionIconEl.textContent = '✅'; 
                
                let changedTables = new Set(); 
                
                snapshot.docChanges().forEach((change) => {
                    const orderData = change.doc.data();
                    
                    // --- NEW: Identify Order Type ---
                    const isOnline = orderData.orderType === 'pickup' || orderData.orderType === 'delivery';

                    // --- INTERCEPT WAITER CALLS ---
                    if (orderData.orderType === 'assistance') {
                        if (change.type === "added") {
                            showWaiterCall(orderData.table, change.doc.id);
                        }
                        return; // Stop processing
                    }
                    
                    // Track table changes (only for Dine-In)
                    if (!isOnline) {
                        changedTables.add(orderData.table); 
                    }
                    
                    if (change.type === "added") {
                        allOrders[orderData.id] = orderData;
                        
                        // Add to Popup Queue only if new
                        if (orderData.status === 'new') {
                            orderQueue.push(orderData);
                            if (orderQueue.length === 1 && newOrderPopup.classList.contains('hidden')) {
                                showNextOrderInQueue();
                            }
                        }
                    }
                    
                    if (change.type === "removed") {
                        if (allOrders[orderData.id]) {
                            delete allOrders[orderData.id];
                        }
                        // If it was a table, re-render
                        if(!isOnline) changedTables.add(orderData.table);
                    }
                    
                    if (change.type === "modified") {
                        allOrders[orderData.id] = orderData;
                    }
                });
                
                // --- NEW: Render Combined Online Grid ---
                renderOnlineGrid(); 

                changedTables.forEach(tableIdentifier => {
                    if (!isNaN(parseInt(tableIdentifier))) { 
                        renderDineInTable(tableIdentifier);
                    }
                });

            },
            (error) => {
                console.error("Error connecting to Firestore: ", error);
                connectionIconEl.textContent = '❌'; 
            }
        );
    } 

    // --- WAITER CALL FUNCTIONS ---
    function showWaiterCall(tableNum, docId) {
        currentWaiterCallId = docId;
        waiterCallTableText.innerText = `TABLE ${tableNum}`;
        waiterCallOverlay.classList.remove('hidden');
        if(alertAudio) alertAudio.play().catch(e => console.log("Audio block", e));
    }

    if(dismissWaiterBtn) {
        dismissWaiterBtn.addEventListener('click', () => {
            if(currentWaiterCallId) {
                // DELETE to remove from everywhere
                db.collection("orders").doc(currentWaiterCallId).delete()
                .then(() => {
                    waiterCallOverlay.classList.add('hidden');
                    currentWaiterCallId = null;
                })
                .catch(err => console.error("Error deleting call:", err));
            } else {
                waiterCallOverlay.classList.add('hidden');
            }
        });
    }


    /**
     * Re-renders a single Dine-In table box
     */
    function renderDineInTable(tableId) {
        const tableBox = document.getElementById(`table-${tableId}`);
        if (!tableBox) return; 
        
        const orderList = tableBox.querySelector('.order-list');
        const emptyMsg = tableBox.querySelector('.order-list-empty');

        const ordersForThisTable = Object.values(allOrders).filter(o => o.table === tableId && o.orderType !== 'pickup' && o.orderType !== 'delivery');
        
        orderList.innerHTML = ""; 
        
        if (ordersForThisTable.length === 0) {
            orderList.style.display = 'none';
            emptyMsg.style.display = 'block';
        } else {
            orderList.style.display = 'block';
            emptyMsg.style.display = 'none';
            
            ordersForThisTable.sort((a, b) => a.createdAt.seconds - b.createdAt.seconds);
            
            ordersForThisTable.forEach(order => {
                const orderTimestamp = order.createdAt.toDate().toLocaleTimeString('de-DE', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                let itemsHtml = order.items.map(item => `<li>${item.quantity}x ${item.name}</li>`).join('');
                
                let notesHtml = '';
                if (order.notes && order.notes.trim() !== '') {
                    notesHtml = `<p class="order-notes">⚠️ Notes: ${order.notes}</p>`;
                }

                const isReady = order.status === 'ready';
                let actionBtnHtml = '';
                let readyClass = '';

                if (isReady) {
                    readyClass = 'kitchen-ready-highlight'; 
                    actionBtnHtml = `<div class="kitchen-status-badge">✅ Waiting for Waiter</div>`;
                } else {
                    actionBtnHtml = `<button class="btn-mark-ready" onclick="handleMarkReady('${order.id}')">Mark Ready</button>`;
                }

                const orderGroupHtml = `
                    <div class="order-group ${readyClass}" id="${order.id}">
                        <h4>Order @ ${orderTimestamp}</h4>
                        <ul>
                            ${itemsHtml}
                        </ul>
                        ${notesHtml} 
                        ${actionBtnHtml}
                    </div>
                `;
                orderList.innerHTML += orderGroupHtml;
            });

            if (ordersForThisTable.some(o => o.status === 'new')) {
                tableBox.classList.add('new-order-flash');
                setTimeout(() => tableBox.classList.remove('new-order-flash'), 1500);
            }
        }
    }

    /**
     * Re-renders the Combined Online Order Grid (Pickup & Delivery)
     */
    function renderOnlineGrid() {
        const grid = document.getElementById('pickup-grid'); 
        if (!grid) return;

        grid.innerHTML = ''; 
        
        // Filter for BOTH types
        const onlineOrders = Object.values(allOrders).filter(o => 
            o.orderType === 'pickup' || o.orderType === 'delivery'
        );
        onlineOrders.sort((a, b) => a.createdAt.seconds - b.createdAt.seconds);

        if (onlineOrders.length === 0) {
            grid.innerHTML = `<div class="pickup-box-empty"><p>Waiting for online orders...</p></div>`;
            return;
        }

        onlineOrders.forEach(order => {
            const orderTimestamp = order.createdAt.toDate().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
            
            // 1. DETERMINE TYPE
            let typeBadge = "";
            let typeColor = "";
            let addressHtml = "";

            if (order.orderType === 'delivery') {
                typeBadge = "🚚 DELIVERY";
                typeColor = "#e67e22"; // Orange
                if (order.deliveryAddress) {
                    addressHtml = `
                        <div style="font-size:0.85rem; color:#ccc; margin-bottom:8px; padding:5px; background:rgba(255,255,255,0.1); border-radius:4px;">
                            <strong>📍</strong> ${order.deliveryAddress.street} ${order.deliveryAddress.house}, ${order.deliveryAddress.zip}
                        </div>`;
                }
            } else {
                typeBadge = "🛍️ PICKUP";
                typeColor = "#3498db"; // Blue
            }

            let itemsHtml = order.items.map(item => `<li>${item.quantity}x ${item.name}</li>`).join('');

            let notesHtml = '';
            if (order.notes && order.notes.trim() !== '') {
                notesHtml = `<p class="order-notes">⚠️ Notes: ${order.notes}</p>`;
            }

            const isReady = order.status === 'ready';
            let actionBtnHtml = '';
            let readyClass = isReady ? 'kitchen-ready-highlight' : '';
            let statusBadge = `<span style="background:${typeColor}; color:white; padding:2px 6px; border-radius:4px; font-size:0.75rem;">${typeBadge}</span>`;

            if (isReady) {
                actionBtnHtml = `<div class="kitchen-status-badge">✅ Ready for Pickup</div>`;
            } else {
                actionBtnHtml = `<button class="clear-pickup-btn" onclick="handleMarkReady('${order.id}')">Mark Ready</button>`;
            }

            // Render Card
            const pickupBox = document.createElement('div');
            pickupBox.className = `pickup-box ${readyClass}`;
            pickupBox.style.borderTop = `3px solid ${typeColor}`; // Top border color match
            pickupBox.id = `pickup-${order.id}`;
            
            pickupBox.innerHTML = `
                <div class="table-header">
                    <h2>${order.customerName}</h2> <span class="order-time">@ ${orderTimestamp}</span>
                </div>
                
                <div style="margin-bottom:8px;">${statusBadge}</div>
                
                <div style="font-size:0.85rem; color:#aaa; margin-bottom:5px;">
                     📞 ${order.customerPhone}
                </div>

                ${addressHtml}

                <div style="font-weight:bold; color:#D4AF37; margin-bottom:5px;">Target: ${order.timeSlot} Uhr</div>

                <ul class="order-list">
                    ${itemsHtml}
                </ul>
                ${notesHtml} 
                ${actionBtnHtml}
            `;
            grid.appendChild(pickupBox);
        });
    }


    window.handleMarkReady = async function(orderId) {
        const btn = document.querySelector(`button[onclick="handleMarkReady('${orderId}')"]`);
        if(btn) {
            btn.disabled = true;
            btn.textContent = "...";
        }

        try {
            await db.collection("orders").doc(orderId).update({ status: "ready" });
            console.log(`Order ${orderId} marked ready.`);
        } catch (e) {
            console.error("Error updating order:", e);
            if(btn) {
                btn.disabled = false;
                btn.textContent = "Error";
            }
        }
    }

    // --- 6. Popup Queue Functions ---

    function showNextOrderInQueue() {
        if (orderQueue.length === 0) {
            currentPopupOrder = null;
            return; 
        }
        
        currentPopupOrder = orderQueue.shift(); 
        
        let itemsHtml = currentPopupOrder.items.map(item => `<li>${item.quantity}x ${item.name}</li>`).join('');
        
        let title = '';
        
        // --- NEW: Smart Title for Popup ---
        if (currentPopupOrder.orderType === 'pickup') {
            title = `🛍️ New Pickup: ${currentPopupOrder.customerName}`; 
        } else if (currentPopupOrder.orderType === 'delivery') {
            title = `🚚 New Delivery: ${currentPopupOrder.customerName}`; 
        } else {
            title = `🔔 Table ${currentPopupOrder.table}`;
        }

        let notesHtml = '';
        if (currentPopupOrder.notes && currentPopupOrder.notes.trim() !== '') {
            notesHtml = `<p class="popup-notes">⚠️ Notes: ${currentPopupOrder.notes}</p>`;
        }

        let addressHtml = "";
        if (currentPopupOrder.orderType === 'delivery' && currentPopupOrder.deliveryAddress) {
            addressHtml = `<p style="font-size:0.9rem; color:#ccc;">📍 ${currentPopupOrder.deliveryAddress.street}, ${currentPopupOrder.deliveryAddress.zip}</p>`;
        }

        popupOrderDetails.innerHTML = `
            <h4>${title}</h4>
            ${addressHtml}
            <ul>${itemsHtml}</ul>
            ${notesHtml} 
        `;
        
        newOrderPopup.classList.remove('hidden');
        notificationAudio.play().catch(e => console.warn("Could not play audio:", e));
    }

    function hideNewOrderPopup() {
        newOrderPopup.classList.add('hidden');
        currentPopupOrder = null;
    }

    acceptOrderBtn.addEventListener('click', () => {
        const acceptedOrder = currentPopupOrder; 
        
        hideNewOrderPopup();
        showNextOrderInQueue();
        
        if (acceptedOrder) {
             db.collection("orders").doc(acceptedOrder.id).update({
                 status: "seen"
             }).catch(e => console.error("Error updating doc status:", e));
        }
    });

});
