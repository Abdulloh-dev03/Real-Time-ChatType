// src/store/chatSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { IUser } from "../../types";

interface ChatState {
  selectedUser: IUser | null;
}

const initialState: ChatState = {
  selectedUser: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setSelectedUser(state, action: PayloadAction<IUser | null>) {
      state.selectedUser = action.payload;
    },
    clearChatUser(state) {
      state.selectedUser = null;
    },
  },
});
export const { setSelectedUser, clearChatUser } = chatSlice.actions;
export default chatSlice.reducer;
