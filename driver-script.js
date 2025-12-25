// --- 1. FIREBASE CONFIGURATION ---
// (Matched to your existing project settings)
const firebaseConfig = {
  apiKey: "AIzaSyAVh2kVIuFcrt8Dg88emuEd9CQlqjJxDrA",
  authDomain: "zaffran-delight.firebaseapp.com",
  projectId: "zaffran-delight",
  storageBucket: "zaffran-delight.firebasestorage.app",
  messagingSenderId: "1022960860126",
  appId: "1:1022960860126:web:1e06693dea1d0247a0bb4f"
};

// Initialize Firebase if not already running
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
const driverContainer = document.getElementById('driver-orders');

// Global Tracking Variable
let watchId = null;

// --- 2. MAIN LISTENER (Real-Time Updates) ---
// Listens for delivery orders that are NOT completed.
db.collection("orders")
    .where("orderType", "==", "delivery")
    .where("status", "in", ["preparing", "ready", "out_for_delivery"]) 
    .orderBy("createdAt", "asc")
    .onSnapshot((snapshot) => {
        driverContainer.innerHTML = "";
        
        if (snapshot.empty) {
            driverContainer.innerHTML = `
                <div class="empty-state">
                    <span class="material-icons" style="font-size: 64px; opacity:0.3;">check_circle</span>
                    <p>No active deliveries.</p>
                </div>`;
            return;
        }

        const now = new Date();

        snapshot.forEach((doc) => {
            const order = doc.data();
            renderDriverCard(doc.id, order, now);
        });
    }, (error) => {
        console.error("Firebase Error:", error);
        // Alert developer if Index is missing (Common Firebase issue)
        if(error.message.includes("index")) {
            driverContainer.innerHTML = `<p style="color:red; text-align:center; padding:20px; border:1px solid red;">⚠️ SYSTEM ALERT: Database Index Missing.<br>Open Console (F12) & click the Firebase link to fix.</p>`;
        }
    });


// --- 3. RENDER FUNCTION ---
function renderDriverCard(id, order, now) {
    // A. Address Construction
    const addr = order.deliveryAddress || {};
    const fullAddress = `${addr.street} ${addr.house}, ${addr.zip} Euskirchen`;
    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
    
    // B. Items List
    let itemsHtml = "";
    if(order.items && Array.isArray(order.items)) {
        itemsHtml = order.items.map(item => `
            <div>• ${item.quantity}x ${item.name}</div>
        `).join('');
    }

    // C. Overdue Logic (Red Card)
    let isOverdue = false;
    const timeSlot = order.timeSlot || "";
    // Parse HH:MM to check if we are late
    if (timeSlot.includes(':')) {
        const [hours, minutes] = timeSlot.split(':').map(Number);
        const deadline = new Date();
        deadline.setHours(hours, minutes, 0, 0);
        if (now > deadline) isOverdue = true;
    }

    // D. Status Logic
    let statusClass = 'status-preparing';
    let statusText = "Kitchen is Preparing...";
    let canComplete = false;

    if (order.status === 'ready' || order.status === 'out_for_delivery') {
        statusClass = 'status-ready';
        canComplete = true;
    }
    if (isOverdue) statusClass = 'status-overdue';

    // E. HTML TEMPLATE
    const html = `
    <div class="order-card ${statusClass}" id="card-${id}">
        
        <div class="order-header">
            <div>
                <span class="order-id">#${id.slice(-4).toUpperCase()}</span>
                ${isOverdue ? `<span class="overdue-badge"><span class="material-icons" style="font-size:12px">warning</span> LATE</span>` : ''}
            </div>
            <span class="order-time" style="${isOverdue ? 'color:#D44437' : ''}">
                🕒 ${timeSlot || 'ASAP'}
            </span>
        </div>

        <div id="in-app-map-${id}" class="in-app-map-container"></div>

        <div style="margin-bottom:15px;">
            <div class="customer-name">${order.customerName}</div>
            <div class="customer-address">
                <span class="material-icons" style="font-size:18px; color:#D4AF37; margin-top:2px;">place</span> 
                ${fullAddress}
            </div>
            
            <div class="action-grid">
                <button onclick="startInAppNav('${id}', '${fullAddress}')" class="btn-action btn-nav">
                    <span class="material-icons" style="margin-right:8px;">near_me</span> 
                    Start GPS Nav
                </button>

                <a href="${mapsLink}" target="_blank" class="btn-action btn-google">
                    <span class="material-icons" style="margin-right:5px; font-size:16px;">map</span> External Map
                </a>

                <a href="tel:${order.customerPhone}" class="btn-action btn-call">
                    <span class="material-icons" style="margin-right:5px;">call</span> Call
                </a>
                <a href="https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}" target="_blank" class="btn-action btn-whatsapp">
                    <span class="material-icons" style="margin-right:5px;">chat</span> WhatsApp
                </a>
            </div>
        </div>

        <div style="background:#2a2a2a; padding:12px; border-radius:6px; margin-bottom:15px; display:flex; justify-content:space-between; align-items:center;">
            <span style="color:#aaa;">To Collect:</span>
            <span style="color:#D4AF37; font-weight:bold; font-size:1.2rem;">${order.total.toFixed(2)} €</span>
        </div>

        <div style="font-size:0.9rem; color:#888; margin-bottom:15px; line-height:1.5;">
            <strong>Items:</strong><br>
            ${itemsHtml}
            ${order.notes ? `<div style="margin-top:5px; color:#FFC107;">⚠️ Note: ${order.notes}</div>` : ''}
        </div>

        ${canComplete ? `
            <button onclick="completeDelivery('${id}')" class="complete-btn" style="${isOverdue ? 'background:#D44437' : ''}">
                <span class="material-icons" style="vertical-align:middle; margin-right:5px;">check_circle</span>
                ${isOverdue ? 'COMPLETE URGENT DELIVERY' : 'DELIVERED & PAID'}
            </button>
        ` : `
            <div style="background:#333; color:#888; padding:15px; text-align:center; border-radius:8px;">
                <span class="material-icons" style="vertical-align:middle;">soup_kitchen</span>
                ${statusText}
            </div>
        `}
    </div>
    `;
    
    driverContainer.innerHTML += html;
}


