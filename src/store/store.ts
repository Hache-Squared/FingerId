import { configureStore } from "@reduxjs/toolkit"; 

import { appThemeSlice } from "./profile/appThemeSlice";
import { securitySlice } from "./explore/securitySlice";
import authReducer from './auth/authSlice';

export const store = configureStore({
    reducer: { 
        
        auth: authReducer,
        appTheme: appThemeSlice.reducer, 
        security: securitySlice.reducer
    },
    // middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    //     serializableCheck: false
    // })
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;