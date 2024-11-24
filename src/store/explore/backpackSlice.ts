import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BackpackContents, BackpackListItem, BookListItem, NotebookListItem, PublicationListItem } from "../../types";


const initialState: BackpackContents = {
    isLoadingBackpack: true,
    currentBackpack: null,
    currentBackpackNotebookList: [],
    currentBackpackBookList: [],
    currentBackpackPublicationList: [],
};

export const backpackSlice = createSlice({
    name: "backpack",
    initialState: initialState,
    reducers: {
       onLoadCurrentBackpack: (state, action: PayloadAction<BackpackListItem>) => {
          state.currentBackpack = { ...action.payload }
          state.isLoadingBackpack = false;
       },


       onLoadNotebooks: (state, action: PayloadAction<NotebookListItem[]>) => {
            state.currentBackpackNotebookList = [...action.payload]
            state.isLoadingBackpack = false;
       },
       onLoadBooks: (state, action: PayloadAction<BookListItem[]>) => {
            state.currentBackpackBookList = [...action.payload]
            state.isLoadingBackpack = false;
       },
       onLoadPublications: (state, action: PayloadAction<PublicationListItem[]>) => {
            state.currentBackpackPublicationList = [...action.payload]
            state.isLoadingBackpack = false;
       },
       
      onAddNotebook: (state, action: PayloadAction<NotebookListItem>) => {
         state.currentBackpackNotebookList = [...state.currentBackpackNotebookList, action.payload]
         state.isLoadingBackpack = false;
      },
      onAddBook: (state, action: PayloadAction<BookListItem>) => {
            state.currentBackpackBookList = [...state.currentBackpackBookList, action.payload]
            state.isLoadingBackpack = false;
      },
      onAddPublication: (state, action: PayloadAction<PublicationListItem>) => {
            state.currentBackpackPublicationList = [...state.currentBackpackPublicationList, action.payload]
            state.isLoadingBackpack = false;
      },

       onResetBackpackState: (state) => {
          state.currentBackpack = null;
          state.currentBackpackNotebookList = [];
          state.currentBackpackBookList = [];
          state.currentBackpackPublicationList = [];
          state.isLoadingBackpack = false;
       },
       onLoadingBackpack: (state) => {
          state.isLoadingBackpack = true;
       },
       onFinishedLoadingBackpack: (state) => {
          state.isLoadingBackpack = false;
       }
       
       
    }
});

export const { 
   onLoadBooks, 
   onLoadNotebooks, 
   onLoadPublications, 
   onLoadCurrentBackpack, 
   onResetBackpackState,  
   onLoadingBackpack, 
   onFinishedLoadingBackpack,
   onAddNotebook,
   onAddBook,
   onAddPublication
} = backpackSlice.actions;