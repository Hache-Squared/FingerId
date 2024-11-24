import { BackpackListItem } from "../../types";
import { BackpackResponse } from "../Interfaces/ResponsesApi";

export class BackpackMapper {
    static backpackResponseJsonToModel(data: BackpackResponse): BackpackListItem {   
        return {
            id: data.id.toString(),
            title: data.name,
            image: ``
        };
    }
}