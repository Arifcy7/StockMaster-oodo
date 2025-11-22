// Firebase configuration
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyADzGE45IbxoX3SJaNTmpNmHV9_BIuf5vI",
  authDomain: "shopping-app-5779c.firebaseapp.com",
  projectId: "shopping-app-5779c",
  storageBucket: "shopping-app-5779c.firebasestorage.app",
  messagingSenderId: "304259006496",
  appId: "1:304259006496:web:3855d5994725a25df83c45",
  measurementId: "G-CRJ5NFE43C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { auth, analytics };
export default app;