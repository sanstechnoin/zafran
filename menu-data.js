// menu-data.js - DYNAMIC CLOUD SOURCE OF TRUTH

let MENU_DATA = [];
let MENU_ITEMS = [];

db.collection('settings').doc('menu').onSnapshot((doc) => {
    if (doc.exists) {
        const rawData = doc.data().menuData || [];

        // 1. Filter out deactivated categories and items so the customer never sees them
        MENU_DATA = rawData
            .filter(cat => cat.active !== false) // Keep only active categories
            .map(cat => ({
                ...cat,
                items: cat.items.filter(item => item.active !== false) // Keep only active items
            }));

        // 2. Re-flatten the list for quick ID lookups (Cart, Kitchen, Driver)
        MENU_ITEMS = MENU_DATA.flatMap(cat => cat.items);

        // 3. Automatically rebuild the HTML menu on the screen the second data changes!
        if (typeof renderDynamicMenu === 'function') {
            renderDynamicMenu();
        }
    }
});
