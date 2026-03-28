// --- 1. ZAFFRAN FIREBASE CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyAVh2kVIuFcrt8Dg88emuEd9CQlqjJxDrA",
  authDomain: "zaffran-delight.firebaseapp.com",
  projectId: "zaffran-delight",
  storageBucket: "zaffran-delight.firebasestorage.app",
  messagingSenderId: "1022960860126",
  appId: "1:1022960860126:web:1e06693dea1d0247a0bb4f"
};

// --- 2. Initialize Firebase ---
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// --- GLOBAL STATE ---
let cart = [];
let currentCoupon = null; 
let cartSubtotal = 0;      
let globalConfig = { whatsappNumber: "" }; 
let businessHours = {}; // Will hold loaded settings

// --- CONFIGURATION ---
const MIN_ORDER_DELIVERY = 20.00; 

// --- HELPER: DETECT PAGE TYPE ---
const isDeliveryPage = () => document.getElementById('delivery-street') !== null;

document.addEventListener("DOMContentLoaded", async () => {
    
    // --- 1. LOAD SETTINGS & CHECK STATUS ---
    await loadSettingsAndHours();
    checkAndShowMarketing();

    // --- NEW: LOAD CART MEMORY ---
    const savedCart = sessionStorage.getItem('zafran_cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
            if(cart.length > 0) {
                // Update UI immediately if cart exists
                const countEl = document.getElementById('cart-item-count');
                const toggleBtn = document.getElementById('cart-toggle-btn');
                if(countEl) countEl.innerText = cart.reduce((sum, i) => sum + i.quantity, 0);
                if(toggleBtn) toggleBtn.classList.remove('hidden');
                // Note: We don't call updateCart() here because the cart overlay isn't open yet
            }
        } catch (e) { console.error(e); }
    }
    
    // --- Header Scroll Padding ---
    const header = document.querySelector('header');
    function updateScrollPadding() {
        if (header) {
            document.documentElement.style.setProperty('scroll-padding-top', `${header.offsetHeight}px`);
        }
    }
    updateScrollPadding();
    window.addEventListener('resize', updateScrollPadding);
    
    // --- Element References ---
    const cartToggleBtn = document.getElementById('cart-toggle-btn');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartCloseBtn = document.getElementById('cart-close-btn');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartItemCountEl = document.getElementById('cart-item-count');
    
    const subtotalAmountEl = document.getElementById('subtotal-amount'); 
    const totalAmountEl = document.getElementById('total-amount');
    
    const cartContentEl = document.getElementById('cart-content');
    const orderForm = document.getElementById('order-form');
    const whatsappBtn = document.getElementById('whatsapp-btn');
    const firebaseBtn = document.getElementById('firebase-btn');
    const consentCheckbox = document.getElementById('privacy-consent');
    const applyCouponBtn = document.getElementById('apply-coupon-btn');

    // New Success Modal Elements
    const successModal = document.getElementById('success-modal');
    const successContent = document.getElementById('success-summary-content');

    // --- Event Listeners ---
    if (cartToggleBtn) cartToggleBtn.addEventListener('click', openCart);
    if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
    
    if (applyCouponBtn) {
        applyCouponBtn.addEventListener('click', handleApplyCoupon);
    }

    // --- Modal Logic ---
    function openCart() {
        if(successModal) successModal.classList.remove('flex'); 
        cartContentEl.style.display = 'block'; 
        cartOverlay.classList.remove('hidden');
        updateCart(); 
        toggleCheckoutButtons();
    }
    
    function closeCart() { 
        cartOverlay.classList.add('hidden'); 
    }

    window.closeSuccessModal = function() {
        if(successModal) successModal.classList.remove('flex');
    };

    function toggleCheckoutButtons() {
        if (consentCheckbox) {
            const isChecked = consentCheckbox.checked;
            if (whatsappBtn) whatsappBtn.disabled = !isChecked;
            if (firebaseBtn) firebaseBtn.disabled = !isChecked; 
        }
    }
    if (consentCheckbox) consentCheckbox.addEventListener('change', toggleCheckoutButtons);
    toggleCheckoutButtons(); 

    // --- Item Controls ---
    function initItemControls() {
        document.querySelectorAll('.add-btn').forEach(btn => {
            btn.removeEventListener('click', handleAddToCartClick);
            btn.addEventListener('click', handleAddToCartClick);
        });
        document.querySelectorAll('.menu-btn-minus').forEach(btn => {
            btn.removeEventListener('click', handleRemoveFromCartClick);
            btn.addEventListener('click', handleRemoveFromCartClick);
        });
    }
    
    function handleAddToCartClick() {
        addToCart(
            this.dataset.id, 
            this.dataset.name, 
            parseFloat(this.dataset.price),
            this.dataset.category 
        );
    }
    function handleRemoveFromCartClick() {
        adjustQuantity(this.dataset.id, -1);
    }
    initItemControls(); 
    
    function addToCart(id, name, price, category) {
        const existingItem = cart.find(item => item.id === id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ id, name, price, category: category || "unknown", quantity: 1 });
        }
        updateCart();
    }

    function adjustQuantity(id, amount) {
        const item = cart.find(item => item.id === id);
        if (!item) return;
        item.quantity += amount;
        if (item.quantity <= 0) cart = cart.filter(item => item.id !== id);
        updateCart();
    }

    // --- COUPON LOGIC ---
    async function handleApplyCoupon() {
        const codeInput = document.getElementById('coupon-input');
        const msgEl = document.getElementById('coupon-message');
        const code = codeInput.value.trim().toUpperCase();

        if (!code) return;

        msgEl.textContent = "Überprüfe...";
        msgEl.style.color = "#666";

        try {
            const doc = await db.collection('coupons').doc(code).get();
            
            if (!doc.exists) {
                msgEl.textContent = "Ungültiger Code.";
                msgEl.style.color = "red";
                currentCoupon = null;
                updateCart();
            } else {
                const data = doc.data();
                const today = new Date().toISOString().split('T')[0];

                if (data.expiryDate && data.expiryDate !== 'Recurring' && data.expiryDate < today) {
                    msgEl.textContent = "Gutschein abgelaufen.";
                    msgEl.style.color = "red";
                    currentCoupon = null;
                    updateCart();
                } 
                else if (data.validFor === 'pickup' && isDeliveryPage()) {
                    msgEl.textContent = "Dieser Code gilt nur für Abholung (Pickup)!";
                    msgEl.style.color = "red";
                    currentCoupon = null;
                    updateCart();
                }
                else if (data.validFor === 'delivery' && !isDeliveryPage()) {
                    msgEl.textContent = "Dieser Code gilt nur für Lieferung (Delivery)!";
                    msgEl.style.color = "red";
                    currentCoupon = null;
                    updateCart();
                }
                else {
                    // 🚨 NEW: Custom UI Modal instead of Prompt
                    if (data.discountType === 'gratis' && data.promoAskChoice) {
                        showPromoChoiceModal(data, msgEl, codeInput);
                        return; // Stop execution here. The modal handles the rest!
                    } 
                    else {
                        if (data.discountType === 'gratis') data.finalPromoName = data.promoItemName;
                        currentCoupon = data;
                        msgEl.textContent = `Code gefunden. Prüfe...`;
                        msgEl.style.color = "#666";
                        codeInput.value = ""; 
                        updateCart();
                    }
                }
            }
        } catch (error) {
            console.error("Coupon Error:", error);
            msgEl.textContent = "Fehler beim Prüfen.";
            msgEl.style.color = "red";
        }
    }

    // --- NEW: SLEEK CHOICE MODAL ---
    function showPromoChoiceModal(couponData, msgEl, codeInput) {
        // Create the dark overlay 
        const overlay = document.createElement('div');
        overlay.style.cssText = "position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.85); z-index:100000; display:flex; justify-content:center; align-items:center; padding:15px; box-sizing:border-box; animation: fadeIn 0.2s ease;";

        // Create the modern popup box 
        const box = document.createElement('div');
        box.style.cssText = "background:#222; border:2px solid #D4AF37; border-radius:12px; padding:20px; width:100%; max-width:350px; text-align:center; color:white; box-shadow:0 10px 30px rgba(0,0,0,0.8); max-height:80vh; overflow-y:auto; box-sizing:border-box; margin:auto;";

        box.innerHTML = `
            <h3 style="color:#D4AF37; margin-top:0; font-size:1.3rem; text-transform:uppercase;">Gratis-Artikel Wählen</h3>
            <p style="margin-bottom:15px; color:#ccc; font-size:0.95rem;">Bitte wählen Sie Ihre Sorte:</p>
            <div style="display:flex; flex-direction:column; gap:10px;">
                <button class="promo-choice-btn" data-choice="Mango Lassi" style="background:#333; color:white; border:1px solid #555; padding:12px; border-radius:8px; font-size:1.1rem; cursor:pointer; font-weight:bold; transition:0.2s;">🥭 Mango Lassi</button>
                <button class="promo-choice-btn" data-choice="Rosé Lassi" style="background:#333; color:white; border:1px solid #555; padding:12px; border-radius:8px; font-size:1.1rem; cursor:pointer; font-weight:bold; transition:0.2s;">🌹 Rose Lassi</button>
                <button class="promo-choice-btn" data-choice="Salz Lassi" style="background:#333; color:white; border:1px solid #555; padding:12px; border-radius:8px; font-size:1.1rem; cursor:pointer; font-weight:bold; transition:0.2s;">🧂 Salz Lassi</button>
            </div>
            <button id="promo-cancel-btn" style="background:transparent; color:#ff4444; border:1px solid #ff4444; padding:10px; border-radius:8px; margin-top:15px; width:100%; cursor:pointer; font-weight:bold; font-size:1rem;">Abbrechen</button>
        `;

        overlay.appendChild(box);
        document.body.appendChild(overlay);

        // Make the buttons hover gold and process the order when clicked
        const btns = box.querySelectorAll('.promo-choice-btn');
        btns.forEach(btn => {
            btn.onmouseover = () => { btn.style.background = '#D4AF37'; btn.style.color = 'black'; btn.style.borderColor = '#D4AF37'; };
            btn.onmouseout = () => { btn.style.background = '#333'; btn.style.color = 'white'; btn.style.borderColor = '#555'; };

            btn.onclick = () => {
                couponData.finalPromoName = btn.dataset.choice;
                currentCoupon = couponData;

                if(msgEl) {
                    msgEl.textContent = `Code gefunden. Prüfe...`;
                    msgEl.style.color = "#666";
                }
                if(codeInput) codeInput.value = "";

                overlay.remove();
                updateCart(); // Trigger the cart calculation!
            };
        });

        // Handle Cancel
        box.querySelector('#promo-cancel-btn').onclick = () => {
            if(msgEl) {
                msgEl.textContent = "Auswahl abgebrochen.";
                msgEl.style.color = "orange";
            }
            currentCoupon = null;
            overlay.remove();
            updateCart();
        };
    }

    function calculateFinalTotals() {
        let discountAmount = 0;
        let couponStatusMsg = "";
        let couponStatusColor = "";

        if (currentCoupon) {
            const reqMinOrder = currentCoupon.minOrder || 0; 
            const reqMainDishes = currentCoupon.minMainDishes || 0;

            let baseSubtotal = 0;
            let mainDishCount = 0;
            cart.forEach(item => {
                if(!item.isPromo) {
                    baseSubtotal += (item.price * item.quantity);
                    if (item.price >= 12.00) mainDishCount += item.quantity;
                }
            });

            if (baseSubtotal < reqMinOrder) {
                couponStatusMsg = `Gutschein "${currentCoupon.code}": Mindestbestellwert ${reqMinOrder}€ nicht erreicht (Noch ${(reqMinOrder - baseSubtotal).toFixed(2)}€).`;
                couponStatusColor = "orange";
                discountAmount = 0; 
            } 
            else if (mainDishCount < reqMainDishes) {
                couponStatusMsg = `Gutschein "${currentCoupon.code}": Es fehlen noch ${reqMainDishes - mainDishCount} Hauptgerichte (>= 12€).`;
                couponStatusColor = "orange";
                discountAmount = 0; 
            }
            else {
                if (currentCoupon.discountType === 'gratis') {
                    couponStatusMsg = `Gutschein "${currentCoupon.code}" aktiv: Gratis Artikel hinzugefügt!`;
                    couponStatusColor = "green";
                    discountAmount = 0; 
                } 
                else {
                    const isPercent = currentCoupon.discountType === 'percent';
                    const value = currentCoupon.discountValue || 0;
                    const isAll = currentCoupon.validCategories === 'all' || (Array.isArray(currentCoupon.validCategories) && currentCoupon.validCategories.includes('all'));

                    let eligibleAmount = 0;
                    if (isAll) {
                        eligibleAmount = baseSubtotal;
                    } else {
                        cart.forEach(item => {
                            if (!item.isPromo && item.category && currentCoupon.validCategories.includes(item.category)) {
                                eligibleAmount += (item.price * item.quantity);
                            }
                        });
                    }

                    if (eligibleAmount > 0) {
                        if (isPercent) {
                            discountAmount = (eligibleAmount * value) / 100;
                            couponStatusMsg = `Gutschein "${currentCoupon.code}" (${value}%) aktiviert: -${discountAmount.toFixed(2)} €`;
                        } else {
                            discountAmount = Math.min(value, eligibleAmount);
                            couponStatusMsg = `Gutschein "${currentCoupon.code}" (${value}€) aktiviert: -${discountAmount.toFixed(2)} €`;
                        }
                        couponStatusColor = "green";
                    } else {
                        couponStatusMsg = `Gutschein "${currentCoupon.code}" nicht anwendbar auf diese Artikel.`;
                        couponStatusColor = "orange";
                    }
                }
            }
        }

        const finalTotal = Math.max(0, cartSubtotal - discountAmount);
        return { discountAmount, finalTotal, couponStatusMsg, couponStatusColor };
    }

    function updateCart() {
        cart = cart.filter(item => !item.isPromo);

        let baseSubtotal = 0;
        let mainDishCount = 0;
        cart.forEach(item => {
            baseSubtotal += (item.price * item.quantity);
            if (item.price >= 12.00) mainDishCount += item.quantity;
        });

        if (currentCoupon && currentCoupon.discountType === 'gratis') {
            const reqMinOrder = currentCoupon.minOrder || 0;
            const reqMainDishes = currentCoupon.minMainDishes || 0;

            if (baseSubtotal >= reqMinOrder && mainDishCount >= reqMainDishes) {
                cart.push({
                    id: 'promo-item',
                    name: '🎁 GRATIS ' + (currentCoupon.finalPromoName || "Artikel"),
                    price: 0,
                    quantity: 1,
                    isPromo: true 
                });
            }
        }

        cartItemsContainer.innerHTML = "";
        let subtotal = 0;
        let itemCount = 0;

        document.querySelectorAll('.item-qty').forEach(qtyEl => {
            const item = cart.find(i => i.id === qtyEl.dataset.id && !i.isPromo);
            const controlsDiv = qtyEl.closest('.quantity-controls');
            if (item) {
                qtyEl.innerText = item.quantity;
                controlsDiv.classList.remove('hidden');
            } else {
                qtyEl.innerText = '1'; 
                controlsDiv.classList.add('hidden');
            }
        });

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = "<p>Ihre Bestellung ist leer.</p>";
        } else {
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                subtotal += itemTotal;
                itemCount += item.quantity;
                const itemEl = document.createElement('div');
                itemEl.classList.add('cart-item');
                
                if (item.isPromo) {
                    itemEl.innerHTML = `
                        <span class="cart-item-name" style="color:#28a745; font-weight:bold;">${item.name}</span>
                        <div class="cart-item-controls"><span style="color:#28a745; font-weight:bold;">GRATIS</span></div>
                        <span class="cart-item-price" style="color:#28a745;">0.00 €</span>
                    `;
                } else {
                    itemEl.innerHTML = `
                        <span class="cart-item-name">${item.name}</span>
                        <div class="cart-item-controls">
                            <button class="cart-btn-minus" data-id="${item.id}">-</button>
                            <span>${item.quantity}</span>
                            <button class="cart-btn-plus" data-id="${item.id}">+</button>
                        </div>
                        <span class="cart-item-price">${itemTotal.toFixed(2)} €</span>
                    `;
                }
                cartItemsContainer.appendChild(itemEl);
            });
        }

        cartSubtotal = subtotal; 
        if(subtotalAmountEl) subtotalAmountEl.innerText = `${subtotal.toFixed(2)} €`;

        const { discountAmount, finalTotal, couponStatusMsg, couponStatusColor } = calculateFinalTotals();
        totalAmountEl.innerText = `${finalTotal.toFixed(2)} €`;
        
        const msgEl = document.getElementById('coupon-message');
        if(currentCoupon && msgEl) {
             msgEl.textContent = couponStatusMsg;
             msgEl.style.color = couponStatusColor;
        } else if (!currentCoupon && msgEl) {
             msgEl.textContent = ""; 
        }

        cartItemCountEl.innerText = itemCount;
        cartToggleBtn.classList.toggle('hidden', itemCount === 0);
        addCartItemControls();

        sessionStorage.setItem('zafran_cart', JSON.stringify(cart)); 
    }

    function addCartItemControls() {
        document.querySelectorAll('.cart-btn-plus').forEach(btn => {
            btn.addEventListener('click', () => adjustQuantity(btn.dataset.id, 1));
        });
        document.querySelectorAll('.cart-btn-minus').forEach(btn => {
            btn.addEventListener('click', () => adjustQuantity(btn.dataset.id, -1));
        });
    }
    
    function generateOrderSummary() {
        let summaryText = "";
        let itemsOnly = [];
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            summaryText += `${item.quantity}x ${item.name} (${itemTotal.toFixed(2)} €)\n`;
            itemsOnly.push({
                quantity: item.quantity,
                name: item.name,
                price: item.price,
                category: item.category || "unknown"
            });
        });

        const { discountAmount, finalTotal } = calculateFinalTotals();

        let couponDisplay = null;
        if (currentCoupon && discountAmount > 0) {
            const typeSymbol = currentCoupon.discountType === 'percent' ? '%' : '€';
            couponDisplay = `${currentCoupon.code} (${currentCoupon.discountValue}${typeSymbol})`;
        }

        return { 
            summaryText, 
            itemsOnly, 
            originalTotal: cartSubtotal,
            discount: discountAmount,
            finalTotal: finalTotal,
            couponInfo: couponDisplay
        };
    }

    // --- DISPLAY SUCCESS MODAL ---
    function showConfirmationScreen(formData, summary) {
        let html = `<strong style="color:var(--gold)">Kunde:</strong> ${formData.name}<br>`;
        
        if (isDeliveryPage()) {
            html += `<strong style="color:var(--gold)">Lieferung an:</strong> ${formData.address.street} ${formData.address.house}, ${formData.address.zip}<br>`;
        }

        html += `<strong style="color:var(--gold)">Zeit:</strong> ${formData.time} Uhr<br>
                 <strong style="color:var(--gold)">Telefon:</strong> ${formData.phone}<br><br>
                 <strong style="color:var(--gold)">Bestellung:</strong><br>${summary.summaryText.replace(/\n/g, '<br>')}`;
        
        if (summary.discount > 0) {
            html += `<br>Zwischensumme: ${summary.originalTotal.toFixed(2)} €`;
            html += `<br><span style="color:#28a745">Gutschein (${summary.couponInfo}): -${summary.discount.toFixed(2)} €</span>`;
        }
        
        html += `<br><br><strong style="font-size:1.1rem; color:#fff;">Total: ${summary.finalTotal.toFixed(2)} €</strong>`;

        if (formData.notes) {
            html += `<br><br><strong style="color:var(--gold)">Anmerkungen:</strong><br>${formData.notes.replace(/\n/g, '<br>')}`;
        }
        
        closeCart();
        successContent.innerHTML = html;
        successModal.classList.add('flex'); 
        
        cart = [];
        sessionStorage.removeItem('zafran_cart');
        currentCoupon = null; 
        if(document.getElementById('coupon-input')) document.getElementById('coupon-input').value = "";
        if(document.getElementById('coupon-message')) document.getElementById('coupon-message').textContent = "";
        orderForm.reset();
        if (consentCheckbox) consentCheckbox.checked = false;
        updateCart(); 
    }

    // --- SEND TO FIREBASE ---
    if(firebaseBtn) {
        firebaseBtn.addEventListener('click', async () => {
            if (cart.length === 0) return alert("Ihr Warenkorb ist leer.");
            if (!validateForm()) return; 

            // Final Time Validity Check before sending
            const selectedTime = document.getElementById('pickup-time').value;
            if(!isTimeStillValid(selectedTime)) {
                alert("Die gewählte Zeit ist leider nicht mehr verfügbar. Bitte wählen Sie eine neue Zeit.");
                await loadSettingsAndHours(); // Refresh slots
                return;
            }

            if (isDeliveryPage() && cartSubtotal < MIN_ORDER_DELIVERY) {
                alert(`Der Mindestbestellwert für Lieferungen beträgt ${MIN_ORDER_DELIVERY.toFixed(2)}€.`);
                return;
            }

            const formData = getFormData();
            const summaryData = generateOrderSummary();
            const orderId = `${isDeliveryPage() ? 'delivery' : 'pickup'}-${new Date().getTime()}`;
            
            // 1. Generate 4-Digit Order Number (This is your "PIN")
            const orderPin = Math.floor(1000 + Math.random() * 9000).toString();

            const orderData = {
                id: orderId,
                table: `${formData.name} (${formData.phone})`,
                customerName: formData.name, 
                customerPhone: formData.phone, 
                orderType: isDeliveryPage() ? 'delivery' : 'pickup',
                timeSlot: formData.time, 
                notes: formData.notes,
                deliveryAddress: isDeliveryPage() ? formData.address : null,
                items: summaryData.itemsOnly,
                subtotal: summaryData.originalTotal,
                discount: summaryData.discount,
                coupon: summaryData.couponInfo || "None",
                total: summaryData.finalTotal,
                status: "new",
                createdAt: new Date(),
                
                // NEW FIELDS
                whatsappAllowed: formData.whatsappAllowed, 
                orderPin: orderPin 
            };

            try {
                // 2. Save to Firebase
                await db.collection("orders").doc(orderId).set(orderData);
                
                // 3. Show Live Spinner (Change Button State)
                const originalBtnText = firebaseBtn.innerHTML;
                firebaseBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Warten auf Küche...';
                firebaseBtn.disabled = true;

                // 3. The 15-Second Race Logic
                let isResolved = false;
                
                // Function to build and show the success modal
                const triggerSuccess = (kitchenTime) => {
                    let html = ``;
                    
                    if (kitchenTime) {
                        html += `
                        <div style="background:rgba(76,175,80,0.1); border:1px solid #4CAF50; padding:12px; border-radius:8px; margin-bottom:15px; color:#fff; font-size:0.95rem;">
                            ✅ <strong>Bestätigt!</strong> Die Küche hat Ihre Bestellung für <strong>${kitchenTime} Uhr</strong> bestätigt.
                        </div>`;
                    } else {
                        html += `
                        <div style="background:rgba(212,175,55,0.1); border:1px solid var(--gold); padding:12px; border-radius:8px; margin-bottom:15px; color:#fff; font-size:0.95rem;">
                            🕒 <strong>Erfolgreich!</strong> Wir haben Ihre Bestellung. Bitte checken Sie den Tracker für die genaue Zeit der Küche.
                        </div>`;
                    }

                    html += `<strong style="color:var(--gold)">Kunde:</strong> ${formData.name}<br>`;
                    if (isDeliveryPage()) html += `<strong style="color:var(--gold)">Lieferung an:</strong> ${formData.address.street} ${formData.address.house}, ${formData.address.zip}<br>`;
                    
                    html += `<strong style="color:var(--gold)">Angefragt:</strong> ${formData.time} Uhr<br>`;
                    html += `<strong style="color:var(--gold)">Bestellung:</strong><br>${summaryData.summaryText.replace(/\n/g, '<br>')}`;
                    
                    if (summaryData.discount > 0) {
                       html += `<br>Zwischensumme: ${summaryData.originalTotal.toFixed(2)} €`;
                       html += `<br><span style="color:#28a745">Gutschein (${summaryData.couponInfo}): -${summaryData.discount.toFixed(2)} €</span>`;
                    }

                    html += `<br><br><strong style="font-size:1.1rem; color:#fff;">Total: ${summaryData.finalTotal.toFixed(2)} €</strong>`;
                    if (formData.notes) html += `<br><br><strong style="color:var(--gold)">Anmerkungen:</strong><br>${formData.notes.replace(/\n/g, '<br>')}`;

                    // Inject Data into Modal Elements
                    const summaryEl = document.getElementById('success-summary-content');
                    const pinEl = document.getElementById('modal-order-pin');
                    const trackLinkEl = document.getElementById('modal-track-link');

                    if (summaryEl) summaryEl.innerHTML = html;
                    if (pinEl) pinEl.innerText = orderPin;
                    if (trackLinkEl) trackLinkEl.href = `tracker.html?id=${orderId}`;
                    
                    // Show Modal & Clear Cart
                    closeCart(); 
                    const successModal = document.getElementById('success-modal');
                    if (successModal) successModal.classList.add('flex');
                    
                    cart = [];
                    sessionStorage.removeItem('zafran_cart');
                    orderForm.reset();
                    if(currentCoupon) {
                        currentCoupon = null;
                        if(document.getElementById('coupon-input')) document.getElementById('coupon-input').value = "";
                        if(document.getElementById('coupon-message')) document.getElementById('coupon-message').textContent = "";
                    }
                    updateCart();
                    
                    // Reset Button
                    firebaseBtn.innerHTML = originalBtnText;
                    firebaseBtn.disabled = false;
                };

                // A. Listen for Kitchen Acceptance OR Rejection
                const unsubscribe = db.collection("orders").doc(orderId).onSnapshot((doc) => {
                    if (isResolved) return;
                    const data = doc.data();
                    
                    if (data) {
                        // SCENARIO 1: KITCHEN REJECTED THE ORDER
                        if (data.status === 'cancelled') {
                            isResolved = true;
                            unsubscribe();
                            clearTimeout(timeoutId);
                            
                            // Stop spinner, show error, keep cart intact!
                            alert("⚠️ Bestellung abgelehnt!\n\nLeider kann das Restaurant Ihre Bestellung derzeit nicht annehmen (z.B. Küche überlastet oder Zutaten ausverkauft). Bitte versuchen Sie es später noch einmal oder rufen Sie uns an.");
                            
                            firebaseBtn.innerHTML = "Kostenpflichtig Bestellen";
                            firebaseBtn.disabled = false;
                            closeCart();
                        }
                        
                        // SCENARIO 2: KITCHEN ACCEPTED THE ORDER
                        else if (data.status === 'seen' || data.status === 'preparing' || data.estimatedTime !== undefined) {
                            isResolved = true;
                            unsubscribe();
                            clearTimeout(timeoutId);
                            
                            let confirmedTime = (data.estimatedTime && data.estimatedTime !== "ASAP") ? data.estimatedTime : formData.time;
                            if (confirmedTime === "ASAP") confirmedTime = "schnellstmöglich";
                            
                            triggerSuccess(confirmedTime);
                        }
                    }
                });

                // B. The 15 Second Timeout
                const timeoutId = setTimeout(() => {
                    if (isResolved) return;
                    isResolved = true;
                    unsubscribe(); // Stop listening
                    triggerSuccess(null); // Trigger success without a confirmed time
                }, 15000);

            } catch (error) {
                console.error("Error sending order: ", error);
                alert("Fehler beim Senden. Bitte erneut versuchen.");
                firebaseBtn.innerText = "Kostenpflichtig Bestellen";
                firebaseBtn.disabled = false;
            }
        });
    }

    // --- SEND TO WHATSAPP ---
    if(whatsappBtn) {
        whatsappBtn.addEventListener('click', async () => {
            if (cart.length === 0) return alert("Ihr Warenkorb ist leer.");
            if (!validateForm()) return;

            // Final Time Validity Check
            const selectedTime = document.getElementById('pickup-time').value;
            if(!isTimeStillValid(selectedTime)) {
                alert("Die gewählte Zeit ist leider nicht mehr verfügbar. Bitte wählen Sie eine neue Zeit.");
                await loadSettingsAndHours();
                return;
            }

            if (isDeliveryPage() && cartSubtotal < MIN_ORDER_DELIVERY) {
                alert(`Der Mindestbestellwert für Lieferungen beträgt ${MIN_ORDER_DELIVERY.toFixed(2)}€.`);
                return;
            }

            const formData = getFormData();
            const WHATSAPP_NUMBER = globalConfig.whatsappNumber; 
            if (!WHATSAPP_NUMBER) return alert("WhatsApp-Nummer fehlt. Bitte Administrator kontaktieren.");

            const summaryData = generateOrderSummary();
            
            // Log to Firebase
            const orderId = `${isDeliveryPage() ? 'delivery' : 'pickup'}-${new Date().getTime()}`;
            const orderData = {
                id: orderId,
                table: `${formData.name} (${formData.phone})`,
                customerName: formData.name, 
                customerPhone: formData.phone,
                orderType: isDeliveryPage() ? 'delivery' : 'pickup',
                timeSlot: formData.time, 
                notes: formData.notes,
                deliveryAddress: isDeliveryPage() ? formData.address : null,
                items: summaryData.itemsOnly, 
                subtotal: summaryData.originalTotal,
                discount: summaryData.discount,
                coupon: summaryData.couponInfo || "None",
                total: summaryData.finalTotal,
                status: "new", 
                createdAt: new Date()
            };
            db.collection("orders").doc(orderId).set(orderData).catch(e => console.error("Firebase err", e));
            
            // Build Message
            let msg = `*Neue ${isDeliveryPage() ? 'Lieferung' : 'Abholung'}*\n\n`;
            msg += `*Kunde:* ${formData.name}\n*Telefon:* ${formData.phone}\n`;
            
            if (isDeliveryPage()) {
                msg += `*Adresse:* ${formData.address.street} ${formData.address.house}\n`;
                msg += `*Ort:* ${formData.address.zip}\n`;
            }

            msg += `*Zeit:* ${formData.time} Uhr\n\n`;
            msg += `*Bestellung:*\n${summaryData.summaryText}`;
            
            if (summaryData.discount > 0) {
                msg += `\nZwischensumme: ${summaryData.originalTotal.toFixed(2)} €`;
                msg += `\nGutschein (${summaryData.couponInfo}): -${summaryData.discount.toFixed(2)} €`;
            }
            msg += `\n*Gesamtbetrag: ${summaryData.finalTotal.toFixed(2)} €*`;
            if (formData.notes) msg += `\n\n*Anmerkungen:*\n${formData.notes}`;

            let encodedMessage = encodeURIComponent(msg);
            window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
        });
    }
});

