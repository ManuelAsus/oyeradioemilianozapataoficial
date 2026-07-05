// services/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD6CUhvHeKmHcJPZIk-9UcH_-TbGMdkmRI",
  authDomain: "oyelaradio-1389e.firebaseapp.com",
  projectId: "oyelaradio-1389e",
  storageBucket: "oyelaradio-1389e.firebasestorage.app",
  messagingSenderId: "627504741830",
  appId: "1:627504741830:web:1f33030b60b54a612ac6c7",
  measurementId: "G-HYRW2YP3XC"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };