// firebase-config.js
const firebaseConfig = {
    apiKey: "AIzaSyAVh2kVIuFcrt8Dg88emuEd9CQlqjJxDrA",
    authDomain: "zaffran-delight.firebaseapp.com",
    projectId: "zaffran-delight",
    storageBucket: "zaffran-delight.firebasestorage.app",
    messagingSenderId: "1022960860126",
    appId: "1:1022960860126:web:1e06693dea1d0247a0bb4f"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
