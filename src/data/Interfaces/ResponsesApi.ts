export interface BackpackResponse {
    id:                number;
    name:              string;
    numberOfNotebooks: number;
}


////////////////////////////////////////////////////////////////
//Notebooks
export interface NotebookResponse {
    id:         number;
    name:       string;
    backpackId: number;
    backpack:   BackpackResponse;
    sheets:     SheetForNotebookResponse[];
}

export interface SheetForNotebookResponse {
    id:           number;
    name:         string;
    notebookId:   number;
    notebookName: string;
}


export interface BackpackWithNotebooksResponse {
    notebooks?:        NotebookResponse[];
    id:                number;
    name:              string;
    numberOfNotebooks: number;
}

////////////////////////////////////////////////////////////////
//Sheets
export interface SheetResponse {
    id:           number;
    name:         string;
    notebookId:   number;
    notebookName: string;
}

export interface SheetContentResponse {
    id:      number;
    order:   number;
    type:    string;
    content: string;
    sheetId: number;
}

export interface SheetWithSheetContentsResponse {
    id:           number;
    name:         string;
    notebookId:   number;
    notebookName: string;
    contents:     SheetContentResponse[];
}
