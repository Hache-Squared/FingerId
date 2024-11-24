import { CurrentSheetShowing, SheetItem } from "./SheetContentTypes";

export interface NotebookState {
    id: string;
    title: string;
    menuSheetItemList: SheetItem[];
    currentSheetShowing: CurrentSheetShowing | null;
    isLoadingNotebook: boolean;
    currentSheetContentList: CurrentSheetShowing[]
}

export interface InitNotebookState {
    id: string;
    title: string;
    menuSheetItemList: SheetItem[];
}