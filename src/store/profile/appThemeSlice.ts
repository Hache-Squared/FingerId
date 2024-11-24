import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThemeState } from "../../types";
import { lightColorsTheme } from "../../shared/utils";


const initialState: AppThemeState = {
    colors: lightColorsTheme,
    theme: 'light',
}

export const appThemeSlice = createSlice({
    name: "appTheme",
    initialState: initialState,
    reducers: {
        onChangeTheme: (state, action) => {
            state.colors = {...action.payload.colors}
            state.theme = action.payload.theme
        }
    }
});

export const { onChangeTheme } = appThemeSlice.actions;