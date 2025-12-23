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

// --- WAITER MENU LIST (Kept as provided) ---
const MENU_ITEMS = [
    { name: "Tomatensuppe", price: 5.00 },
    { name: "Daal Linsensuppe", price: 5.00 },
    { name: "Hähnchen Suppe", price: 6.00 },
    { name: "Mulligatawny Suppe", price: 6.50 },
    { name: "Veg. Samosa", price: 5.00 },
    { name: "Chicken Samosa", price: 5.50 },
    { name: "Aloo Tiki", price: 5.00 },
    { name: "Mix Pakora", price: 5.50 },
    { name: "Paneer Pakora", price: 6.00 },
    { name: "Aloo Pakora", price: 5.50 },
    { name: "Gobi Pakora", price: 5.50 },
    { name: "Mashroom Pakora", price: 5.50 },
    { name: "Chicken Pakora", price: 6.00 },
    { name: "Prawn Pakora", price: 7.50 },
    { name: "Vegi Mix", price: 13.00 },
    { name: "Palak Aallu", price: 13.00 },
    { name: "Saag Aallu", price: 13.00 },
    { name: "Tarka Daal", price: 12.50 },
    { name: "Bhindi Masala", price: 13.00 },
    { name: "Baingen Aallu", price: 13.00 },
    { name: "Mushroom Aallu", price: 13.00 },
    { name: "Gobi Aallu", price: 13.00 },
    { name: "Channa Masala", price: 12.50 },
    { name: "Veg. Korma", price: 13.50 },
    { name: "Nauratan Korma", price: 14.00 },
    { name: "Shahi Paneer", price: 14.00 },
    { name: "Paneer Tikka Masala", price: 14.50 },
    { name: "Paneer Jalfrezi", price: 14.00 },
    { name: "Paneer Bhunna Masala", price: 14.00 },
    { name: "Palak Paneer", price: 14.00 },
    { name: "Paneer Muttar Aallu", price: 14.50 },
    { name: "Chicken Curry", price: 14.50 },
    { name: "Chicken Tikka Masala", price: 15.50 },
    { name: "Chicken Korma", price: 15.00 },
    { name: "Butter Chicken", price: 15.50 },
    { name: "Kashmiri Chicken", price: 15.50 },
    { name: "Chicken Goan Curry", price: 15.50 },
    { name: "Chicken Jalfrezi", price: 15.50 },
    { name: "Chicken Kadai", price: 15.50 },
    { name: "Chicken Bhuna", price: 15.50 },
    { name: "Vegi Chicken", price: 15.00 },
    { name: "Chicken Palak", price: 15.50 },
    { name: "Chicken Dhansik", price: 15.50 },
    { name: "Chicken Madras", price: 15.50 },
    { name: "Chicken Vindalo", price: 15.50 },
    { name: "Lamb Curry", price: 17.00 },
    { name: "Lamb Tikka Masala", price: 17.50 },
    { name: "Lamb Korma", price: 17.00 },
    { name: "Butter Lamb", price: 17.50 },
    { name: "Kashmiri Lamb", price: 17.50 },
    { name: "Lamb Goan Curry", price: 17.50 },
    { name: "Lamb Jalfrezi", price: 17.50 },
    { name: "Lamb Kadai", price: 17.50 },
    { name: "Lamb Bhuna", price: 17.50 },
    { name: "Vegi Lamb", price: 17.00 },
    { name: "Lamb Palak", price: 17.50 },
    { name: "Lamb Dhansik", price: 17.50 },
    { name: "Lamb Madras", price: 17.50 },
    { name: "Lamb Vindalo", price: 17.50 },
    { name: "Prawn Curry", price: 18.50 },
    { name: "Prawn Korma", price: 18.50 },
    { name: "Prawn Tikka Masala", price: 18.50 },
    { name: "Fish Curry", price: 18.50 },
    { name: "Fish Tikka Masala", price: 18.50 },
    { name: "Chicken Tikka", price: 17.50 },
    { name: "Tandoori Chicken", price: 17.50 },
    { name: "Malai Tikka", price: 17.50 },
    { name: "Haryali Tikka", price: 17.50 },
    { name: "Lamb Tikka", price: 18.50 },
    { name: "Lamb Chops", price: 20.50 },
    { name: "Seekh Kabab", price: 19.50 },
    { name: "Prawn Tikka", price: 20.50 },
    { name: "Paneer Tikka", price: 17.50 },
    { name: "Fish Tawa Fry", price: 20.50 },
    { name: "Zafrani Mix Grill", price: 24.00 },
    { name: "Vegi Biryani", price: 14.50 },
    { name: "Chicken Bombay Biryani", price: 16.50 },
    { name: "Lamb Karachi Biryani", price: 17.50 },
    { name: "Prawn Zafran Biryani", price: 20.50 },
    { name: "Frisches Tandoori Brot", price: 3.50 },
    { name: "Chapati Roti", price: 3.50 },
    { name: "Naan", price: 3.00 },
    { name: "Allo Naan", price: 4.50 },
    { name: "Cheese Naan", price: 5.00 },
    { name: "Butter Naan", price: 3.50 },
    { name: "Garlic Naan", price: 4.50 },
    { name: "Tandoori Parantha", price: 4.50 },
    { name: "Mint Sauce", price: 3.00 },
    { name: "Natur Joghurt", price: 2.50 },
    { name: "Raita", price: 4.00 },
    { name: "Mango Chutney", price: 3.00 },
    { name: "Imli (Tamarind) Chutney", price: 3.00 },
    { name: "Laal Chutney (scharfe...)", price: 3.50 },
    { name: "Green Chutney", price: 3.50 },
    { name: "Pickles", price: 3.50 },
    { name: "Soße nach Wahl", price: 5.00 },
    { name: "Gemüse-Frühlingsrollen", price: 5.00 },
    { name: "Pommes frites", price: 3.50 },
    { name: "Chicken Nuggets (6 Stk.)", price: 4.50 },
    { name: "Basmati - Reis", price: 3.50 },
    { name: "Zeera - Reis", price: 4.00 },
    { name: "Zafrani - Reis", price: 5.50 },
    { name: "Gemischter Salat", price: 6.00 },
    { name: "Chicken Salat", price: 7.50 },
    { name: "Zafrani Chicken Salat", price: 8.50 },
    { name: "Mango Kulfi", price: 5.50 },
    { name: "Almond Kulfi", price: 5.50 },
    { name: "Pista Kulfi", price: 5.50 },
    { name: "Gulab Jamun", price: 5.50 },
    { name: "Ras Malai", price: 5.50 },
    { name: "Lassi", price: 4.00 },
    { name: "Mango Lassi", price: 4.50 },
    { name: "Rosé Lassi", price: 4.50 },
    { name: "Coca Cola", price: 3.50 },
    { name: "Cola Zero", price: 3.50 },
    { name: "Sprite", price: 3.50 },
    { name: "Fanta", price: 3.50 },
    { name: "Pinacolada", price: 5.50 },
    { name: "Mint-Margarita", price: 5.50 },
    { name: "Ipanema", price: 5.50 }
];

