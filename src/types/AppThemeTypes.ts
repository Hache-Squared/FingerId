// types.ts
export interface ColorsTheme {

    primaryColor: string,
    secondaryColor: string,
    screens: {
      primaryColor: string;
      secondaryColor: string;
      titleColor: string;
    };

    statusBarColor: string,
    buttons: {
      backgroundColor: string;
      textColor: string;
    };
    texts: {
      labelColor: string;
    };
    tabBar: {
      backgroundColor: string;
      labelColorActive: string;
      labelColorInactive: string;
    };
    menuNotebookContent: {
      titleBackgroundColor: string;
      titleTextColor: string;
      colorStatusActive: string;
      colorStatusInactive: string;
    };
    headerMenuNotebookContent: {
      buttonMenuLabelColor: string;
      buttonMenuBackgroundColor: string;
    };
    sheetContent: {
      sheetTitle: string;
      textTitleColor: string;
      textSubtitleColor: string;
      textColor: string;
    };
    publications: {
      backgroundColor: string;
      textColor: string;
    };
    selectViewFromBackpackColors: {
      backgroundColor: string;
      textColor: string;
    }
  }
  
  export type ThemeSelected = 'light' | 'dark';
  
  export interface AppThemeState {
    colors: ColorsTheme;
    theme: ThemeSelected;
  }
  