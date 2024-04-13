import { type PayloadAction, createSlice } from "@reduxjs/toolkit";

interface UserState {
  name: string | null;
  email: string | null;
  userId: number | null;
  accessToken: string | null;
}
const initialState: UserState = {
  name: null,
  email: null,
  userId: null,
  accessToken: null,
};

export interface userDataPayload {
  email: string;
  name: string;
  userId: number;
}
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    resetUserSlice(state) {
      (state.email = null),
        (state.name = null),
        (state.userId = null),
        (state.accessToken = null);
    },
    addUserData(state, action: PayloadAction<userDataPayload>) {
      (state.email = action.payload.email),
        (state.name = action.payload.name),
        (state.userId = action.payload.userId);
    },
    addAccessToken(state, action: PayloadAction<{ accessToken: string }>) {
      state.accessToken = action.payload.accessToken;
    },
  },
});

export const { resetUserSlice, addUserData, addAccessToken } =
  userSlice.actions;

export default userSlice.reducer;
