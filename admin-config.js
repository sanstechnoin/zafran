// ==========================================
// SHARED ADMIN CONFIGURATION
// ==========================================

// --- EMAILJS CONFIG FOR CP-ADMIN ---
const CP_EMAIL_PUBLIC_KEY = "T020QG7Dq2gI1E_8J"; 
const CP_EMAIL_SERVICE_ID = "service_6xem24i";
const CP_EMAIL_ACCEPT_ID = "template_7jigzrn"; 
const CP_EMAIL_REJECT_ID = "template_eokntj3";

// --- EMAILJS CONFIG FOR ADMIN-ZAFRAN (Reservations) ---
const RES_EMAIL_PUBLIC_KEY = "fpg7eAy2ugtnzqoqU"; 
const RES_EMAIL_SERVICE_ID = "service_p890pdo"; 
const RES_EMAIL_TEMPLATE_ID = "zafran-res";
const RES_EMAIL_REJECT_ID = "zafran-rej";

// Initialize EmailJS based on which page is loading
(function(){
    if (typeof emailjs !== 'undefined') {
        // If we are on cp-admin, use CP keys. If on admin-zafran, use RES keys.
        if (document.title.includes("Master")) {
            emailjs.init(CP_EMAIL_PUBLIC_KEY);
        } else {
            emailjs.init(RES_EMAIL_PUBLIC_KEY);
        }
    }
})();
