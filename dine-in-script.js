// --- 1. DYNAMIC MENU GENERATOR ---
function renderDynamicMenu() {
    const container = document.getElementById('dynamic-menu-container');
    if (!container) return; // Only run on pages that have the menu container

    let html = '';
    
    // Custom ID mapper to ensure your Top Navigation links still scroll perfectly!
    const getSectionId = (catName) => {
        if (catName.includes("Vegetarisch")) return "vegetarisches";
        if (catName.includes("Hähnchen")) return "chicken";
        if (catName.includes("Lamm")) return "lamm";
        if (catName.includes("Fisch") || catName.includes("Garnelen")) return "fisch-garnelen";
        if (catName.includes("Tandoori")) return "tandoori";
        if (catName.includes("Biryani")) return "biryani";
        if (catName.includes("Brot") || catName.includes("Beilagen")) return "brot"; 
        if (catName.includes("Salate") || catName.includes("Extras")) return "salate";
        if (catName.includes("Getränke")) return "getraenke";
        if (catName.includes("Dessert")) return "dessert";
        if (catName.includes("Kinder")) return "kinder";
        if (catName.includes("Vorspeisen")) return "vorspeisen";
        if (catName.includes("Suppen")) return "suppen";
        return catName.toLowerCase().replace(/\s+/g, '-').replace('ä','ae').replace('ö','oe').replace('ü','ue');
    };

    MENU_DATA.forEach(cat => {
        const sectionId = getSectionId(cat.category);
        
        html += `<section id="${sectionId}">`;
        html += `<h2>${cat.category}</h2>`;
        html += `<ul>`;

        cat.items.forEach(item => {
            const priceStr = item.price.toFixed(2).replace('.', ',');
            const descHtml = item.desc ? `<span class="description">${item.desc}</span>` : '';
            
            html += `
            <li>
                <span class="item"><strong>${item.id}. ${item.name} <sup></sup></strong>${descHtml}</span>
                <div class="price-action">
                    <span class="price">${priceStr} €</span>
                    <div class="quantity-controls hidden">
                        <button class="menu-btn-minus" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}" data-category="${sectionId}">-</button>
                        <span class="item-qty" data-id="${item.id}">1</span>
                    </div>
                    <button class="add-btn" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}" data-category="${sectionId}">+</button>
                </div>
            </li>`;
        });

        html += `</ul></section>`;
    });

    container.innerHTML = html;
}

// Execute the generator IMMEDIATELY so the HTML exists before the cart logic runs!
renderDynamicMenu();

// --- Global variables ---
let cart = [];
let tableNumber = 'Unknown'; 
let lastOrderId = null; 

