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
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// --- GLOBAL STATE ---
let cart = [];
let currentCoupon = null; // Stores currently applied coupon data
let cartSubtotal = 0;     // Stores total before discount

document.addEventListener("DOMContentLoaded", async () => {
    
    // --- Load Config ---
    let config = { marqueeLines: [], whatsappNumber: "" };
    try {
        const response = await fetch('config.json?v=24'); 
        config = await response.json();
    } catch (e) { console.warn("Config load failed", e); }

    // --- Marquee Setup ---
    const marqueeContainer = document.getElementById('marquee-container');
    const marqueeText = document.getElementById('marquee-text');
    if (marqueeText && marqueeContainer && config.marqueeLines && config.marqueeLines.length > 0) {
        marqueeText.innerText = config.marqueeLines.join(" --- ");
        marqueeContainer.classList.remove('hidden');
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
    
    const subtotalAmountEl = document.getElementById('subtotal-amount'); // (Optional element in HTML)
    const totalAmountEl = document.getElementById('total-amount');
    
    const cartContentEl = document.getElementById('cart-content');
    const orderConfirmationEl = document.getElementById('order-confirmation');
    const confirmationSummaryEl = document.getElementById('confirmation-summary');
    const confirmationCloseBtn = document.getElementById('confirmation-close-btn');
    const orderForm = document.getElementById('order-form');
    const whatsappBtn = document.getElementById('whatsapp-btn');
    const firebaseBtn = document.getElementById('firebase-btn');
    const consentCheckbox = document.getElementById('privacy-consent');
    const applyCouponBtn = document.getElementById('apply-coupon-btn');

    // --- Event Listeners ---
    if (cartToggleBtn) cartToggleBtn.addEventListener('click', openCart);
    if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
    if (confirmationCloseBtn) confirmationCloseBtn.addEventListener('click', closeCart);
    
    // Coupon Button Listener
    if (applyCouponBtn) {
        applyCouponBtn.addEventListener('click', handleApplyCoupon);
    }

    // --- Cart Open/Close Logic ---
    function openCart() {
        cartContentEl.style.display = 'block'; 
        orderConfirmationEl.style.display = 'none'; 
        cartOverlay.classList.remove('hidden');
        updateCart(); // Ensure display is fresh
        toggleCheckoutButtons();
    }
    function closeCart() { 
        cartOverlay.classList.add('hidden'); 
        setTimeout(() => {
            cartContentEl.style.display = 'block';
            orderConfirmationEl.style.display = 'none';
        }, 500);
    }

    function toggleCheckoutButtons() {
        if (consentCheckbox) {
            const isChecked = consentCheckbox.checked;
            if (whatsappBtn) whatsappBtn.disabled = !isChecked;
            if (firebaseBtn) firebaseBtn.disabled = !isChecked; 
        }
    }
    if (consentCheckbox) consentCheckbox.addEventListener('change', toggleCheckoutButtons);
    toggleCheckoutButtons(); 

    // --- Item Controls (Add/Remove from Menu) ---
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
    
    // UPDATED: Now captures 'category' data from the button attributes
    function handleAddToCartClick() {
        addToCart(
            this.dataset.id, 
            this.dataset.name, 
            parseFloat(this.dataset.price),
            this.dataset.category // Needs to be present in HTML: data-category="suppen" etc.
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
            // Default category to "unknown" if missing, to prevent errors
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
            } else {
                const data = doc.data();
                const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

                if (data.expiryDate < today) {
                    msgEl.textContent = "Gutschein abgelaufen.";
                    msgEl.style.color = "red";
                    currentCoupon = null;
                } else {
                    currentCoupon = data;
                    msgEl.textContent = `Gutschein "${data.code}" (${data.discountPercent}%) aktiviert!`;
                    msgEl.style.color = "green";
                    codeInput.value = ""; // Clear input field on success
                }
            }
            updateCart(); // Recalculate totals immediately
        } catch (error) {
            console.error("Coupon Error:", error);
            msgEl.textContent = "Fehler beim Prüfen.";
            msgEl.style.color = "red";
        }
    }

    // Helper to calculate financials based on cart state + coupon
    function calculateFinalTotals() {
        let discountAmount = 0;
        
        if (currentCoupon) {
            // Check if coupon applies to ALL categories or specific ones
            // 'all' might be stored as string "all" or an array ["all"] depending on admin input
            const isAll = currentCoupon.validCategories === 'all' || 
                          (Array.isArray(currentCoupon.validCategories) && currentCoupon.validCategories.includes('all'));

            if (isAll) {
                discountAmount = (cartSubtotal * currentCoupon.discountPercent) / 100;
            } else {
                // Calculate discount only for eligible items
                let eligibleTotal = 0;
                cart.forEach(item => {
                    // Check if item category matches one of the coupon's valid categories
                    if (item.category && currentCoupon.validCategories.includes(item.category)) {
                        eligibleTotal += (item.price * item.quantity);
                    }
                });
                discountAmount = (eligibleTotal * currentCoupon.discountPercent) / 100;
            }
        }

        const finalTotal = Math.max(0, cartSubtotal - discountAmount);
        return { discountAmount, finalTotal };
    }

    // --- Update Cart Display ---
    function updateCart() {
        cartItemsContainer.innerHTML = "";
        let subtotal = 0;
        let itemCount = 0;

        // 1. Sync visual counters in the menu list
        document.querySelectorAll('.item-qty').forEach(qtyEl => {
            const item = cart.find(i => i.id === qtyEl.dataset.id);
            const controlsDiv = qtyEl.closest('.quantity-controls');
            if (item) {
                qtyEl.innerText = item.quantity;
                controlsDiv.classList.remove('hidden');
            } else {
                qtyEl.innerText = '1'; 
                controlsDiv.classList.add('hidden');
            }
        });

        // 2. Build Cart HTML Items
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = "<p>Ihre Bestellung ist leer.</p>";
        } else {
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                subtotal += itemTotal;
                itemCount += item.quantity;
                const itemEl = document.createElement('div');
                itemEl.classList.add('cart-item');
                itemEl.innerHTML = `
                    <span class="cart-item-name">${item.name}</span>
                    <div class="cart-item-controls">
                        <button class="cart-btn-minus" data-id="${item.id}">-</button>
                        <span>${item.quantity}</span>
                        <button class="cart-btn-plus" data-id="${item.id}">+</button>
                    </div>
                    <span class="cart-item-price">${itemTotal.toFixed(2)} €</span>
                `;
                cartItemsContainer.appendChild(itemEl);
            });
        }

        // 3. Update Financials
        cartSubtotal = subtotal; 
        
        // Update Subtotal UI if element exists
        if(subtotalAmountEl) {
            subtotalAmountEl.innerText = `${subtotal.toFixed(2)} €`;
        }

        // Calculate Discount & Final Total
        const { discountAmount, finalTotal } = calculateFinalTotals();

        // Update Total UI
        if(totalAmountEl) {
            totalAmountEl.innerText = `${finalTotal.toFixed(2)} €`;
        }
        
        // Update Coupon Message text specifically for the amount
        const msgEl = document.getElementById('coupon-message');
        if(currentCoupon && msgEl && !msgEl.textContent.includes("Ungültig") && !msgEl.textContent.includes("Fehler")) {
             msgEl.textContent = `Gutschein "${currentCoupon.code}" (${currentCoupon.discountPercent}%) angewendet: -${discountAmount.toFixed(2)} €`;
             msgEl.style.color = "green";
        } else if (!currentCoupon && msgEl) {
             msgEl.textContent = ""; // Clear if no coupon
        }

        // 4. Update Badge count
        cartItemCountEl.innerText = itemCount;
        cartToggleBtn.classList.toggle('hidden', itemCount === 0);
        
        // Re-attach event listeners for cart +/- buttons
        addCartItemControls();
    }

    function addCartItemControls() {
        document.querySelectorAll('.cart-btn-plus').forEach(btn => {
            btn.addEventListener('click', () => adjustQuantity(btn.dataset.id, 1));
        });
        document.querySelectorAll('.cart-btn-minus').forEach(btn => {
            btn.addEventListener('click', () => adjustQuantity(btn.dataset.id, -1));
        });
    }
    
    // --- Helper: Generate Summary Data Object ---
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

        // Recalculate totals one last time for safety
        const { discountAmount, finalTotal } = calculateFinalTotals();

        return { 
            summaryText, 
            itemsOnly, 
            originalTotal: cartSubtotal,
            discount: discountAmount,
            finalTotal: finalTotal,
            couponCode: currentCoupon ? currentCoupon.code : null,
            couponPercent: currentCoupon ? currentCoupon.discountPercent : 0
        };
    }

    // --- Confirmation Screen Display ---
    function showConfirmationScreen(summary) {
        let finalSummaryText = `Kunde: ${summary.customerName}\nTelefon: ${summary.customerPhone}\n\n${summary.summaryText}`;
        
        if (summary.discount > 0) {
            finalSummaryText += `\nZwischensumme: ${summary.originalTotal.toFixed(2)} €`;
            finalSummaryText += `\nGutschein (${summary.couponCode}): -${summary.discount.toFixed(2)} €`;
        }
        
        finalSummaryText += `\nTotal: ${summary.finalTotal.toFixed(2)} €`;

        if (summary.customerNotes) {
            finalSummaryText += `\n\nAnmerkungen:\n${summary.customerNotes}`;
        }
        
        confirmationSummaryEl.innerText = finalSummaryText;
        cartContentEl.style.display = 'none'; 
        orderConfirmationEl.style.display = 'block'; 
        
        // Reset Cart & Form after successful submission
        cart = [];
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
            const customerName = document.getElementById('customer-name').value;
            const customerPhone = document.getElementById('customer-phone').value;
            const customerNotes = document.getElementById('customer-notes').value;
            
            if (!customerName || !customerPhone) {
                alert("Bitte geben Sie Namen und Telefonnummer ein.");
                return; 
            }

            const summaryData = generateOrderSummary();

            const orderId = `pickup-${new Date().getTime()}`;
            const billingIdentifier = `${customerName} (${customerPhone})`; 
            
            const orderData = {
                id: orderId,
                table: billingIdentifier,
                customerName: customerName,
                customerPhone: customerPhone, 
                notes: customerNotes || null, 
                items: summaryData.itemsOnly,
                
                // Financials stored for Admin Records
                subtotal: summaryData.originalTotal,
                discount: summaryData.discount,
                coupon: summaryData.couponCode || "None",
                total: summaryData.finalTotal, // Used as main revenue field
                
                status: "new",
                orderType: "pickup", 
                createdAt: new Date()
            };

            // Prepare local summary for display
            const screenSummary = { 
                ...summaryData, 
                customerName, 
                customerPhone, 
                customerNotes 
            };

            firebaseBtn.innerText = "Senden...";
            firebaseBtn.disabled = true;

            try {
                await db.collection("orders").doc(orderId).set(orderData);
                showConfirmationScreen(screenSummary);
            } catch (error) {
                console.error("Error sending order: ", error);
                alert("Fehler beim Senden. Bitte erneut versuchen.");
            } finally {
                firebaseBtn.innerText = "An Küche senden (Live)";
                toggleCheckoutButtons();
            }
        });
    }

    // --- SEND TO WHATSAPP ---
    if(whatsappBtn) {
        whatsappBtn.addEventListener('click', () => {
            const customerName = document.getElementById('customer-name').value;
            const customerPhone = document.getElementById('customer-phone').value;
            const customerNotes = document.getElementById('customer-notes').value;
            
            if (!customerName || !customerPhone) { alert("Bitte geben Sie Namen und Telefonnummer ein."); return; }

            const summaryData = generateOrderSummary();

            // Store in Firebase as backup even for WhatsApp orders
            const orderId = `pickup-${new Date().getTime()}`;
            const orderData = {
                id: orderId,
                table: `${customerName} (${customerPhone})`,
                customerName, customerPhone, notes: customerNotes,
                items: summaryData.itemsOnly, 
                
                subtotal: summaryData.originalTotal,
                discount: summaryData.discount,
                coupon: summaryData.couponCode || "None",
                total: summaryData.finalTotal,
                
                status: "new", orderType: "pickup", createdAt: new Date()
            };
            db.collection("orders").doc(orderId).set(orderData).catch(e => console.error("Firebase err", e));
            
            const WHATSAPP_NUMBER = config.whatsappNumber;
            if (!WHATSAPP_NUMBER) { alert("WhatsApp-Nummer fehlt."); return; }

            // Construct WhatsApp Message
            let whatsappMessage = `*Neue Abholbestellung*\n\n*Kunde:* ${customerName}\n*Telefon:* ${customerPhone}\n\n*Bestellung:*\n${summaryData.summaryText}`;
            
            if (summaryData.discount > 0) {
                whatsappMessage += `\nZwischensumme: ${summaryData.originalTotal.toFixed(2)} €`;
                whatsappMessage += `\nGutschein (${summaryData.couponCode}): -${summaryData.discount.toFixed(2)} €`;
            }
            
            whatsappMessage += `\n*Gesamtbetrag: ${summaryData.finalTotal.toFixed(2)} €*`;

            if (customerNotes) whatsappMessage += `\n\n*Anmerkungen:*\n${customerNotes}`;

            let encodedMessage = encodeURIComponent(whatsappMessage);
            window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
        });
    }
});
