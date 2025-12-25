// Initialize Firebase (Copy your existing config logic here if not using a shared file)
if (!firebase.apps.length) {
    // Paste your firebaseConfig here if config.json is not loading correctly
    // firebase.initializeApp(firebaseConfig);
    // console.error("Firebase not initialized. Check your config.");
}

const db = firebase.firestore();
const driverContainer = document.getElementById('driver-orders');

// --- LISTENER ---
// We listen for orders where type == 'delivery' and status is NOT 'completed'
// Note: Firestore queries with multiple filters need an index. 
// If this query fails, check the console for a link to create the index.
db.collection("orders")
    .where("type", "==", "delivery")
    .where("status", "in", ["preparing", "ready", "out_for_delivery"]) 
    .orderBy("createdAt", "asc")
    .onSnapshot((snapshot) => {
        driverContainer.innerHTML = "";
        
        if (snapshot.empty) {
            driverContainer.innerHTML = `
                <div class="empty-state">
                    <span class="material-icons" style="font-size: 48px;">check_circle</span>
                    <p>All deliveries completed!</p>
                </div>`;
            return;
        }

        snapshot.forEach((doc) => {
            const order = doc.data();
            renderDriverCard(doc.id, order);
        });
    });


// --- RENDER FUNCTION ---
function renderDriverCard(id, order) {
    // 1. Format Address for Google Maps
    // Combine Street, House Nr, Zip, City
    const fullAddress = `${order.address}, ${order.zip || ''} ${order.city || 'Euskirchen'}`;
    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
    
    // 2. Format Items
    let itemsHtml = order.cart.map(item => `
        <div>${item.qty}x ${item.name} ${item.variant ? `(${item.variant})` : ''}</div>
    `).join('');

    // 3. Status Logic
    // If status is "preparing", driver sees it but maybe button is disabled or yellow?
    // If status is "ready", driver sees Green "Complete" button.
    const isReady = order.status === 'ready' || order.status === 'out_for_delivery';
    const statusClass = isReady ? 'status-ready' : 'status-preparing';
    const statusText = isReady ? 'READY FOR DELIVERY' : 'Cooking...';

    const html = `
    <div class="order-card ${statusClass}" id="card-${id}">
        <div class="order-header">
            <span class="order-id">#${id.slice(-4).toUpperCase()}</span>
            <span class="order-time">🕒 ${order.deliveryTime || 'ASAP'}</span>
        </div>

        <div class="customer-info">
            <div class="customer-name">${order.name}</div>
            <div class="customer-address">${order.address}</div>
            
            <a href="${mapsLink}" target="_blank" class="action-btn btn-map">
                <span class="material-icons" style="margin-right:5px; font-size:18px;">navigation</span> 
                Navigate (Google Maps)
            </a>

            <div style="display:flex; justify-content:space-between;">
                <a href="tel:${order.phone}" class="action-btn btn-call">
                    <span class="material-icons" style="font-size:18px;">call</span> Call
                </a>
                <a href="https://wa.me/${order.phone.replace(/[^0-9]/g, '')}" target="_blank" class="action-btn btn-whatsapp">
                    <span class="material-icons" style="font-size:18px;">chat</span> WA
                </a>
            </div>
        </div>

        <div class="payment-info">
            💰 Total: €${order.total} (${order.paymentMethod || 'Cash'})
        </div>

        <div class="items-list">
            <strong>Order Details:</strong>
            ${itemsHtml}
        </div>

        ${isReady ? `
            <button onclick="completeDelivery('${id}')" class="complete-btn">
                <span class="material-icons" style="vertical-align:middle;">check_circle</span>
                MARK AS DELIVERED
            </button>
        ` : `
            <div style="text-align:center; color:#FFC107; font-weight:bold; padding:10px; border:1px dashed #FFC107; border-radius:4px;">
                ⏳ Kitchen is still preparing...
            </div>
        `}

    </div>
    `;

    driverContainer.innerHTML += html;
}

// --- COMPLETE ORDER ---
function completeDelivery(orderId) {
    if(!confirm("Confirm delivery complete? Money collected?")) return;

    db.collection("orders").doc(orderId).update({
        status: "completed",
        deliveredAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        // Card will automatically vanish due to the listener
        console.log("Order completed");
    }).catch((error) => {
        console.error("Error updating document: ", error);
        alert("Error: " + error.message);
    });
}
