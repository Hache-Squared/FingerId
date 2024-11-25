import { configureStore } from "@reduxjs/toolkit"; 

import { appThemeSlice } from "./profile/appThemeSlice";
import { securitySlice } from "./explore/securitySlice";


export const store = configureStore({
    reducer: { 
        
        appTheme: appThemeSlice.reducer, 
        security: securitySlice.reducer
    },
    // middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    //     serializableCheck: false
    // })
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;