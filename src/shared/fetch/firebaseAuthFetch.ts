// src/shared/fetch/firebaseAuthFetch.ts
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { firebaseConfig } from '../config/firebaseConfig'; // tu configuración de Firebase

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export const firebaseAuthFetch = {
  async signIn(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user };
  },

  async signUp(email: string, password: string) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user };
  },

  async signOut() {
    await signOut(auth);
  },
};
