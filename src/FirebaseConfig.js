import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCnzJNwBZ5BjRM8le2fIlqZdgH8DyBZ8w4",
  authDomain: "lingify-74a52.firebaseapp.com",
  projectId: "lingify-74a52",
  storageBucket: "lingify-74a52.appspot.com",
  messagingSenderId: "159650598657",
  appId: "1:159650598657:web:95ade1490f18affb4cd500",
  measurementId: "G-QW2YLPTX5Q"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Błąd ustawiania persistence w Firebase:", error);
});

export { app, auth as FIREBASE_AUTH, db as FIRESTORE_DB, storage as FIREBASE_STORAGE };
