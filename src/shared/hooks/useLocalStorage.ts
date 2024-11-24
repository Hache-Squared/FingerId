import React, { useEffect } from 'react'
import RNFS from 'react-native-fs';
import { BookFile, BookListItem, NotebookFolder, NotebookStuctureFolders, SheetContent, SheetContentType, SheetFolder } from '../../types';

// Task
/*
  //NO permitir que ningun titulo de libreta, hoja o libro lleve el caracter '_' 
  - Crear una estructura de carpetas para guardar las libretas / Hojas

  - Obtener todas las libretas
  - Obtener el contenido de una libreta
  - Obtener el contenido de las Hojas
*/



export const useLocalStorage = () => {
    // Define the base path for the application
    const appBasePath = `${RNFS.DocumentDirectoryPath}/miApp`;
    const notebooksPath = `${appBasePath}/notebooks`;
    const downloadPath = `${RNFS.DocumentDirectoryPath}/temporal`;
    const booksPath = `${appBasePath}/books`;

    useEffect(() => {
      createInitialFolders();
    },[])

    // notebooks / notebook_id_names / sheet_id_names / files.txt

    const getFolderStructureSheet = (structure: NotebookStuctureFolders): string => {
      let notebookTitle = sanitizeFileName(structure.notebook_title);
      let sheetTitle = sanitizeFileName(structure.sheet_title);
      return `${notebooksPath}/${structure.notebook_id}_${notebookTitle}/${structure.sheet_id}_${sheetTitle}`;
    }


    const sanitizeFileName = (name: string): string => {
      return name.replace(/[<>:"/\\|?*]+/g, ' ');
    };

    
    const createInitialFolders = async() => {
      try {
        // Verificar y crear appBasePath si no existe
        const appBasePathExists = await RNFS.exists(appBasePath);
        if (!appBasePathExists) {
          await RNFS.mkdir(appBasePath);
          console.log(`${appBasePath} creado`);
        }
    
        // Verificar y crear notebooksPath si no existe
        const notebooksPathExists = await RNFS.exists(notebooksPath);
        if (!notebooksPathExists) {
          await RNFS.mkdir(notebooksPath);
          console.log(`${notebooksPath} creado`);
        }
    
        // Verificar y crear downloadPath si no existe
        const downloadPathExists = await RNFS.exists(downloadPath);
        if (!downloadPathExists) {
          await RNFS.mkdir(downloadPath);
          console.log(`${downloadPath} creado`);
        }

        const booksPathExists = await RNFS.exists(booksPath);
        if (!booksPathExists) {
          await RNFS.mkdir(booksPath);
          console.log(`${booksPath} creado`);
        }
        
        // console.log("Directorios iniciales creados");
        
      } catch (error) {
        console.log('Error al crear los directorios iniciales:', error);
      }
    };
    // Create the directories
    const createDirectories = async () => {
      const structure: NotebookStuctureFolders = {
        notebook_id: 'nuevaNotebookId',
        notebook_title: 'notebookTitle',
        sheet_id:'nuevaYRemodeladasheetId',
        sheet_title:'sheetTitle'
      }
      const contentText: SheetContent = {
        id: 'textoId1',
        numOrder: 1,
        type: SheetContentType.Text,
        content: 'contenido de prueba para ver si se guardo el texto JEJE =D'
      }
      const contentImage: SheetContent = {
        id: 'imagen1',
        numOrder: 2,
        type: SheetContentType.Image,
        content: 'https://i.ytimg.com/vi/9cYRdJPLuAk/maxresdefault.jpg'
      }
      
      const arrPromises = [
        createTextElementFile(structure, contentText), 
        createImageElementFile(structure, contentImage),
        getNotebooksSaved(),
        getNotebookContent({
          id: structure.notebook_id,
          title: structure.notebook_title
        }),
        getSheetContent(structure)
      ]

      const results = await Promise.all(arrPromises);
      console.log(results);


    };

    const createSheetFolder = async(sheetFolder: string): Promise<boolean> => {
      //crear folder si no existe 
      try {
        let exist = await RNFS.exists(sheetFolder)
        if(!exist) {
          await RNFS.mkdir(sheetFolder);
        }
        return true;
        
      } catch (error) {
        console.log('error (createSheetFolder) :', error);
        return false;
      }
    }

    const createTextElementFile = async (structure: NotebookStuctureFolders, element: SheetContent): Promise<boolean> => {
      //crear folder si no existe 
      try {
        const folderStructureForSheet = getFolderStructureSheet(structure);
        let folderCreated = await createSheetFolder(folderStructureForSheet);
        if(!folderCreated) {
          return false;
        }

        let filePath = `${folderStructureForSheet}/${element.id}_${element.numOrder}_${element.type}.txt`; 
        console.log("Guardando txt: ", filePath);
               
        await RNFS.writeFile(filePath, element.content, 'utf8');
        return true;
        
      } catch (error) {
        console.log('error (createTextElementFile) :', error);
        return false;
      }
    }
    const createImageElementFile = async (structure: NotebookStuctureFolders, element: SheetContent): Promise<boolean> => {
      //crear folder si no existe 
      
      
      try {
        // console.log(structure);
        // console.log(element);
        if(element.type !== SheetContentType.Image) {
          console.log("No es imagen ");
          return false;
        }

        const folderStructureForSheet = getFolderStructureSheet(structure);
        let folderCreated = await createSheetFolder(folderStructureForSheet);
        if(!folderCreated) {
          return false;
        }

        let filePath = `${folderStructureForSheet}/${element.id}_${element.numOrder}_${element.type}.png`;        

        
        await createInitialFolders();
        // Download the file
        const folderForDownload = `${downloadPath}/${element.id}_${element.numOrder}_${element.type}.png`;
        
        const downloadResult = await RNFS.downloadFile({
          fromUrl: element.content,
          toFile: folderForDownload,
        }).promise;
  
        if (downloadResult.statusCode === 200) {
          // Move the file to the destination path
          await RNFS.moveFile(folderForDownload, filePath);
          console.log("Guardando image: ", filePath);
          // console.log('Archivo descargado y movido exitosamente');
          return true;
        } else {
          console.log('Error al descargar el archivo');
          return false;
        }
        
      } catch (error) {
        console.log('error (createImageElementFile) :', error);
        return false;
      }
    }

    const getNotebooksSaved = async (): Promise<NotebookFolder[]> => {
      try {
        const folderArr = await RNFS.readDir(notebooksPath);
        const notebooks: NotebookFolder[] = folderArr?.map(folder => {
          let notebookData = folder?.name?.split('_');
          let notebookId = notebookData[0];
          let notebookTitle = notebookData[1];

          return {
            id: notebookId,
            title: notebookTitle
          }
        })
        console.log("Notebooks saved: ", notebooks);
        
        return notebooks;
        
      } catch (e) {
        console.log('error (getNotebooksSaved) :', e);
        return [];
      }
    }

    const getNotebookContent = async (notebook: NotebookFolder): Promise<SheetFolder[]> => {
      try {
        const folderNotebook = `${notebooksPath}/${notebook.id}_${notebook.title}`
        const folderArr = await RNFS.readDir(folderNotebook);
        const sheets: SheetFolder[] = folderArr?.map(folder => {
          let sheetData = folder?.name?.split('_');
          let sheetId = sheetData[0];
          let sheetTitle = sheetData[1];

          return {
            id: sheetId,
            title: sheetTitle
          }
        })
        console.log("sheets: ", sheets);
        
        return sheets;
        
      } catch (e) {
        console.log('error (getNotebookContent) :', e);
        return [];
      }
    }

    const getSheetContent = async (structure: NotebookStuctureFolders): Promise<SheetContent[]> => {
      try {
        const folderSheet = getFolderStructureSheet(structure);
        const filesArr = await RNFS.readDir(folderSheet);
        let contentPromises: Array<Promise<SheetContent>> = [];
        filesArr.forEach(file => {
          let type = evalTypeOfFile(file.path);
          console.log("filePath: " + file.path);
          

          if(type === 'text'){
            contentPromises.push(getTextItemFromFile(file.path));
          }
          if(type === 'image'){
            contentPromises.push(getImageItemFromFile(file.path));
          }
        })

        const content = await Promise.all(contentPromises);
        //Ordenar por numOrder

        content?.sort((a, b) => a?.numOrder - b?.numOrder);

        return content;
        
      } catch (e) {
        console.log('error (getSheetContent) :', e);
        return [];
      }
    }

  const evalTypeOfFile = (path: string): 'text' | 'image' | 'undefined' => {
    let extentionArr = path.split('.');
    let extention = extentionArr[ extentionArr.length - 1 ];
    if(extention === 'txt') {
      return 'text';
    }else if(extention === 'png'){
      return 'image';
    }
    return 'undefined';

  }

    const getTextItemFromFile = async (path: string): Promise<SheetContent> => {
      try {
        const data = path.split('/');
        const info = data[data?.length - 1]?.split('.')[0];
        const id = info?.split('_')[0];
        const numOrder = info?.split('_')[1];
        const type = info?.split('_')[2] as SheetContentType;
        const content = await RNFS.readFile(path, 'utf8');
        

        return {
          id: id,
          numOrder: parseInt(numOrder),
          type: type,
          content: content
        };
        
      } catch (e) {
        console.log('error (getTextItemFromFile) :', e);
        return {
          id: '',
          numOrder: 0,
          type: SheetContentType.Text,
          content: ''
      };
      }
    }

    const getImageItemFromFile = async (path: string): Promise<SheetContent> => {
      try {
        const data = path.split('/');
        const info = data[data?.length - 1]?.split('.')[0];
        const id = info?.split('_')[0];
        const numOrder = info?.split('_')[1];
        const type = info?.split('_')[2] as SheetContentType;
        const content = await RNFS.readFile(path, 'base64');
        

        return {
          id: id,
          numOrder: parseInt(numOrder),
          type: type,
          content: `data:image/jpeg;base64,${content}`
        };
        
      } catch (e) {
        console.log('error (getTextItemFromFile) :', e);
        return {
          id: '',
          numOrder: 0,
          type: SheetContentType.Image,
          content: ''
      };
      }
    }

    const getBooks = async (): Promise<BookFile[]> => {
      try {
        const folderBooks = `${booksPath}/`
        const folderArr = await RNFS.readDir(folderBooks);
        const books = folderArr.map((book) => {
          let bookData = book?.name?.split('_');
          let bookId = bookData[0];
          let bookTitle = bookData[1];
          let bookUriDocument = `file://${booksPath}/${book.name}`;

          return {
            id: bookId,
            title: bookTitle,
            uriDocument: bookUriDocument
          }
        })
        console.log("books", books);
        
        return books;
        
      } catch (e) {
        console.log('error (getBooks) :', e);
        return [];
      }
    }

    const saveBook = async (bookItem: BookListItem, pathCache: string): Promise<boolean> => {
      try {
        const sanitizedFileName = sanitizeFileName(bookItem.title)
        const bookPath = `${booksPath}/${bookItem.id}_${sanitizedFileName}.pdf`
        
        const fileExists = await RNFS.exists(bookPath);
        if (fileExists) {
          console.log('PDF already exists at the destination');
          return true;
        }

        await RNFS.copyFile(pathCache, bookPath);
        return true;
      } catch (e) {
        console.log('error (getBooks) :', e);
        return false;
      }
    }



  return {

    //properties
    //actions
    createDirectories,
    createTextElementFile,
    createImageElementFile,
    getNotebooksSaved,
    getNotebookContent,
    getSheetContent,
    saveBook,
    getBooks
  }
}
