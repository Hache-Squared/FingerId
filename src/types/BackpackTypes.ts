

export interface BackpackContents {
    isLoadingBackpack?: boolean;
    currentBackpack: BackpackListItem | null;
    currentBackpackNotebookList: NotebookListItem[];
    currentBackpackBookList: BookListItem[];
    currentBackpackPublicationList: PublicationListItem[];
}

export interface BackpackListItem {
    id: string;
    title: string;
    image?: string;
}

export interface NotebookListItem {
    id: string;
    title: string;
}

export interface BookListItem {
    id: string;
    title: string;
    uriDocument: string;
}

export interface PublicationListItem {
    id: string;
    title: string;
    link?: string,
    image?: string,
}


