import { InitNotebookState, NotebookListItem, SheetContent, SheetItem } from "../../types";
import { NotebookResponse, SheetContentResponse, SheetResponse } from "../Interfaces/ResponsesApi";

export class NotebookMapper {
    static notebookResponseJsonToModel(data: NotebookResponse): NotebookListItem {
        return {
            id: data.id.toString(),
            title: data.name,
        };
    }

    static notebookWithDataResponseJsonToNotebookState(data: NotebookResponse): InitNotebookState {
        return {
            id: data.id.toString(),
            title: data.name,
            menuSheetItemList: data.sheets.map(sheet => ({
                id: sheet.id.toString(),
                title: sheet.name,
            })),
        };
    }

    static sheetResponseJsonToModel(data: SheetResponse): SheetItem {
        return {
            id: data.id.toString(),
            title: data.name,
        };
    }
    static sheetContentResponseJsonToModel(data: SheetContentResponse): SheetContent {
        return {
            id: data.id.toString(),
            numOrder: data.order,
            type: data.type as any,
            content: data.content,
        };
    }
}