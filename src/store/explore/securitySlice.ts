import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BackpackContents, BackpackListItem, BookListItem, NotebookListItem, PublicationListItem } from "../../types";


interface initialStateProps {
   isLocked: boolean,
};

const initialState: initialStateProps = {
    isLocked: true,
};

export const securitySlice = createSlice({
    name: "security",
    initialState: initialState,
    reducers: {
       onLoadLock: (state, action: PayloadAction<boolean>) => {
          state.isLocked = action.payload
       },
 
       
    }
});

export const { 
   onLoadLock
} = securitySlice.actions;