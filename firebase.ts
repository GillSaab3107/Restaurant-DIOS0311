import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB2KJ1MZrfMNfo3m0tS_73g6JEPzgGfehs",
  authDomain: "chai-culture-cafe.firebaseapp.com",
  projectId: "chai-culture-cafe",
  storageBucket: "chai-culture-cafe.appspot.com",
  messagingSenderId: "649284013124",
  appId: "1:649284013124:web:c159c37b6419d630964011"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);