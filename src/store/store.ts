import { configureStore } from "@reduxjs/toolkit";
import { backpackSlice, notebookSlice } from "./explore";
import { exploreSlice } from "./explore/exploreSlice";
import { permissionsSlice } from "./permissions";
import { appThemeSlice } from "./profile/appThemeSlice";


export const store = configureStore({
    reducer: {
        notebook: notebookSlice.reducer,
        backpack: backpackSlice.reducer,
        explore: exploreSlice.reducer,
        appTheme: appThemeSlice.reducer,
        permissions: permissionsSlice.reducer,
    },
    // middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    //     serializableCheck: false
    // })
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;