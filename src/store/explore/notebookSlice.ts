import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CurrentSheetShowing, InitNotebookState, NotebookState, SheetContent, SheetItem } from "../../types";
import { currentSheetShowingExample } from "../../data/fixtures";


const initialState: NotebookState = {
    id: '',
    title: '',
    currentSheetShowing: null,
    menuSheetItemList: [],
    isLoadingNotebook: true,
    currentSheetContentList: currentSheetShowingExample
};

export const notebookSlice = createSlice({
    name: "notebook",
    initialState: initialState,
    reducers: {
        onLoadSheet: (state, action: PayloadAction<CurrentSheetShowing>) => {
            state.currentSheetShowing = {
                ...action.payload
            };
        },
        onAddContentToSheet: (state, action: PayloadAction<SheetContent>) => {
            if(state.currentSheetShowing){
                state.currentSheetShowing = {
                    ...state.currentSheetShowing,
                    content: [
                       ...state.currentSheetShowing.content,
                        {...action.payload}
                    ]
                };
            }
        },
        onLoadNotebook: (state, action: PayloadAction<InitNotebookState>) => {
            state.id = action.payload.id;
            state.title = action.payload.title;
            state.menuSheetItemList = [ ...action.payload.menuSheetItemList ];
        },
        onAddMenuSheetItemList: (state, action: PayloadAction<SheetItem>) => {
            state.menuSheetItemList = [ ...state.menuSheetItemList, action.payload ];
        },
        onAddSheetContentListItem: (state, action: PayloadAction<CurrentSheetShowing>) => {
            state.currentSheetContentList = [ ...state.currentSheetContentList, action.payload ];
        },
        onResetNotebookState: (state) => {
            state.id =  '';
            state.title =  '';
            state.currentSheetShowing =  null;
            state.menuSheetItemList =  [];
        },
        onLoadingNotebook: (state) => {
            state.isLoadingNotebook = true;
        },
        onFinishedLoadingNotebook: (state) => {
            state.isLoadingNotebook = false;
        },

    }
});

export const { onLoadSheet, onLoadNotebook,onAddContentToSheet, onAddSheetContentListItem, onResetNotebookState, onFinishedLoadingNotebook, onLoadingNotebook, onAddMenuSheetItemList } = notebookSlice.actions;