// --- 2. Initialize Firebase ---
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// --- 3. Global State and DOM Elements ---
document.addEventListener("DOMContentLoaded", () => {

    const connectionIconEl = document.getElementById('connection-icon'); 
    
    // KDS Login
    const loginOverlay = document.getElementById('kitchen-login-overlay');
    const loginButton = document.getElementById('login-button');
    const passwordInput = document.getElementById('kitchen-password');
    const loginError = document.getElementById('login-error');
    const kdsContentWrapper = document.getElementById('kds-content-wrapper');

    const dineInGrid = document.getElementById('dine-in-grid');
    const pickupGrid = document.getElementById('pickup-grid');

    // Waiter Order Popup Elements
    const waiterModal = document.getElementById('waiter-order-modal');
    const closeModalX = document.getElementById('close-modal-x');
    const cancelModalBtn = document.getElementById('btn-cancel-modal');
    const submitModalBtn = document.getElementById('btn-submit-modal');
    const menuSearchInput = document.getElementById('menu-search');
    const menuListContainer = document.getElementById('menu-list');
    const currentOrderPreview = document.getElementById('new-order-items-list');
    const modalTableTitle = document.getElementById('modal-table-title');

    // Notification Elements
    const readyPopup = document.getElementById('ready-notification-popup');
    const readyPopupDetails = document.getElementById('ready-popup-details');
    const closeReadyPopupBtn = document.getElementById('close-ready-popup-btn');
    
    // NEW: Waiter Call Elements
    const waiterCallOverlay = document.getElementById('waiter-call-overlay');
    const waiterCallTableText = document.getElementById('waiter-call-table');
    const dismissWaiterBtn = document.getElementById('dismiss-waiter-btn');
    let currentWaiterCallId = null;

    let notificationAudio = new Audio('notification.mp3');
    let alertAudio = document.getElementById('alertSound'); // Use the audio tag for waiter calls

    let allOrders = {}; 
    let activeTableId = null; 
    let currentDraftOrder = []; 

    const KITCHEN_PASSWORD = "zafran"; 
    const TOTAL_DINE_IN_TABLES = 12;

    // --- 4. Login Logic ---
    loginButton.addEventListener('click', () => {
        if (passwordInput.value === KITCHEN_PASSWORD) {
            loginOverlay.classList.add('hidden');
            kdsContentWrapper.style.opacity = '1';
            initializeWaiterStation(); 
        } else {
            loginError.style.display = 'block';
        }
    });
    passwordInput.addEventListener('keyup', (e) => e.key === 'Enter' && loginButton.click());

    // --- 5. Main Waiter Station Functions ---

    function createDineInTables() {
        dineInGrid.innerHTML = '';
        for (let i = 1; i <= TOTAL_DINE_IN_TABLES; i++) {
            const tableBox = document.createElement('div');
            tableBox.className = 'table-box';
            tableBox.id = `table-${i}`; 
            tableBox.innerHTML = `
                <div class="table-header">
                    <h2>Table ${i}</h2>
                    <button class="add-order-btn" data-table-id="${i}">➕ Order</button>
                </div>
                <ul class="order-list" data-table-id="${i}"></ul>
                <p class="order-list-empty" data-table-id="${i}">Waiting for order...</p>
                <button class="clear-table-btn" data-table-id="${i}">Clear Table ${i}</button>
            `;
            dineInGrid.appendChild(tableBox);
        }
    }

    function initializeWaiterStation() {
        createDineInTables();

        // Listen for "Clear" buttons (Dine-in)
        dineInGrid.querySelectorAll('.clear-table-btn').forEach(btn => {
            btn.addEventListener('click', () => handleClearOrder(btn.dataset.tableId, 'dine-in', btn));
        });

        // Listen for "Add Order" buttons
        dineInGrid.querySelectorAll('.add-order-btn').forEach(btn => {
            btn.addEventListener('click', () => openOrderModal(btn.dataset.tableId));
        });

        // Main Listener: Listen for NEW, SEEN, READY, and COOKED (Served) orders
        db.collection("orders")
          .where("status", "in", ["new", "seen", "ready", "cooked"]) 
          .onSnapshot(
            (snapshot) => {
                connectionIconEl.textContent = '✅'; 
                
                let changedTables = new Set(); 
                snapshot.docChanges().forEach((change) => {
                    const orderData = change.doc.data();
                    
                    // --- NEW: INTERCEPT WAITER CALLS ---
                    if (orderData.orderType === 'assistance') {
                        if (change.type === "added") {
                            showWaiterCall(orderData.table, change.doc.id);
                        }
                        return; // Stop processing further
                    }
                    // -----------------------------------

                    if(orderData.orderType !== 'pickup') {
                        changedTables.add(orderData.table); 
                    }
                    
                    if (change.type === "modified" && orderData.status === "ready") {
                        triggerReadyNotification(orderData);
                    }
                    if (change.type === "added" || change.type === "modified") {
                        allOrders[orderData.id] = orderData;
                    }
                    if (change.type === "removed") {
                        delete allOrders[orderData.id];
                        // If it was a table, we need to re-render it to show empty
                        if(orderData.orderType !== 'pickup') changedTables.add(orderData.table);
                        // If pickup, re-render pickup grid
                        if(orderData.orderType === 'pickup') renderPickupGrid();
                    }
                });
                
                // Always re-render pickup on changes
                renderPickupGrid(); 

                changedTables.forEach(tableIdentifier => {
                    if (!isNaN(parseInt(tableIdentifier))) { 
                        renderDineInTable(tableIdentifier);
                    }
                });
                
                addDeleteItemListeners();
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
                // DELETE the order so it disappears from database
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

    function triggerReadyNotification(order) {
        readyPopupDetails.innerHTML = `
            <h4 style="color:var(--gold);margin-top:0;">${order.table}</h4>
            <p>Order is ready!</p>
        `;
        readyPopup.classList.remove('hidden');
        notificationAudio.play().catch(e => console.log(e));
    }
    
    if (closeReadyPopupBtn) {
        closeReadyPopupBtn.addEventListener('click', () => {
            readyPopup.classList.add('hidden');
        });
    }

    // --- RENDER DINE-IN TABLE ---
    function renderDineInTable(tableId) {
        const tableBox = document.getElementById(`table-${tableId}`);
        if (!tableBox) return; 
        
        const orderList = tableBox.querySelector('.order-list');
        const emptyMsg = tableBox.querySelector('.order-list-empty');
        const clearBtn = tableBox.querySelector('.clear-table-btn'); 

        const ordersForThisTable = Object.values(allOrders).filter(o => o.table === tableId && o.orderType !== 'pickup');
        
        orderList.innerHTML = ""; 
        
        if (ordersForThisTable.length === 0) {
            orderList.style.display = 'none';
            emptyMsg.style.display = 'block';
            clearBtn.disabled = false;
            clearBtn.textContent = `Clear Table ${tableId}`;
            clearBtn.style.backgroundColor = "#8B0000"; 
            tableBox.classList.remove('new-order-flash'); 
        } else {
            orderList.style.display = 'block';
            emptyMsg.style.display = 'none';
            
            ordersForThisTable.sort((a, b) => a.createdAt.seconds - b.createdAt.seconds);
            
            let allServed = true;

            ordersForThisTable.forEach(order => {
                const orderTimestamp = order.createdAt.toDate().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
                
                const isReady = order.status === 'ready';
                const isCooked = order.status === 'cooked';
                
                if (!isCooked) allServed = false; // If any item is not cooked, table is active

                let itemsHtml = order.items.map((item, index) => `
                    <li class="waiter-item">
                        <span>${item.quantity}x ${item.name}</span>
                        ${!isCooked ? `<button class="delete-item-btn" data-order-id="${order.id}" data-item-index="${index}">×</button>` : ''}
                    </li>
                `).join('');
                
                let notesHtml = '';
                if (order.notes && order.notes.trim() !== '') {
                    notesHtml = `<p class="order-notes">⚠️ Notes: ${order.notes}</p>`;
                }

                let orderClass = '';
                let statusBadge = '';
                let actionBtnHtml = '';

                if (isCooked) {
                    statusBadge = '<span style="color:#aaa;font-weight:bold;float:right;">🔵 SERVED</span>';
                } else if (isReady) {
                    orderClass = 'ready-order';
                    statusBadge = '<span style="color:#25D366;font-weight:bold;float:right;">✅ READY</span>';
                    actionBtnHtml = `<button class="btn-serve" onclick="handleSingleServe('${order.id}')">Serve / Clear</button>`;
                }

                const bgStyle = isCooked ? 'background-color: #222; opacity: 0.8; border: 1px solid #444;' : '';

                const orderGroupHtml = `
                    <div class="order-group ${orderClass}" id="${order.id}" style="${bgStyle}">
                        <h4>Order @ ${orderTimestamp} ${statusBadge}</h4>
                        <ul>${itemsHtml}</ul>
                        ${notesHtml} 
                        ${actionBtnHtml}
                    </div>
                `;
                orderList.innerHTML += orderGroupHtml;
            });

            // --- CHANGED LOGIC HERE ---
            if (allServed) {
                // If everything is served, allow Force Close (Archive)
                clearBtn.textContent = "💰 Paid & Close Table";
                clearBtn.style.backgroundColor = "#006400"; // Green
                clearBtn.disabled = false;
            } else {
                // Standard Clear button (does nothing if not all served)
                clearBtn.textContent = `Clear Table ${tableId}`;
                clearBtn.style.backgroundColor = "#8B0000"; // Red
                clearBtn.disabled = false;
            }
        }
    }

    // --- RENDER PICKUP GRID ---
    function renderPickupGrid() {
        pickupGrid.innerHTML = ''; 
        
        const pickupOrders = Object.values(allOrders).filter(o => o.orderType === 'pickup');
        pickupOrders.sort((a, b) => a.createdAt.seconds - b.createdAt.seconds);

        if (pickupOrders.length === 0) {
            pickupGrid.innerHTML = `<div class="pickup-box-empty"><p>Waiting for pickup orders...</p></div>`;
            return;
        }

        pickupOrders.forEach(order => {
            const orderTimestamp = order.createdAt.toDate().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
            const isReady = order.status === 'ready';
            const isCooked = order.status === 'cooked';
            
            const readyClass = isReady ? 'ready-order' : '';
            let statusBadge = isReady ? '<span style="color:#25D366;font-weight:bold;float:right;">✅ READY</span>' : '';
            if(isCooked) statusBadge = '<span style="color:#aaa;font-weight:bold;float:right;">🔵 SERVED</span>';

            let itemsHtml = order.items.map((item, index) => `
                <li class="waiter-item">
                    <span>${item.quantity}x ${item.name}</span>
                    ${!isCooked ? `<button class="delete-item-btn" data-order-id="${order.id}" data-item-index="${index}">×</button>` : ''}
                </li>
            `).join('');

            let notesHtml = '';
            if (order.notes && order.notes.trim() !== '') {
                notesHtml = `<p class="order-notes">⚠️ Notes: ${order.notes}</p>`;
            }

            // --- CHANGED BUTTON LOGIC HERE ---
            let buttonHtml = '';
            if (isCooked) {
                // Already served, show "Paid & Close"
                buttonHtml = `<button class="clear-pickup-btn" style="background-color: #006400;" onclick="handleClearOrder('${order.id}', 'pickup-archive', this)">💰 Paid & Close</button>`;
            } else {
                // Active order, show "Order Complete" (Serve)
                buttonHtml = `<button class="clear-pickup-btn" onclick="handleClearOrder('${order.id}', 'pickup-serve', this)">Order Served</button>`;
            }

            const pickupBox = document.createElement('div');
            pickupBox.className = `pickup-box ${readyClass}`;
            if(isCooked) pickupBox.style.opacity = '0.7';
            
            pickupBox.id = `pickup-${order.id}`;
            pickupBox.innerHTML = `
                <div class="table-header">
                    <h2>🛍️ ${order.table}</h2> <span class="order-time">@ ${orderTimestamp}</span>
                </div>
                <div style="padding:0 15px;">${statusBadge}</div>
                <ul class="order-list">${itemsHtml}</ul>
                ${notesHtml} 
                ${buttonHtml}
            `;
            pickupGrid.appendChild(pickupBox);
        });
    }

    // --- GLOBAL HANDLE FUNCTIONS (For inline onclicks) ---
    window.handleSingleServe = function(orderId) {
        handleClearOrder(orderId, 'single-serve', null);
    }
    window.handleClearOrder = handleClearOrder; // Ensure global access

    // --- MAIN ACTION LOGIC ---
    async function handleClearOrder(identifier, type, buttonElement) {
        // identifier = tableId OR orderId depending on type
        
        let ordersToProcess = [];
        let action = ""; // 'serve' or 'archive'

        if (type === 'dine-in') {
            const tableOrders = Object.values(allOrders).filter(o => o.table === identifier && o.orderType !== 'pickup');
            
            // Check if ALL are already cooked
            const allCooked = tableOrders.every(o => o.status === 'cooked');
            
            if (allCooked) {
                action = 'archive';
                if(!confirm(`Close Table ${identifier}? This will archive all orders.`)) return;
            } else {
                action = 'serve';
                // Only serve items that are NOT YET cooked
                ordersToProcess = tableOrders.filter(o => o.status !== 'cooked');
            }
            if (action === 'archive') ordersToProcess = tableOrders;

        } else if (type === 'pickup-serve') {
            action = 'serve';
            ordersToProcess = [allOrders[identifier]];
        } else if (type === 'pickup-archive') {
            action = 'archive';
            if(!confirm("Confirm payment received and close order?")) return;
            ordersToProcess = [allOrders[identifier]];
        } else if (type === 'single-serve') {
            action = 'serve';
            ordersToProcess = [allOrders[identifier]];
        }

        if (ordersToProcess.length === 0 || !ordersToProcess[0]) return;

        if (buttonElement) {
            buttonElement.disabled = true;
            buttonElement.textContent = "Processing...";
        }

        try {
            const batch = db.batch();
            
            if (action === 'serve') {
                // Mark as Cooked (Served)
                ordersToProcess.forEach(order => {
                    const docRef = db.collection("orders").doc(order.id);
                    batch.update(docRef, { status: "cooked" });
                });
                await batch.commit();
            } 
            else if (action === 'archive') {
                for (const order of ordersToProcess) {
                    const archiveRef = db.collection("archived_orders").doc(`archive-${order.id}`);
                    await archiveRef.set({
                        ...order,
                        closedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    
                    await db.collection("orders").doc(order.id).delete();
                }
            }

        } catch (e) {
            console.error(`Error processing ${type}: `, e);
            alert("Error updating order. Check console.");
            if (buttonElement) buttonElement.disabled = false;
        }
    }

    // --- WAITER POPUP LOGIC ---
    function openOrderModal(tableId) {
        activeTableId = tableId;
        currentDraftOrder = []; 
        modalTableTitle.textContent = `Order for Table ${tableId}`;
        waiterModal.classList.remove('hidden');
        renderMenu(""); 
        renderDraftOrder();
        menuSearchInput.value = "";
        
        const noteEl = document.getElementById('waiter-order-notes');
        if(noteEl) noteEl.value = ""; 
        
        menuSearchInput.focus();
    }

    function closeOrderModal() {
        waiterModal.classList.add('hidden');
        activeTableId = null;
        currentDraftOrder = [];
    }

    closeModalX.addEventListener('click', closeOrderModal);
    cancelModalBtn.addEventListener('click', closeOrderModal);

    menuSearchInput.addEventListener('input', (e) => {
        renderMenu(e.target.value.toLowerCase());
    });

    function renderMenu(query) {
        menuListContainer.innerHTML = "";
        const filteredItems = MENU_ITEMS.filter(item => item.name.toLowerCase().includes(query));
        
        filteredItems.forEach(item => {
            const div = document.createElement('div');
            div.className = 'menu-selection-item';
            div.innerHTML = `<span>${item.name}</span><span style="color: var(--gold);">${item.price.toFixed(2)} €</span>`;
            div.addEventListener('click', () => addItemToDraft(item));
            menuListContainer.appendChild(div);
        });
    }

    function addItemToDraft(item) {
        const existing = currentDraftOrder.find(i => i.name === item.name);
        if (existing) { existing.quantity++; } 
        else { currentDraftOrder.push({ name: item.name, price: item.price, quantity: 1 }); }
        renderDraftOrder();
    }

    function renderDraftOrder() {
        currentOrderPreview.innerHTML = "";
        if (currentDraftOrder.length === 0) {
            currentOrderPreview.innerHTML = '<p style="color:#aaa; font-style:italic;">No items selected.</p>';
            return;
        }
        currentDraftOrder.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'preview-item';
            div.innerHTML = `
                <span>${item.quantity}x ${item.name}</span>
                <button style="background:#8B0000;color:white;border:none;border-radius:50%;width:20px;height:20px;cursor:pointer;" onclick="removeDraftItem(${index})">×</button>
            `;
            currentOrderPreview.appendChild(div);
        });
    }

    window.removeDraftItem = function(index) {
        if (currentDraftOrder[index].quantity > 1) { currentDraftOrder[index].quantity--; } 
        else { currentDraftOrder.splice(index, 1); }
        renderDraftOrder();
    };

    submitModalBtn.addEventListener('click', async () => {
        if (!activeTableId || currentDraftOrder.length === 0) return;

        submitModalBtn.textContent = "Sending...";
        submitModalBtn.disabled = true;

        const orderId = `${activeTableId}-${new Date().getTime()}`;
        
        // Safe Notes Logic
        const noteEl = document.getElementById('waiter-order-notes');
        let finalNote = "Waiter Order"; 
        if (noteEl && noteEl.value.trim() !== "") { finalNote = noteEl.value.trim(); }

        const newOrder = {
            id: orderId,
            table: activeTableId,
            items: currentDraftOrder,
            status: "new",
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            orderType: "dine-in",
            notes: finalNote
        };

        try {
            await db.collection("orders").doc(orderId).set(newOrder);
            closeOrderModal();
        } catch (e) {
            console.error("Error submitting waiter order:", e);
            alert("Failed to submit order.");
        } finally {
            submitModalBtn.textContent = "Submit Order";
            submitModalBtn.disabled = false;
        }
    });

    function addDeleteItemListeners() {
        document.querySelectorAll('.delete-item-btn').forEach(btn => {
            btn.onclick = async () => {
                const orderId = btn.dataset.orderId;
                const itemIndex = parseInt(btn.dataset.itemIndex); 
                if (isNaN(itemIndex)) return;
                if (!confirm("Remove this item?")) return;
                btn.disabled = true;

                try {
                    const docRef = db.collection("orders").doc(orderId);
                    const doc = await docRef.get();
                    if (!doc.exists) return;
                    const orderData = doc.data();
                    const items = orderData.items;
                    if (!items) return; 

                    if (items.length === 1) { await docRef.delete(); } 
                    else {
                        items.splice(itemIndex, 1);
                        await docRef.update({ items: items });
                    }
                } catch (err) {
                    console.error("Error deleting item:", err);
                    btn.disabled = false; 
                }
            };
        });
    }

});
