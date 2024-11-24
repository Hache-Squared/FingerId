import { BackpackListItem, CurrentSheetShowing } from "../../types";
import { BackpackResponse, SheetWithSheetContentsResponse } from "../Interfaces/ResponsesApi";

export class SheetMapper {
    static sheetWithDataResponseToCurrentSheetShowing(data: SheetWithSheetContentsResponse): CurrentSheetShowing {   
        return {
            id: data.id.toString(),
            title: data.name,
            content: data.contents.map(content => ({
                id: content.id.toString(),
                numOrder: content.order,
                type: content.type as any,
                content: content.content,
            })),
            next: null,
            prev: null,
        };
    }
}