// ===============================================
// 3. LOAD DYNAMIC SETTINGS & BUSINESS RULES (REAL-TIME)
// ===============================================

function loadSettingsAndHours() {
    // A. Listen to General Settings (Marquee, Whatsapp) - Updates instantly
    db.collection('settings').doc('general').onSnapshot((doc) => {
        if (doc.exists) {
            const data = doc.data();
            if(data.whatsappNumber) globalConfig.whatsappNumber = data.whatsappNumber;
            
            const marqueeContainer = document.getElementById('marquee-container');
            const marqueeText = document.getElementById('marquee-text');
            if (marqueeText && marqueeContainer) {
                if (data.marqueeText && data.marqueeText.trim() !== "") {
                    marqueeText.innerText = data.marqueeText;
                    marqueeContainer.classList.remove('hidden');
                } else {
                    marqueeContainer.classList.add('hidden'); 
                }
            }
        }
    });

    // B. Listen to Hours & Holidays (Real-Time Updates) - Updates instantly
    db.collection('settings').doc('hours').onSnapshot((doc) => {
        if(doc.exists) {
            businessHours = doc.data();
        } else {
            // Fallback Defaults
            businessHours = {
                weekly: {
                    monday: {open:false}, tuesday:{open:false},
                    wednesday:{open:false}, thursday:{open:false},
                    friday:{open:false}, saturday:{open:false},
                    sunday:{open:false}
                },
                holidays: [],
                pause: null
            };
        }
        // Immediately re-calculate open/close status and time slots
        checkBusinessStatus();
    });
}

