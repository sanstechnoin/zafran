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
let currentCoupon = null; 
let cartSubtotal = 0;     

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
    
    const subtotalAmountEl = document.getElementById('subtotal-amount'); 
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
    
    if (applyCouponBtn) {
        applyCouponBtn.addEventListener('click', handleApplyCoupon);
    }

    // --- Cart Open/Close Logic ---
    function openCart() {
        cartContentEl.style.display = 'block'; 
        // Ensure confirmation is hidden and reset
        orderConfirmationEl.style.display = 'none'; 
        orderConfirmationEl.classList.add('hidden'); 
        
        cartOverlay.classList.remove('hidden');
        updateCart(); 
        toggleCheckoutButtons();
    }
    function closeCart() { 
        cartOverlay.classList.add('hidden'); 
        setTimeout(() => {
            cartContentEl.style.display = 'block';
            orderConfirmationEl.style.display = 'none';
            orderConfirmationEl.classList.add('hidden');
        }, 300);
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
            } else {
                const data = doc.data();
                const today = new Date().toISOString().split('T')[0];

                if (data.expiryDate < today) {
                    msgEl.textContent = "Gutschein abgelaufen.";
                    msgEl.style.color = "red";
                    currentCoupon = null;
                } else {
                    currentCoupon = data;
                    msgEl.textContent = `Code gefunden. Prüfe...`;
                    msgEl.style.color = "#666";
                    codeInput.value = ""; 
                }
            }
            updateCart(); 
        } catch (error) {
            console.error("Coupon Error:", error);
            msgEl.textContent = "Fehler beim Prüfen.";
            msgEl.style.color = "red";
        }
    }

    function calculateFinalTotals() {
        let discountAmount = 0;
        let couponStatusMsg = "";
        let couponStatusColor = "";

        if (currentCoupon) {
            const minOrder = currentCoupon.minOrder || 0; 
            const isPercent = currentCoupon.discountType === 'percent';
            const value = currentCoupon.discountValue || 0;

            if (cartSubtotal < minOrder) {
                couponStatusMsg = `Gutschein "${currentCoupon.code}": Mindestbestellwert ${minOrder}€ nicht erreicht.`;
                couponStatusColor = "orange";
                discountAmount = 0; 
            } else {
                const isAll = currentCoupon.validCategories === 'all' || 
                              (Array.isArray(currentCoupon.validCategories) && currentCoupon.validCategories.includes('all'));

                let eligibleAmount = 0;

                if (isAll) {
                    eligibleAmount = cartSubtotal;
                } else {
                    cart.forEach(item => {
                        if (item.category && currentCoupon.validCategories.includes(item.category)) {
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

        const finalTotal = Math.max(0, cartSubtotal - discountAmount);
        return { discountAmount, finalTotal, couponStatusMsg, couponStatusColor };
    }

    // --- Update Cart Display ---
    function updateCart() {
        cartItemsContainer.innerHTML = "";
        let subtotal = 0;
        let itemCount = 0;

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

    // --- FIX: Show Confirmation Screen Logic ---
    function showConfirmationScreen(summary) {
        // Use <br> for HTML line breaks to ensure they render
        let htmlSummary = `<strong>Kunde:</strong> ${summary.customerName}<br><strong>Telefon:</strong> ${summary.customerPhone}<br><br><strong>Bestellung:</strong><br>${summary.summaryText.replace(/\n/g, '<br>')}`;
        
        if (summary.discount > 0) {
            htmlSummary += `<br>Zwischensumme: ${summary.originalTotal.toFixed(2)} €`;
            htmlSummary += `<br><span style="color:green">Gutschein (${summary.couponInfo}): -${summary.discount.toFixed(2)} €</span>`;
        }
        
        htmlSummary += `<br><br><strong style="font-size:1.1rem">Total: ${summary.finalTotal.toFixed(2)} €</strong>`;

        if (summary.customerNotes) {
            htmlSummary += `<br><br><strong>Anmerkungen:</strong><br>${summary.customerNotes.replace(/\n/g, '<br>')}`;
        }
        
        // Inject HTML
        confirmationSummaryEl.innerHTML = htmlSummary;
        
        // Hide Form, Show Confirmation
        cartContentEl.style.display = 'none'; 
        
        // FIX: Ensure 'hidden' class is removed so it actually shows up
        orderConfirmationEl.classList.remove('hidden'); 
        orderConfirmationEl.style.display = 'block'; 
        
        // Cleanup variables
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
            if (cart.length === 0) {
                alert("Ihr Warenkorb ist leer.");
                return;
            }

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
                
                subtotal: summaryData.originalTotal,
                discount: summaryData.discount,
                coupon: summaryData.couponInfo || "None",
                total: summaryData.finalTotal,
                
                status: "new",
                orderType: "pickup", 
                createdAt: new Date()
            };

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
                firebaseBtn.disabled = false;
                toggleCheckoutButtons();
            }
        });
    }

    // --- SEND TO WHATSAPP ---
    if(whatsappBtn) {
        whatsappBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert("Ihr Warenkorb ist leer.");
                return;
            }

            const customerName = document.getElementById('customer-name').value;
            const customerPhone = document.getElementById('customer-phone').value;
            const customerNotes = document.getElementById('customer-notes').value;
            
            if (!customerName || !customerPhone) { alert("Bitte geben Sie Namen und Telefonnummer ein."); return; }

            const summaryData = generateOrderSummary();

            const orderId = `pickup-${new Date().getTime()}`;
            const orderData = {
                id: orderId,
                table: `${customerName} (${customerPhone})`,
                customerName, customerPhone, notes: customerNotes,
                items: summaryData.itemsOnly, 
                
                subtotal: summaryData.originalTotal,
                discount: summaryData.discount,
                coupon: summaryData.couponInfo || "None",
                total: summaryData.finalTotal,
                
                status: "new", orderType: "pickup", createdAt: new Date()
            };
            db.collection("orders").doc(orderId).set(orderData).catch(e => console.error("Firebase err", e));
            
            const WHATSAPP_NUMBER = config.whatsappNumber;
            if (!WHATSAPP_NUMBER) { alert("WhatsApp-Nummer fehlt."); return; }

            let whatsappMessage = `*Neue Abholbestellung*\n\n*Kunde:* ${customerName}\n*Telefon:* ${customerPhone}\n\n*Bestellung:*\n${summaryData.summaryText}`;
            
            if (summaryData.discount > 0) {
                whatsappMessage += `\nZwischensumme: ${summaryData.originalTotal.toFixed(2)} €`;
                whatsappMessage += `\nGutschein (${summaryData.couponInfo}): -${summaryData.discount.toFixed(2)} €`;
            }
            
            whatsappMessage += `\n*Gesamtbetrag: ${summaryData.finalTotal.toFixed(2)} €*`;

            if (customerNotes) whatsappMessage += `\n\n*Anmerkungen:*\n${customerNotes}`;

            let encodedMessage = encodeURIComponent(whatsappMessage);
            window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
        });
    }
});
