// src/features/auth/authSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { IUser } from "../../types";

export interface AuthState {
  user: IUser | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  step: "login" | "verify";
  mode: "signin" | "signup";
  error: string | null;
  tempEmail: string | null;
  loading: boolean;
  onlineUsers: IUser[];
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  status: "idle",
  step: "login",
  mode: "signup",
  tempEmail: null,
  onlineUsers: [],
};

// Duplicate removed

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
    setOnlineUsers(state, action) {
      state.onlineUsers = action.payload;
    },
    setStep(state, action: PayloadAction<"login" | "verify">) {
      state.step = action.payload;
    },
    setMode(state, action: PayloadAction<"signin" | "signup">) {
      state.mode = action.payload;
    },
    setUser(state, action: PayloadAction<IUser | null>) {
      state.user = action.payload;
    },
  },
});

export const { clearAuthError, setOnlineUsers, setStep, setMode, setUser } =
  authSlice.actions;
export default authSlice.reducer;