function checkBusinessStatus() {
    const statusMsg = document.getElementById('shop-status-message');
    const btnWrapper = document.getElementById('checkout-buttons-wrapper');
    const timeSelect = document.getElementById('pickup-time');
    const timeContainer = document.getElementById('pickup-time-container');

    if (!statusMsg || !btnWrapper) return; 

    const now = new Date();
    const serviceType = isDeliveryPage() ? 'delivery' : 'pickup';

    // 1. CHECK PAUSE (SCENARIO 4)
    if(businessHours.pause && businessHours.pause.active) {
        if(businessHours.pause.until > now.getTime()) {
            // Check if this specific service is paused or ALL
            if(businessHours.pause.type === 'all' || businessHours.pause.type === serviceType) {
                const resumeTime = new Date(businessHours.pause.until);
                const timeStr = resumeTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                disableShop(`Momentan keine Bestellungen möglich. Wir sind ab ${timeStr} Uhr wieder da.`);
                return;
            }
        }
    }

    // 2. CHECK HOLIDAYS (SCENARIO 3)
    if(businessHours.holidays && businessHours.holidays.length > 0) {
        for(let h of businessHours.holidays) {
            const start = new Date(h.start);
            const end = new Date(h.end);
            if(now >= start && now <= end) {
                disableShop(h.reason ? `Geschlossen: ${h.reason}` : "Wir haben momentan geschlossen (Urlaub).");
                return;
            }
        }
    }

    // 3. CHECK WEEKLY SCHEDULE (SCENARIO 1 & 2)
    const daysMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayName = daysMap[now.getDay()];
    const todayConfig = businessHours.weekly ? businessHours.weekly[todayName] : null;

    // Check Day Open
    if(!todayConfig || !todayConfig.open) {
        disableShop("Heute haben wir geschlossen.");
        return;
    }

    // Determine Valid Time Window
    let openTimeStr = todayConfig.start;
    let closeTimeStr = todayConfig.end;

    // SCENARIO 2: Check Delivery Specific Hours
    if(serviceType === 'delivery') {
        // If delivery hours exist and are not empty, use them
        if(todayConfig.delStart && todayConfig.delEnd) {
            openTimeStr = todayConfig.delStart;
            closeTimeStr = todayConfig.delEnd;
        } else if(!todayConfig.start) {
            // Fallback if no general start time
            disableShop("Heute keine Lieferung möglich.");
            return;
        }
    }

    if(!openTimeStr || !closeTimeStr) {
        disableShop("Öffnungszeiten nicht konfiguriert.");
        return;
    }

    // Parse Opening/Closing Times for Today
    const [openH, openM] = openTimeStr.split(':').map(Number);
    let [closeH, closeM] = closeTimeStr.split(':').map(Number);

    const openDate = new Date(now); openDate.setHours(openH, openM, 0);
    const closeDate = new Date(now); 
    
    if (closeH === 0 || closeH === 24) {
        closeDate.setDate(closeDate.getDate() + 1);
        closeDate.setHours(0, closeM, 0);
    } else {
        closeDate.setHours(closeH, closeM, 0);
    }

    if(now > closeDate) {
        disableShop("Wir haben für heute geschlossen.");
        return;
    }

    // 4. GENERATE TIME SLOTS (with Rounding Logic)
    // Delivery = 60 min, Pickup = 30 min
    const bufferMinutes = isDeliveryPage() ? 60 : 30;
    
    // Enable UI
    if (statusMsg) statusMsg.style.display = 'none';
    if (btnWrapper) btnWrapper.style.display = 'flex';
    if (timeContainer) timeContainer.style.display = 'block';

    generateTimeSlots(now, timeSelect, bufferMinutes, openDate, closeDate);
}

