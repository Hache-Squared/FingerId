// Datos ficticios

import { BackpackContents, BookListItem, NotebookListItem, PublicationListItem } from "../../types";

export const backpackListContentExample: BackpackContents[] =  [
    {
        currentBackpack: {
            id: "1",
            title: "Plan 401",
            image: "https://todoseguros.com.mx/wp-content/uploads/2021/10/img1-1.jpg",
        },
        currentBackpackNotebookList: [
            { id: "1", title: "Cálculo Diferencial" },
            { id: "2", title: "Cálculo Integral" },
            
        ],
        currentBackpackBookList: [
            { id: "1", title: "Libro de Álgebra 1", uriDocument:'https://southbend.iu.edu/students/academic-success-programs/academic-centers-for-excellence/docs/Basic%20Math%20Review%20Card.pdf' },
            { id: "2", title: "Libro de Geometría Analítica", uriDocument:'https://bdigital.uncu.edu.ar/objetos_digitales/11619/raichman-geometriaanalitica-actividadesaprendizaje.pdf' }
        ],
        currentBackpackPublicationList: [
            { id: "1", title: "Reunión con profesores de INSA-Lyon", link: "https://www.fime.uanl.mx/noticias/aumentan-acuerdos-de-colaboracion-entre-fime-y-insa-lyon/", image: 'https://www.fime.uanl.mx/wp-content/uploads/2022/04/francia2-768x512.jpeg' },
            { id: "2", title: "Ingenieros En Fime", link: "https://www.fime.uanl.mx/noticias/aumentan-acuerdos-de-colaboracion-entre-fime-y-insa-lyon/", image: "https://www.fime.uanl.mx/wp-content/uploads/2022/04/francia3.jpeg" }
        ]
    },
    {
        currentBackpack: {
            id: "2",
            title: "Plan 440",
            image: "https://todoseguros.com.mx/wp-content/uploads/2021/10/img1-1.jpg",
        },
        currentBackpackNotebookList: [
            { id: "3", title: "Aplicaciones Híbridas" },
            { id: "4", title: "Introducción a React Native" },
            
        ],
        currentBackpackBookList: [
            { id: "4", title: "Libro de Android Studio", uriDocument:'https://elhacker.info/manuales/Lenguajes%20de%20Programacion/Android/Programaci%C3%B3n%20Android%20con%20Android%20Studio%20-%20Rev%202.0.pdf' },
            { id: "5", title: "Libro de React Native", uriDocument:'https://www.tutorialspoint.com/react_native/react_native_tutorial.pdf' },
            { id: "6", title: "Libro de Flutter", uriDocument:'https://www.tutorialspoint.com/flutter/flutter_tutorial.pdf' }
        ],
        currentBackpackPublicationList: [
            { id: "3", title: "Estreno de la aplicación E-UANL", link: "https://campusdigital.uanl.mx/", image: "https://campusdigital.uanl.mx/assets/uanl_app_icon.3abee41f.png" },
            
        ]
    },
]



