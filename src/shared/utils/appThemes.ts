import { ColorsTheme } from "../../types"

export const lightColorsTheme: ColorsTheme = {
    primaryColor: '#008605',
    secondaryColor: '#fff',

    screens: {
        primaryColor: "#fff",
        secondaryColor: "#e8ecf5",
        titleColor: "#111",
    },
    statusBarColor: '#008605',
    buttons: {
        backgroundColor: '#fff',
        textColor: '#111'
    },
    texts: {
        labelColor: '#111'
    },
    tabBar: {
        backgroundColor: '#fff',
        labelColorActive: '#008605',
        labelColorInactive: '#111'
    },
    menuNotebookContent: {
        titleBackgroundColor: '#111',
        titleTextColor: '#fff',
        colorStatusActive: '#008605',
        colorStatusInactive: 'gray',
    },
    headerMenuNotebookContent: {
        buttonMenuLabelColor: "#111",
        buttonMenuBackgroundColor: "#d2dae2",
    },
    sheetContent:{
        sheetTitle: '#008605',
        textTitleColor: '#111',
        textSubtitleColor: '#111',
        textColor: '#111',
    },
    publications:{
        backgroundColor: '#fff',
        textColor: '#111',
    },
    selectViewFromBackpackColors: {
        backgroundColor: '#dfe6e9',
        textColor: '#111',
    }
}

export const darkColorsTheme: ColorsTheme = {
    primaryColor: '#008605',
    secondaryColor: '#111',
    screens: {
        primaryColor: "#000000",
        secondaryColor: "#121212",
        titleColor: "#fff",
    },
    statusBarColor: '#008605',
    buttons: {
        backgroundColor: '#2f3542',
        textColor: '#fff'
    },
    texts: {
        labelColor: '#FFF'
    },
    tabBar: {
        backgroundColor: '#111',
        labelColorActive: '#008605',
        labelColorInactive: '#fff'
    },
    menuNotebookContent: {
        titleBackgroundColor: '#111',
        titleTextColor: '#fff',
        colorStatusActive: '#008605',
        colorStatusInactive: '#FFF',
    },
    headerMenuNotebookContent: {
        buttonMenuLabelColor: "#d2dae2",
        buttonMenuBackgroundColor: "#111",
    },
    sheetContent:{
        sheetTitle: '#008605',
        textTitleColor: '#fff',
        textSubtitleColor: '#fff',
        textColor: '#fff',
    },
    publications:{
        backgroundColor: '#111',
        textColor: '#fff',
    },
    selectViewFromBackpackColors: {
        backgroundColor: '#dfe6e9',
        textColor: '#111',
    }
}