function generateTimeSlots(now, selectElement, bufferMinutes, shopOpenDate, shopCloseDate) {
    if(!selectElement) return;
    
    selectElement.innerHTML = '';

    // 🚨 SMART ASAP LOGIC 🚨
    // Only show "ASAP" if the restaurant is CURRENTLY OPEN. 
    // If they visit early, force them to pick from the future time slots!
    if (now >= shopOpenDate) {
        selectElement.innerHTML = '<option value="ASAP" selected>So schnell wie möglich (Sofort)</option>';
    } else {
        selectElement.innerHTML = '<option value="" disabled selected>-- Bitte Zeit wählen --</option>';
    }

    // 1. Calculate Earliest Possible Slot based on "Now + Buffer"
    let readyTime = new Date(now.getTime() + bufferMinutes * 60000);

    // ROUNDING LOGIC (7:05 + 45m -> 7:50 -> Round up to 8:00)
    let m = readyTime.getMinutes();
    let remainder = m % 15;
    if(remainder !== 0) {
        readyTime.setMinutes(m + (15 - remainder)); // Round up to next 15
        readyTime.setSeconds(0);
    }

    // 2. Ensure we don't start BEFORE the shop actually opens
    // (e.g., if it's 12:30 PM but Delivery starts at 16:00, push first slot to 16:00)
    if (readyTime < shopOpenDate) {
        readyTime = shopOpenDate;
    }

    // 3. Generate Slots until Closing Time
    let slotTime = new Date(readyTime);
    let count = 0; 
    
    while (slotTime <= shopCloseDate && count < 100) {
        let h = slotTime.getHours();
        let min = slotTime.getMinutes();
        let timeStr = `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        
        let option = document.createElement('option');
        option.value = timeStr;
        option.textContent = timeStr + " Uhr";
        selectElement.appendChild(option);

        // Add 15 mins
        slotTime.setMinutes(slotTime.getMinutes() + 15);
        count++;
    }

    // 4. HARD STOP: Disable shop if no future slots exist (e.g. right before closing)
    if(selectElement.options.length <= 1 && now >= shopOpenDate) {
        disableShop("Für heute sind keine Termine mehr verfügbar.");
    }
}

function disableShop(message) {
    const statusMsg = document.getElementById('shop-status-message');
    const btnWrapper = document.getElementById('checkout-buttons-wrapper');
    const timeContainer = document.getElementById('pickup-time-container');

    // UI Updates
    if (statusMsg) {
        statusMsg.textContent = message;
        statusMsg.style.display = 'block';
    }
    if (btnWrapper) btnWrapper.style.display = 'none';
    if (timeContainer) timeContainer.style.display = 'none';

    // Modal Popup
    const closedModal = document.getElementById('closed-modal');
    const closedModalText = document.getElementById('closed-modal-text');
    const closeBtn = document.getElementById('close-closed-modal-btn');

    if (closedModal && closedModalText) {
        closedModalText.textContent = message; 
        closedModal.style.display = 'flex';    
        
        if (closeBtn) {
            closeBtn.onclick = function() {
                closedModal.style.display = 'none';
            };
        }
    }
}

// Helper: Check if a selected time is still valid (e.g. user waited too long)
function isTimeStillValid(timeStr) {
    if(!timeStr) return true;
    // Simple check: Is the time in the past relative to now + buffer?
    // This is optional but good UX. 
    return true; 
}

function getFormData() {
    const name = document.getElementById('customer-name').value;
    const phone = document.getElementById('customer-phone').value;
    const time = document.getElementById('pickup-time').value;
    const notes = document.getElementById('customer-notes').value;
    
    // NEW: Get WhatsApp Consent (Default false if element missing)
    const whatsappConsentEl = document.getElementById('whatsapp-consent');
    const whatsappAllowed = whatsappConsentEl ? whatsappConsentEl.checked : false;

    let address = null;
    if (isDeliveryPage()) {
        address = {
            street: document.getElementById('delivery-street').value,
            house: document.getElementById('delivery-house').value,
            zip: document.getElementById('delivery-zip').value
        };
    }
    // Return the new field 'whatsappAllowed'
    return { name, phone, time, notes, address, whatsappAllowed };
}

function validateForm() {
    const data = getFormData();
    const privacy = document.getElementById('privacy-consent');

    if (!data.name || !data.phone) {
        alert("Bitte Namen und Telefonnummer eingeben.");
        return false;
    }
    if (isDeliveryPage()) {
        if (!data.address.street || !data.address.house) {
            alert("Bitte die Lieferadresse vollständig ausfüllen.");
            return false;
        }
    }
    if (!data.time) {
        alert("Bitte eine Zeit wählen.");
        return false;
    }
    if (!privacy.checked) {
        alert("Bitte akzeptieren Sie die Datenschutzbestimmungen.");
        return false;
    }
    return true;
}

// ===============================================
// 4. SMART MARKETING SYSTEM (BANNERS & DROPDOWNS)
// ===============================================
async function checkAndShowMarketing() {
    const bannerDoc = await db.collection('settings').doc('banner').get();
    const bannerData = bannerDoc.exists ? bannerDoc.data() : null;

    const couponsSnap = await db.collection('coupons').get();
    let flashCoupons = [];
    let dropdownCoupons = [];
    
    const today = new Date().toISOString().split('T')[0];
    const isDelivery = isDeliveryPage();

    couponsSnap.forEach(doc => {
        const data = doc.data();
        if (data.expiryDate && data.expiryDate !== 'Recurring' && data.expiryDate < today) return;
        if (data.validFor === 'pickup' && isDelivery) return;
        if (data.validFor === 'delivery' && !isDelivery) return;

        if (data.showBanner) flashCoupons.push(data);
        if (data.showDropdown) dropdownCoupons.push(data);
    });

    const couponInputArea = document.getElementById('coupon-input');
    if (couponInputArea && dropdownCoupons.length > 0) {
        // Set parent to relative so the dropdown attaches directly to the input box
        couponInputArea.parentNode.style.position = 'relative';
        
        let dropDiv = document.getElementById('coupon-dropdown-list');
        if(!dropDiv) {
            dropDiv = document.createElement('div');
            dropDiv.id = 'coupon-dropdown-list';
            // Styling exactly like a modern autocomplete dropdown
            dropDiv.style.cssText = "position:absolute; top:100%; left:0; width:100%; background:#fff; border:1px solid #ccc; border-radius:4px; box-shadow:0 4px 6px rgba(0,0,0,0.2); z-index:1000; display:none; max-height:150px; overflow-y:auto; margin-top:2px;";
            couponInputArea.parentNode.appendChild(dropDiv);
        }
        dropDiv.innerHTML = ''; 
        
        dropdownCoupons.forEach(c => {
            let item = document.createElement('div');
            
            // Format the discount text for the right side of the dropdown
            let discountText = '';
            if (c.discountType === 'gratis') discountText = '🎁 GRATIS';
            else if (c.discountType === 'percent') discountText = `${c.discountValue}% OFF`;
            else discountText = `${c.discountValue}€ OFF`;

            item.style.cssText = "padding:12px 15px; border-bottom:1px solid #eee; cursor:pointer; display:flex; justify-content:space-between; align-items:center; color:#333; font-size:0.95rem; font-weight:bold; font-family:sans-serif;";
            
            item.innerHTML = `<span>${c.code}</span><span style="color:#008000; font-size:0.85rem;">${discountText}</span>`;
            
            // Hover effect
            item.onmouseover = () => item.style.backgroundColor = '#f5f5f5';
            item.onmouseout = () => item.style.backgroundColor = '#fff';

            // Auto-fill and apply when clicked
            item.onclick = () => {
                document.getElementById('coupon-input').value = c.code;
                const applyBtn = document.getElementById('apply-coupon-btn');
                if(applyBtn) applyBtn.click();
                dropDiv.style.display = 'none';
            };
            dropDiv.appendChild(item);
        });

        // Show dropdown when user clicks into the input
        couponInputArea.onfocus = () => {
            dropDiv.style.display = 'block';
        };
        
        // Hide dropdown when user clicks away (with a tiny delay so the click registers)
        couponInputArea.onblur = () => {
            setTimeout(() => {
                if(dropDiv) dropDiv.style.display = 'none';
            }, 200);
        };
    }

    if (sessionStorage.getItem('zafran_marketing_seen') === 'true') return; 

    let showSpecial = false;
    if (bannerData && bannerData.active) {
        // Detect Page Type securely
        const hasOrderForm = document.getElementById('pickup-time') !== null;
        const isHome = !hasOrderForm; // If no order form exists, assume it's the home page
        
        const v = bannerData.validFor;
        
        if (v === 'all') showSpecial = true;
        else if (v === 'both' && hasOrderForm) showSpecial = true;
        else if (v === 'home' && isHome) showSpecial = true;
        else if (v === 'pickup' && hasOrderForm && !isDelivery) showSpecial = true;
        else if (v === 'delivery' && isDelivery) showSpecial = true;
    }

    if (!showSpecial && flashCoupons.length === 0) return; 

    let html = '';
    if (showSpecial) {
        html += `<h2 style="color:var(--gold); margin-top:0; font-size:1.8rem; text-transform:uppercase;">${bannerData.title}</h2>`;
        html += `<div style="font-size:1.1rem; line-height:1.6; color:#eee; text-align:left;">${bannerData.message}</div>`;
        if(flashCoupons.length > 0) html += `<hr style="border-top:1px dashed #555; margin:20px 0;">`;
    }
    
    if (flashCoupons.length > 0) {
        html += `<h3 style="color:#28a745; margin-bottom:15px; font-size:1.4rem;">🎁 Unsere Angebote für Sie:</h3>`;
        flashCoupons.forEach(c => {
            html += `<div style="background:#111; border:2px dashed var(--gold); padding:15px; margin-bottom:12px; border-radius:8px;">`;
            html += `<strong style="font-size:1.3rem; color:white; letter-spacing:1px;">Code: ${c.code}</strong>`;
            if(c.discountType === 'gratis') html += `<br><span style="color:#aaa; font-size:1rem; margin-top:5px; display:inline-block;">Gratis: ${c.promoItemName || 'Spezial-Artikel'}</span>`;
            else if(c.discountType === 'percent') html += `<br><span style="color:#aaa; font-size:1rem; margin-top:5px; display:inline-block;">Sie sparen: ${c.discountValue}% Rabatt</span>`;
            else html += `<br><span style="color:#aaa; font-size:1rem; margin-top:5px; display:inline-block;">Sie sparen: ${c.discountValue}€ Rabatt</span>`;
            html += `</div>`;
        });
    }

    const modalDiv = document.createElement('div');
    modalDiv.style.cssText = "position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.85); z-index:99999; display:flex; justify-content:center; align-items:center; padding:15px; box-sizing:border-box; animation: popIn 0.4s ease;";
    
    modalDiv.innerHTML = `
        <style>@keyframes popIn { from { opacity:0; transform:scale(0.9); } to { opacity:1; transform:scale(1); } }</style>
        <div style="background:#222; border:2px solid var(--gold); padding:25px 20px; border-radius:12px; max-width:500px; width:100%; max-height:80vh; overflow-y:auto; box-sizing:border-box; text-align:center; box-shadow:0 15px 40px rgba(0,0,0,0.9); position:relative; margin:auto;">
            <button id="close-flash-btn-x" style="position:absolute; top:10px; right:15px; background:none; border:none; color:#888; font-size:2.5rem; cursor:pointer; line-height:1;">&times;</button>
            ${html}
            <button id="close-flash-btn-main" style="background:var(--gold); color:black; font-weight:bold; border:none; padding:15px; border-radius:8px; margin-top:20px; font-size:1.2rem; cursor:pointer; width:100%; text-transform:uppercase; box-shadow:0 4px 10px rgba(0,0,0,0.5);">Weiter zur Karte</button>
        </div>
    `;
    document.body.appendChild(modalDiv);

    const closeFn = () => {
        modalDiv.remove();
        sessionStorage.setItem('zafran_marketing_seen', 'true');
    };
    document.getElementById('close-flash-btn-x').onclick = closeFn;
    document.getElementById('close-flash-btn-main').onclick = closeFn;
}