document.addEventListener("DOMContentLoaded", async () => {
    
    // Get Table Number
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const table = urlParams.get('table');
        if (table) tableNumber = table;
    } catch (e) { console.error("Error getting table number", e); }
    
    // Update UI with Table Info
    const formboldTableTitleEl = document.getElementById('formbold-table-title');
    if(formboldTableTitleEl) formboldTableTitleEl.innerText = `Tisch ${tableNumber}`;
    const cartTitleEl = document.getElementById('cart-title');
    if(cartTitleEl) cartTitleEl.innerText = `Bestellung (Tisch ${tableNumber})`;
    const tableNumberInput = document.getElementById('table-number-input');
    if (tableNumberInput) tableNumberInput.value = tableNumber;

    // Config & Marquee
    let config = { marqueeLines: [] };
    try {
        const response = await fetch('config.json?v=24'); 
        config = await response.json();
    } catch (e) { console.warn("Config not loaded", e); }

    const marqueeContainer = document.getElementById('marquee-container');
    const marqueeText = document.getElementById('marquee-text');
    if (marqueeText && marqueeContainer && config.marqueeLines && config.marqueeLines.length > 0) {
        marqueeText.innerText = config.marqueeLines.join(" --- ");
        marqueeContainer.classList.remove('hidden');
    }

    // Header Offset
    const header = document.querySelector('header');
    const headerNav = document.querySelector('header nav');
    function updateScrollPadding() {
        if (header) {
            const headerHeight = header.offsetHeight;
            document.documentElement.style.setProperty('scroll-padding-top', `${headerHeight}px`);
            if (headerNav) {
                const navHeight = headerNav.offsetHeight;
                const topPartHeight = headerHeight - navHeight;
                headerNav.style.top = `${topPartHeight}px`;
            }
        }
    }
    updateScrollPadding();
    window.addEventListener('resize', updateScrollPadding);
    
    // Nav Scroll
    const navLinksContainer = document.getElementById('nav-links-container');
    const scrollLeftBtn = document.getElementById('scroll-left-btn');
    const scrollRightBtn = document.getElementById('scroll-right-btn');
    if (navLinksContainer) {
        const checkScroll = () => {
            const maxScroll = navLinksContainer.scrollWidth - navLinksContainer.clientWidth;
            if(scrollLeftBtn) scrollLeftBtn.classList.toggle('hidden', navLinksContainer.scrollLeft <= 0);
            if(scrollRightBtn) scrollRightBtn.classList.toggle('hidden', navLinksContainer.scrollLeft >= maxScroll - 1);
        };
        navLinksContainer.addEventListener('scroll', checkScroll);
        checkScroll();
        if(scrollLeftBtn) scrollLeftBtn.addEventListener('click', () => navLinksContainer.scrollBy({ left: -200, behavior: 'smooth' }));
        if(scrollRightBtn) scrollRightBtn.addEventListener('click', () => navLinksContainer.scrollBy({ left: 200, behavior: 'smooth' }));
    }

    // Elements
    const cartToggleBtn = document.getElementById('cart-toggle-btn');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartCloseBtn = document.getElementById('cart-close-btn');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartItemCountEl = document.getElementById('cart-item-count');
    const totalAmountEl = document.getElementById('total-amount');
    const cartContentEl = document.getElementById('cart-content');
    const orderForm = document.getElementById('order-form');
    const firebaseBtn = document.getElementById('firebase-btn');
    const callWaiterBtn = document.getElementById('btn-call-waiter'); // NEW BUTTON
    
    // Success Modal Elements
    const successModal = document.getElementById('success-modal');
    const successContent = document.getElementById('success-summary-content');
    const cancelContainer = document.getElementById('cancel-container');
    const cancelTimerText = document.getElementById('cancel-timer-text');
    const cancelOrderBtn = document.getElementById('cancel-order-btn');

    if (cartToggleBtn) cartToggleBtn.addEventListener('click', openCart);
    if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
    
    function openCart() {
        if(successModal) successModal.classList.remove('flex'); // Ensure success is closed
        cartContentEl.style.display = 'block';
        cartOverlay.classList.remove('hidden');
        updateCart();
    }
    function closeCart() { 
        cartOverlay.classList.add('hidden'); 
    }

    // Global Close for Success
    window.closeSuccessModal = function() {
        if(successModal) successModal.classList.remove('flex');
    };

    // --- NEW: CALL WAITER LOGIC ---
    if(callWaiterBtn) {
        callWaiterBtn.addEventListener('click', async () => {
            if(confirm("Möchten Sie den Kellner rufen?")) {
                callWaiterBtn.disabled = true;
                callWaiterBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Rufe...';
                
                try {
                    // Send special order type
                    await db.collection("orders").add({
                        table: tableNumber,
                        items: [{name: "⚠️ KELLNER RUF", quantity: 1, price: 0}],
                        total: 0,
                        status: "new",
                        createdAt: new Date(),
                        orderType: "assistance", // Key for KDS to trigger Bell
                        notes: "Gast bittet um Service am Tisch"
                    });

                    alert("Kellner wurde gerufen! Bitte warten Sie einen Moment.");
                    
                    // Cooldown
                    setTimeout(() => {
                        callWaiterBtn.disabled = false;
                        callWaiterBtn.innerHTML = '<i class="fa fa-bell"></i> Service';
                    }, 60000); // 1 minute cooldown

                } catch (e) {
                    console.error("Error calling waiter", e);
                    alert("Fehler beim Rufen. Bitte rufen Sie persönlich.");
                    callWaiterBtn.disabled = false;
                    callWaiterBtn.innerHTML = '<i class="fa fa-bell"></i> Service';
                }
            }
        });
    }

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
        addToCart(this.dataset.id, this.dataset.name, parseFloat(this.dataset.price), this.dataset.category);
    }
    function handleRemoveFromCartClick() {
        adjustQuantity(this.dataset.id, -1);
    }
    initItemControls(); 

    function addToCart(id, name, price, category) {
        const existingItem = cart.find(item => item.id === id);
        if (existingItem) existingItem.quantity++;
        else cart.push({ id, name, price, category, quantity: 1 });
        updateCart();
    }

    function updateCart() {
        cartItemsContainer.innerHTML = "";
        let total = 0;
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
            cartItemsContainer.innerHTML = "<p>Ihr Warenkorb ist leer.</p>";
        } else {
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
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
        
        totalAmountEl.innerText = `${total.toFixed(2)} €`;
        cartItemCountEl.innerText = itemCount;
        cartToggleBtn.classList.toggle('hidden', itemCount === 0);
        addCartItemControls(); 
    }

    function addCartItemControls() {
        document.querySelectorAll('#cart-items-container .cart-btn-plus').forEach(btn => {
            btn.addEventListener('click', () => adjustQuantity(btn.dataset.id, 1));
        });
        document.querySelectorAll('#cart-items-container .cart-btn-minus').forEach(btn => {
            btn.addEventListener('click', () => adjustQuantity(btn.dataset.id, -1));
        });
    }

    function adjustQuantity(id, amount) {
        const item = cart.find(item => item.id === id);
        if (!item) return;
        item.quantity += amount;
        if (item.quantity <= 0) cart = cart.filter(item => item.id !== id);
        updateCart();
    }

    function generateOrderData() {
        let itemsOnly = []; 
        let summaryText = ""; 
        let total = 0;
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            summaryText += `${item.quantity}x ${item.name}\n`; 
            
            itemsOnly.push({
                quantity: item.quantity,
                name: item.name,
                price: item.price
            });
        });
        return { total, itemsOnly, summaryText };
    }
    
    // --- SEND TO KITCHEN ---
    firebaseBtn.addEventListener('click', async (e) => {
        e.preventDefault(); 
        if(cart.length === 0) return alert("Warenkorb ist leer.");

        firebaseBtn.innerText = "Senden...";
        firebaseBtn.disabled = true;

        const { itemsOnly, total, summaryText } = generateOrderData();
        const orderId = `${tableNumber}-${new Date().getTime()}`;
        lastOrderId = orderId; 
        
        const customerNotes = document.getElementById('dine-in-notes').value;

        const orderData = {
            id: orderId,
            table: tableNumber,
            items: itemsOnly,
            total: total,
            status: "new",
            createdAt: new Date(),
            orderType: "dine-in",
            notes: customerNotes || null 
        };

        try {
            await db.collection("orders").doc(orderId).set(orderData);
            showConfirmationScreen(summaryText, customerNotes);
        } catch (error) {
            console.error("Error sending order to Firebase: ", error);
            alert("Fehler beim Senden.");
        } finally {
            firebaseBtn.innerText = "An Küche senden (Live)";
            firebaseBtn.disabled = false;
        }
    });

    // --- DISPLAY SUCCESS MODAL ---
    function showConfirmationScreen(summaryText, notes) {
        let html = `<strong style="color:var(--gold)">Tisch:</strong> ${tableNumber}<br><br>
                    <strong style="color:var(--gold)">Bestellung:</strong><br>${summaryText.replace(/\n/g, '<br>')}`;
        
        if (notes && notes.trim() !== "") {
            html += `<br><br><strong style="color:var(--gold)">Notiz:</strong><br>${notes.replace(/\n/g, '<br>')}`;
        }
        
        // 1. Close Cart
        closeCart();

        // 2. Inject Content
        successContent.innerHTML = html;

        // 3. Show Modal
        successModal.classList.add('flex');

        // 4. Setup Cancellation Logic
        if (cancelContainer) {
            cancelContainer.style.display = 'block';
            let secondsLeft = 15; // 15 Seconds Timer
            
            if (window.cancelTimer) clearInterval(window.cancelTimer);

            cancelTimerText.innerText = `Stornierung möglich in ${secondsLeft} Sek.`;
            cancelOrderBtn.disabled = false;
            cancelOrderBtn.innerText = "Bestellung stornieren"; 

            window.cancelTimer = setInterval(() => {
                secondsLeft--;
                cancelTimerText.innerText = `Stornierung möglich in ${secondsLeft} Sek.`;
                
                if (secondsLeft <= 0) {
                    clearInterval(window.cancelTimer);
                    cancelContainer.style.display = 'none'; 
                }
            }, 1000);

            // Cancel Action
            cancelOrderBtn.onclick = async () => {
                if (lastOrderId) {
                    cancelOrderBtn.disabled = true;
                    cancelOrderBtn.innerText = "Wird storniert...";
                    try {
                        await db.collection("orders").doc(lastOrderId).delete();
                        clearInterval(window.cancelTimer); 
                        successContent.innerHTML = `<span style="color:#d4edda">Bestellung wurde storniert.</span>`;
                        cancelContainer.style.display = 'none';
                    } catch (e) {
                        console.error("Error cancelling order:", e);
                        cancelOrderBtn.innerText = "Fehler!";
                        cancelOrderBtn.disabled = false;
                    }
                }
            };
        }

        // 5. Reset Cart
        cart = [];
        orderForm.reset();
        if(document.getElementById('dine-in-notes')) document.getElementById('dine-in-notes').value = ''; 
        updateCart();
    }
});
