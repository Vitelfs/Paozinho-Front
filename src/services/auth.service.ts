import { onAuthStateChanged, type User } from "firebase/auth";
import {
  auth,
  signInWithEmailAndPassword,
} from "../firebase/config/firebase.provider";
import type { LoginType } from "../types/login.type";

export const authService = {
  login: async (login: LoginType) => {
    try {
      const response = await signInWithEmailAndPassword(
        auth,
        login.email,
        login.password
      );

      const idToken = await response.user.getIdToken();

      localStorage.setItem("token", idToken);

      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  async logout() {
    await auth.signOut();
    localStorage.removeItem("token");
  },
  async getIdToken() {
    if (!auth.currentUser) throw new Error("Usuário não autenticado");
    return await auth.currentUser.getIdToken(false);
  },
  authStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }
};
