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
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
};
