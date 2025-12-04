import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDB3UMkpxhUzBMb_L6i5FYlwl99GBpeJdQ",
  authDomain: "aniyume-c021d.firebaseapp.com",
  projectId: "aniyume-c021d",
  appId: "1:249815489830:web:56ac8720eb8c3db3f975e7",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
