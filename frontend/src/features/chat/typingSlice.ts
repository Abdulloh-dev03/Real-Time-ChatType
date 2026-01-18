import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface TypingState {
  typingUsers: Record<string, string> // userId -> contactId they're typing to
  usersTypingToMe: Record<string, string> // contactId -> userId who is typing to me
}

const initialState: TypingState = {
  typingUsers: {},
  usersTypingToMe: {},
}

const typingSlice = createSlice({
  name: "typing",
  initialState,
  reducers: {
    setUserTyping: (state, action: PayloadAction<{ userId: string; contactId: string }>) => {
      const { userId, contactId } = action.payload
      state.typingUsers[userId] = contactId
      state.usersTypingToMe[contactId] = userId
    },
    setUserStoppedTyping: (state, action: PayloadAction<{ userId: string; contactId: string }>) => {
      const { userId, contactId } = action.payload
      delete state.typingUsers[userId]
      delete state.usersTypingToMe[contactId]
    },
    clearAllTyping: (state) => {
      state.typingUsers = {}
      state.usersTypingToMe = {}
    },
  },
})

export const { setUserTyping, setUserStoppedTyping, clearAllTyping } = typingSlice.actions
export default typingSlice.reducer
