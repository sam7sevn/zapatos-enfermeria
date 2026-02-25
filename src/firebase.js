import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCsgkoa4dXucwfj3yMnxkkksoAI4zP2rM",
  authDomain: "zapatos-de-enfermeria.firebaseapp.com",
  projectId: "zapatos-de-enfermeria",
  storageBucket: "zapatos-de-enfermeria.firebasestorage.app",
  messagingSenderId: "494571053687",
  appId: "1:494571053687:web:fabfb69368d6d21ce65c72"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
