import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserProps {
  uid: string;
  email: string;
}

interface AuthState {
  user: UserProps | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginUser: (state, action: PayloadAction<UserProps>) => {
      state.user = action.payload;
      state.error = null;
    },
    logoutUser: (state) => {
      state.user = null;
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { loginUser, logoutUser, setAuthLoading, setAuthError } = authSlice.actions;
export default authSlice.reducer;