// --- 4. START IN-APP NAVIGATION (The Cool Feature) ---
window.startInAppNav = function(orderId, addressText) {
    const mapDiv = document.getElementById(`in-app-map-${orderId}`);
    
    // Toggle Logic: If open, close it.
    if (mapDiv.classList.contains('active')) {
        mapDiv.classList.remove('active');
        // Stop tracking if they close the map? Optional.
        return; 
    }
    
    // Close any OTHER open maps (Accordion style)
    document.querySelectorAll('.in-app-map-container').forEach(el => el.classList.remove('active'));
    
    // Open this map
    mapDiv.classList.add('active');

    // Check GPS
    if (!navigator.geolocation) return alert("GPS is not supported on this device.");

    // Get Driver Position
    navigator.geolocation.getCurrentPosition((pos) => {
        const driverLat = pos.coords.latitude;
        const driverLng = pos.coords.longitude;

        // Initialize Leaflet Map
        // We use a dark theme tile layer to match the app
        const map = L.map(mapDiv).setView([driverLat, driverLng], 15);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap &copy; CARTO'
        }).addTo(map);

        // Find Customer Coordinates (Geocoding via Nominatim)
        // Note: Using free OpenStreetMap API. In production, consider Mapbox for higher limits.
        const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressText)}`;
        
        fetch(searchUrl)
            .then(res => res.json())
            .then(data => {
                if(data && data.length > 0) {
                    const custLat = data[0].lat;
                    const custLon = data[0].lon;

                    // Draw Route (Driver -> Customer)
                    L.Routing.control({
                        waypoints: [
                            L.latLng(driverLat, driverLng),
                            L.latLng(custLat, custLon)
                        ],
                        routeWhileDragging: false,
                        showAlternatives: false,
                        addWaypoints: false,
                        fitSelectedRoutes: true,
                        lineOptions: { styles: [{color: '#4285F4', opacity: 0.8, weight: 6}] },
                        createMarker: function() { return null; } // Hide default markers to add our own
                    }).addTo(map);
                    
                    // Add Custom Markers
                    const carIcon = L.divIcon({html: '🚗', className: 'map-icon', iconSize: [24,24]});
                    const homeIcon = L.divIcon({html: '🏠', className: 'map-icon', iconSize: [24,24]});

                    L.marker([driverLat, driverLng], {icon: carIcon}).addTo(map).bindPopup("You").openPopup();
                    L.marker([custLat, custLon], {icon: homeIcon}).addTo(map).bindPopup("Customer");

                    // 🚀 START LIVE TRACKING BACKGROUND PROCESS
                    startLiveTracking(orderId);

                } else {
                    alert("Exact address not found on In-App Map. Please use the External Map button.");
                    mapDiv.classList.remove('active');
                }
            })
            .catch(err => {
                console.error(err);
                alert("Map Error. Check internet connection.");
            });

    }, (err) => {
        alert("GPS Error: " + err.message);
        mapDiv.classList.remove('active');
    });
}


// --- 5. LIVE TRACKING HELPER ---
function startLiveTracking(orderId) {
    if(watchId) return; // Already tracking

    // Update status to 'Out for Delivery' immediately
    db.collection("orders").doc(orderId).update({ status: 'out_for_delivery' });

    alert("GPS Tracking Active! 🛰️\nKeep your screen ON for the customer to see you.");

    watchId = navigator.geolocation.watchPosition((pos) => {
        // Send location to Firebase every time the driver moves
        db.collection("orders").doc(orderId).update({
            driverLocation: { 
                lat: pos.coords.latitude, 
                lng: pos.coords.longitude 
            },
            lastLocationUpdate: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log("📍 Location sent");
    }, (err) => console.error("Tracking Error", err), {
        enableHighAccuracy: true,
        maximumAge: 0
    });
}


// --- 6. COMPLETE DELIVERY ---
window.completeDelivery = function(orderId) {
    // Haptic feedback
    if(navigator.vibrate) navigator.vibrate(50);

    if(!confirm("💰 Confirm: Money collected & Food delivered?")) return;

    db.collection("orders").doc(orderId).update({
        status: "completed",
        deliveredAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        // Stop tracking
        if(watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            watchId = null;
        }
        console.log("Order Completed");
    }).catch((error) => {
        alert("Error: " + error.message);
    });
}
