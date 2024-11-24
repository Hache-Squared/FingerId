import { CurrentSheetShowing, InitNotebookState, SheetContentType, SheetItem } from "../../types";


export const menuSheetItemNotebookListExample: InitNotebookState[] = [
    {
        id: '1',
        title: "Cálculo Diferencial",
        menuSheetItemList: [
            { id: "1", title: "¿Qué es una derivada?" },
            { id: "2", title: "Fórmulas de Derivación" }
        ]
    },
    {

        id: '2',
        title: "Cálculo Integral",
        menuSheetItemList: [
            { id: "3", title: "¿Qué es el Cálculo Integral?" },
            { id: "4", title: "Constante C" }
        ]
    },
    {
        id: '3',
        title: "Aplicaciones Híbridas",
        menuSheetItemList: [
            { id: "5", title: "React Native" },
            { id: "6", title: "Flutter" }
        ]
    },

    {
        id: '4',
        title: "Introducción a React Native",
        menuSheetItemList: [
            { id: "7", title: "Fundamentos de React Native" },
            { id: "8", title: "Componentes en React Native (View y Text)" }
        ]
    }
    
];

//sheets list from notebook
export const currentSheetShowingExample: CurrentSheetShowing[] = [
    {
        id: "1",
        title: "¿Qué es una derivada?",
        content: [
            { id: '1', numOrder: 1, type: SheetContentType.Text, content: "Una derivada representa la tasa de cambio instantánea de una función con respecto a una de sus variables. Es un concepto fundamental en el cálculo y en el análisis matemático." },
            { id: '2', numOrder: 2, type: SheetContentType.Subtitle, content: "Definición Formal" },
            { id: '3', numOrder: 3, type: SheetContentType.Text, content: "Si f(x) es una función, su derivada f'(x) se define como el límite: f'(x) = lim(h -> 0) [f(x + h) - f(x)] / h." },
            { id: '4', numOrder: 4, type: SheetContentType.Text, content: "En términos más simples, la derivada mide cómo cambia el valor de la función cuando se realiza un pequeño cambio en la variable independiente." },
            { id: '5', numOrder: 5, type: SheetContentType.Subtitle, content: "Aplicaciones de las Derivadas" },
            { id: '6', numOrder: 6, type: SheetContentType.Text, content: "Las derivadas se utilizan en una variedad de campos, incluyendo la física, la ingeniería, la economía y la biología. Por ejemplo, en física, la velocidad es la derivada de la posición con respecto al tiempo." },
            { id: '7', numOrder: 7, type: SheetContentType.Text, content: "En economía, las derivadas pueden ayudar a determinar el máximo beneficio o el mínimo costo." },
            { id: '8', numOrder: 8, type: SheetContentType.Image, content: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR82ySDD6ezzGgQuixcNTjYzPs-ixC-nXq6CA&s" },
            { id: '9', numOrder: 9, type: SheetContentType.Text, content: "La gráfica de una derivada proporciona información sobre el comportamiento de una función, como los puntos de inflexión y las pendientes de las tangentes." },
            { id: '10', numOrder: 10, type: SheetContentType.YoutubeVideo, content: "aVNa-J8iB5I" },
            { id: '11', numOrder: 11, type: SheetContentType.Text, content: "La derivada segunda, o la derivada de la derivada, proporciona información sobre la concavidad de la función original." },
            { id: '12', numOrder: 12, type: SheetContentType.Text, content: "El teorema de Rolle y el teorema del valor medio son importantes resultados teóricos que utilizan derivadas." },
            { id: '13', numOrder: 13, type: SheetContentType.Text, content: "Las derivadas parciales se utilizan para funciones de varias variables y son cruciales en el cálculo multivariable." },
            { id: '14', numOrder: 14, type: SheetContentType.Text, content: "El concepto de derivada también se extiende a las funciones vectoriales y matriciales." }
        ],
        prev: null,
        next: null,
    },
    {
        id: "2",
        title: "Fórmulas de Derivación",
        content: [
            { id: '1', numOrder: 1, type: SheetContentType.Text, content: "Las fórmulas de derivación son reglas que nos permiten encontrar la derivada de una función sin tener que recurrir al límite del cociente incremental." },
            { id: '2', numOrder: 2, type: SheetContentType.Subtitle, content: "Regla de la Potencia" },
            { id: '3', numOrder: 3, type: SheetContentType.Text, content: "Si f(x) = x^n, donde n es un número real, entonces f'(x) = n*x^(n-1)." },
            { id: '4', numOrder: 4, type: SheetContentType.Subtitle, content: "Regla del Producto" },
            { id: '5', numOrder: 5, type: SheetContentType.Text, content: "Si u(x) y v(x) son funciones derivables, entonces la derivada de su producto es: (u*v)' = u'*v + u*v'." },
            { id: '6', numOrder: 6, type: SheetContentType.Subtitle, content: "Regla del Cociente" },
            { id: '7', numOrder: 7, type: SheetContentType.Text, content: "Si u(x) y v(x) son funciones derivables y v(x) ≠ 0, entonces la derivada de su cociente es: (u/v)' = (u'*v - u*v') / v^2." },
            { id: '8', numOrder: 8, type: SheetContentType.Subtitle, content: "Regla de la Cadena" },
            { id: '9', numOrder: 9, type: SheetContentType.Text, content: "Si una función y depende de u, que a su vez depende de x, entonces la derivada de y con respecto a x es: dy/dx = (dy/du) * (du/dx)." },
            { id: '10', numOrder: 10, type: SheetContentType.Image, content: "https://economipedia.com/wp-content/uploads/tabla-de-derivadas.png" },
            { id: '11', numOrder: 11, type: SheetContentType.Subtitle, content: "Derivadas de Funciones Trigonométricas" },
            { id: '12', numOrder: 12, type: SheetContentType.Text, content: "Las derivadas de las funciones trigonométricas básicas son: (sin(x))' = cos(x), (cos(x))' = -sin(x), (tan(x))' = sec^2(x)." },
            { id: '13', numOrder: 13, type: SheetContentType.Subtitle, content: "Derivadas de Funciones Exponenciales y Logarítmicas" },
            { id: '14', numOrder: 14, type: SheetContentType.Text, content: "Las derivadas de las funciones exponenciales y logarítmicas son: (e^x)' = e^x, (a^x)' = a^x * ln(a), (ln(x))' = 1/x, (log_a(x))' = 1 / (x*ln(a))." },
            { id: '15', numOrder: 15, type: SheetContentType.YoutubeVideo, content: "KSPFmQQvM7I" },
            { id: '16', numOrder: 16, type: SheetContentType.Text, content: "Es fundamental dominar estas fórmulas para poder resolver problemas de cálculo diferencial de manera eficiente y precisa." }
        ],
        prev: null,
        next: null,
    },
    {
        id: "3",
        title: "¿Qué es el Cálculo Integral?",
        content: [
            { id: '1', numOrder: 1, type: SheetContentType.Text, content: "El cálculo integral es una rama del cálculo que se centra en las integrales y sus aplicaciones. Es fundamental para entender áreas y acumulación de cantidades." },
            { id: '2', numOrder: 2, type: SheetContentType.Subtitle, content: "Definición de Integral" },
            { id: '3', numOrder: 3, type: SheetContentType.Text, content: "Una integral es una función que nos permite calcular el área bajo una curva o la acumulación de una cantidad. La notación básica es ∫ f(x) dx." },
            { id: '4', numOrder: 4, type: SheetContentType.Image, content: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Integral_example.png/220px-Integral_example.png" },
            { id: '5', numOrder: 5, type: SheetContentType.Text, content: "La integral definida se utiliza para calcular el área bajo una curva entre dos puntos a y b: ∫[a,b] f(x) dx." },
            { id: '6', numOrder: 6, type: SheetContentType.Subtitle, content: "Teorema Fundamental del Cálculo" },
            { id: '7', numOrder: 7, type: SheetContentType.Text, content: "Este teorema conecta las derivadas con las integrales y tiene dos partes. La primera parte dice que la integral de una función continua es una antiderivada. La segunda parte establece que la derivada de la integral acumulada de una función es la función misma." },
            { id: '8', numOrder: 8, type: SheetContentType.Image, content: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Integral_example.png/220px-Integral_example.png" },
            { id: '9', numOrder: 9, type: SheetContentType.Text, content: "La integral indefinida representa una familia de funciones y se denota como ∫ f(x) dx = F(x) + C, donde F'(x) = f(x) y C es una constante de integración." },
            { id: '10', numOrder: 10, type: SheetContentType.Subtitle, content: "Métodos de Integración" },
            { id: '11', numOrder: 11, type: SheetContentType.Text, content: "Existen varios métodos para calcular integrales, entre los cuales destacan la integración por sustitución y la integración por partes." },
            { id: '12', numOrder: 12, type: SheetContentType.Image, content: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Integral_example.png/220px-Integral_example.png" },
            { id: '13', numOrder: 13, type: SheetContentType.Text, content: "La integración por sustitución se utiliza cuando una integral puede simplificarse mediante un cambio de variable. La fórmula básica es ∫ f(g(x)) g'(x) dx = ∫ f(u) du." },
            { id: '14', numOrder: 14, type: SheetContentType.Text, content: "La integración por partes se basa en la fórmula ∫ u dv = uv - ∫ v du y es útil cuando el integrando es un producto de funciones." },
            { id: '15', numOrder: 15, type: SheetContentType.Image, content: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Integral_example.png/220px-Integral_example.png" },
            { id: '16', numOrder: 16, type: SheetContentType.YoutubeVideo, content: "TFaUnAtaan4" },
            { id: '17', numOrder: 17, type: SheetContentType.Text, content: "El cálculo integral tiene aplicaciones en diversas áreas como la física, la ingeniería, la economía y las ciencias naturales, permitiendo el cálculo de áreas, volúmenes, y otras cantidades acumuladas." }
        ],
        prev: null,
        next: null,
    },
    {
        id: "4",
        title: "Constante C",
        content: [
            { id: '1', numOrder: 1, type: SheetContentType.Text, content: "En el cálculo integral, la constante C se refiere a la constante de integración. Es una constante arbitraria que se agrega al resultado de una integral indefinida." },
            { id: '2', numOrder: 2, type: SheetContentType.Subtitle, content: "Importancia de la Constante C" },
            { id: '3', numOrder: 3, type: SheetContentType.Text, content: "La constante de integración surge porque la derivada de una constante es cero. Esto significa que hay infinitas antiderivadas posibles para una función dada." },
            { id: '4', numOrder: 4, type: SheetContentType.Image, content: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxn6UTrR94zbPeeudx99oHnG_95kIROWZfKw&s" },
            { id: '5', numOrder: 5, type: SheetContentType.Text, content: "Por ejemplo, si F(x) es una antiderivada de f(x), entonces F(x) + C también es una antiderivada de f(x) para cualquier constante C." },
            { id: '6', numOrder: 6, type: SheetContentType.Subtitle, content: "Ejemplos de Integrales Indefinidas" },
            { id: '7', numOrder: 7, type: SheetContentType.Text, content: "Considera la integral indefinida ∫ 2x dx. La antiderivada es x^2 + C, donde C es la constante de integración." },
            { id: '8', numOrder: 8, type: SheetContentType.Image, content: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxn6UTrR94zbPeeudx99oHnG_95kIROWZfKw&s" },
            { id: '9', numOrder: 9, type: SheetContentType.Text, content: "Otro ejemplo es la integral ∫ cos(x) dx, cuya antiderivada es sin(x) + C." },
            { id: '10', numOrder: 10, type: SheetContentType.Text, content: "La constante de integración es crucial en problemas de valor inicial, donde se utiliza para determinar la solución particular de una ecuación diferencial." },
            { id: '11', numOrder: 11, type: SheetContentType.Image, content: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxn6UTrR94zbPeeudx99oHnG_95kIROWZfKw&s" },
            { id: '12', numOrder: 12, type: SheetContentType.Text, content: "En aplicaciones físicas, la constante de integración puede representar condiciones iniciales o de borde específicas del problema que se está resolviendo." },
            { id: '13', numOrder: 13, type: SheetContentType.YoutubeVideo, content: "d1_mn8dclX4" },
            { id: '14', numOrder: 14, type: SheetContentType.Text, content: "Entender la constante de integración es esencial para resolver integrales indefinidas correctamente y aplicar el cálculo en situaciones prácticas." }
        ],
        prev: null,
        next: null,
    },
    {
        id: "5",
        title: "React Native",
        content: [
            { id: '1', numOrder: 1, type: SheetContentType.Text, content: "React Native es un framework de desarrollo de aplicaciones móviles creado por Facebook. Permite a los desarrolladores construir aplicaciones para iOS y Android utilizando JavaScript y React." },
            { id: '2', numOrder: 2, type: SheetContentType.Subtitle, content: "Características Principales" },
            { id: '3', numOrder: 3, type: SheetContentType.Text, content: "React Native permite el desarrollo multiplataforma, lo que significa que con una base de código se pueden crear aplicaciones para ambas plataformas, iOS y Android." },
            { id: '4', numOrder: 4, type: SheetContentType.Image, content: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ18Gt9viR2yfaYTVjyutOeMAGk6sFTje4g2A&s" },
            { id: '5', numOrder: 5, type: SheetContentType.Text, content: "Utiliza componentes nativos, lo que resulta en una experiencia de usuario más fluida y rápida en comparación con otras tecnologías híbridas." },
            { id: '6', numOrder: 6, type: SheetContentType.Text, content: "Soporte de una gran comunidad y una amplia gama de bibliotecas de terceros que facilitan el desarrollo y la integración de diversas funcionalidades." },
            { id: '7', numOrder: 7, type: SheetContentType.Image, content: "https://miro.medium.com/v2/resize:fit:700/1*C3kxjCrJy-aWSMpe2chfaA.png" },
            { id: '8', numOrder: 8, type: SheetContentType.Subtitle, content: "Ventajas de React Native" },
            { id: '9', numOrder: 9, type: SheetContentType.Text, content: "Desarrollo más rápido gracias al uso de componentes reutilizables y al soporte de hot-reloading, que permite ver los cambios en tiempo real." },
            { id: '10', numOrder: 10, type: SheetContentType.Text, content: "Reducción de costos de desarrollo, ya que no es necesario mantener dos bases de código separadas para iOS y Android." },
            { id: '11', numOrder: 11, type: SheetContentType.Image, content: "https://miro.medium.com/v2/resize:fit:700/1*C3kxjCrJy-aWSMpe2chfaA.png" },
            { id: '12', numOrder: 12, type: SheetContentType.Text, content: "Facilidad de aprendizaje para los desarrolladores que ya están familiarizados con JavaScript y React." },
            { id: '13', numOrder: 13, type: SheetContentType.YoutubeVideo, content: "hXDMWeD0ERM" },
            { id: '14', numOrder: 14, type: SheetContentType.Text, content: "React Native también permite el uso de código nativo cuando se necesita optimizar el rendimiento o utilizar funcionalidades específicas de la plataforma." },
            { id: '15', numOrder: 15, type: SheetContentType.Image, content: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ18Gt9viR2yfaYTVjyutOeMAGk6sFTje4g2A&s" },
            { id: '16', numOrder: 16, type: SheetContentType.Text, content: "Aplicaciones populares como Facebook, Instagram, y Airbnb han sido desarrolladas utilizando React Native, lo que demuestra su capacidad para manejar aplicaciones complejas y de alto rendimiento." }
        ],
        prev: null,
        next: null,
    },
    {
        id: "6",
        title: "Flutter",
        content: [
            { id: '1', numOrder: 1, type: SheetContentType.Text, content: "Flutter es un framework de desarrollo de aplicaciones móviles creado por Google. Permite a los desarrolladores construir aplicaciones nativas para iOS y Android utilizando un solo código base." },
            { id: '2', numOrder: 2, type: SheetContentType.Subtitle, content: "Características Principales" },
            { id: '3', numOrder: 3, type: SheetContentType.Text, content: "Flutter utiliza el lenguaje de programación Dart, también desarrollado por Google. Este lenguaje está optimizado para la creación de interfaces de usuario rápidas y eficientes." },
            { id: '4', numOrder: 4, type: SheetContentType.Image, content: "https://www.sofcavi.com/es/wp-content/uploads/2023/04/60bb4a2e143f632da3e56aea_Flutter-app-development-2.png" },
            { id: '5', numOrder: 5, type: SheetContentType.Text, content: "Ofrece un conjunto completo de widgets personalizables que permiten a los desarrolladores crear interfaces de usuario atractivas y de alto rendimiento." },
            { id: '6', numOrder: 6, type: SheetContentType.Text, content: "Soporte para desarrollo multiplataforma, lo que permite crear aplicaciones para iOS, Android, web y escritorio con una sola base de código." },
            { id: '7', numOrder: 7, type: SheetContentType.Image, content: "https://storage.googleapis.com/cms-storage-bucket/70760bf1e88b184bb1bc.png" },
            { id: '8', numOrder: 8, type: SheetContentType.Subtitle, content: "Ventajas de Flutter" },
            { id: '9', numOrder: 9, type: SheetContentType.Text, content: "Desarrollo rápido gracias a la funcionalidad de hot-reload, que permite ver los cambios instantáneamente sin necesidad de recompilar la aplicación." },
            { id: '10', numOrder: 10, type: SheetContentType.Text, content: "Interfaz de usuario nativa de alta calidad con widgets personalizados que se comportan de manera consistente en todas las plataformas." },
            { id: '11', numOrder: 11, type: SheetContentType.Image, content: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWiWY0E_du9TYa4Nd-XDhDJNjUrU6r6h31JQ&s" },
            { id: '12', numOrder: 12, type: SheetContentType.Text, content: "Comunidad en crecimiento y amplio soporte de Google, lo que garantiza una evolución constante del framework y acceso a recursos y herramientas actualizadas." },
            { id: '13', numOrder: 13, type: SheetContentType.YoutubeVideo, content: "-pWSQYpkkjk" },
            { id: '14', numOrder: 14, type: SheetContentType.Text, content: "Capacidad para integrar código nativo de forma sencilla cuando se necesita optimizar el rendimiento o utilizar funcionalidades específicas de la plataforma." },
            { id: '15', numOrder: 15, type: SheetContentType.Image, content: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWiWY0E_du9TYa4Nd-XDhDJNjUrU6r6h31JQ&s" },
            { id: '16', numOrder: 16, type: SheetContentType.Text, content: "Aplicaciones populares como Google Ads, Alibaba, y Reflectly han sido desarrolladas utilizando Flutter, demostrando su capacidad para manejar aplicaciones de alto rendimiento y complejas." }
        ],
        prev: null,
        next: null,
    },
    {
        id: "7",
        title: "Fundamentos de React Native",
        content: [
            { id: '1', numOrder: 1, type: SheetContentType.Text, content: "React Native es un framework de desarrollo de aplicaciones móviles que permite a los desarrolladores usar React junto con las capacidades nativas de las plataformas iOS y Android." },
            { id: '2', numOrder: 2, type: SheetContentType.Subtitle, content: "Historia y Origen" },
            { id: '3', numOrder: 3, type: SheetContentType.Text, content: "React Native fue desarrollado por Facebook y se lanzó en 2015. Surgió como una solución para aprovechar el éxito de React en el desarrollo web y aplicarlo al desarrollo móvil." },
            { id: '4', numOrder: 4, type: SheetContentType.Image, content: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png" },
            { id: '5', numOrder: 5, type: SheetContentType.Text, content: "El objetivo principal de React Native es permitir el desarrollo de aplicaciones móviles usando solo JavaScript y React, logrando un rendimiento cercano al de las aplicaciones nativas." },
            { id: '6', numOrder: 6, type: SheetContentType.Subtitle, content: "Ventajas de React Native" },
            { id: '7', numOrder: 7, type: SheetContentType.Text, content: "Desarrollo multiplataforma: Con una sola base de código, los desarrolladores pueden crear aplicaciones para iOS y Android, lo que ahorra tiempo y recursos." },
            { id: '8', numOrder: 8, type: SheetContentType.Image, content: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png" },
            { id: '9', numOrder: 9, type: SheetContentType.Text, content: "Actualizaciones en tiempo real: La característica de hot-reloading permite a los desarrolladores ver los cambios de código en tiempo real sin necesidad de recompilar la aplicación." },
            { id: '10', numOrder: 10, type: SheetContentType.Subtitle, content: "Componentes y Arquitectura" },
            { id: '11', numOrder: 11, type: SheetContentType.Text, content: "React Native utiliza componentes que se corresponden con elementos nativos de las plataformas móviles. Esto permite una mayor optimización y rendimiento." },
            { id: '12', numOrder: 12, type: SheetContentType.Text, content: "La arquitectura de React Native se basa en una serie de 'bridges' que permiten la comunicación entre el código JavaScript y los componentes nativos de iOS y Android." },
            { id: '13', numOrder: 13, type: SheetContentType.Image, content: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png" },
            { id: '14', numOrder: 14, type: SheetContentType.Text, content: "React Native también permite el uso de código nativo, lo que facilita la integración de módulos específicos que requieren optimización." },
            { id: '15', numOrder: 15, type: SheetContentType.YoutubeVideo, content: "IOBnr9d7A3c" },
            { id: '16', numOrder: 16, type: SheetContentType.Text, content: "Muchas grandes empresas, incluyendo Facebook, Instagram y Airbnb, han adoptado React Native para el desarrollo de sus aplicaciones móviles, lo que demuestra su efectividad y capacidad." },
            { id: '17', numOrder: 17, type: SheetContentType.Image, content: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png" },
            { id: '18', numOrder: 18, type: SheetContentType.Text, content: "React Native sigue evolucionando con nuevas características y mejoras, gracias a una comunidad activa y al soporte continuo de Facebook." }
        ],
        prev: null,
        next: null,
    },
    {
        id: "8",
        title: "Componentes en React Native (View y Text)",
        content: [
            { id: '1', numOrder: 1, type: SheetContentType.Text, content: "React Native utiliza una serie de componentes nativos para construir la interfaz de usuario de las aplicaciones móviles. Dos de los componentes más fundamentales son View y Text." },
            { id: '2', numOrder: 2, type: SheetContentType.Subtitle, content: "Componente View" },
            { id: '3', numOrder: 3, type: SheetContentType.Text, content: "View es el componente base para todos los contenedores de la interfaz de usuario en React Native. Se utiliza para diseñar y agrupar otros componentes." },
            { id: '4', numOrder: 4, type: SheetContentType.Image, content: "https://i.ytimg.com/vi/9cYRdJPLuAk/maxresdefault.jpg" },
            { id: '5', numOrder: 5, type: SheetContentType.Text, content: "El componente View se puede anidar, lo que permite crear estructuras complejas de la interfaz de usuario. Admite estilos de flexbox para el diseño flexible y responsivo." },
            { id: '6', numOrder: 6, type: SheetContentType.Text, content: "Ejemplo de uso de View: \n\n```javascript\n<View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>\n  <Text>Hello, World!</Text>\n</View>\n```" },
            { id: '7', numOrder: 7, type: SheetContentType.Subtitle, content: "Componente Text" },
            { id: '8', numOrder: 8, type: SheetContentType.Text, content: "Text es el componente utilizado para mostrar texto en la pantalla. Admite estilos para personalizar la apariencia del texto, como el tamaño de fuente, color, alineación, y más." },
            { id: '9', numOrder: 9, type: SheetContentType.Image, content: "https://i.ytimg.com/vi/9cYRdJPLuAk/maxresdefault.jpg" },
            { id: '10', numOrder: 10, type: SheetContentType.Text, content: "El componente Text también se puede anidar y puede incluir otros componentes Text para crear bloques de texto complejos." },
            { id: '11', numOrder: 11, type: SheetContentType.Text, content: "Ejemplo de uso de Text: \n\n```javascript\n<Text style={{fontSize: 20, color: 'blue'}}>\n  Hello, <Text style={{fontWeight: 'bold'}}>World!</Text>\n</Text>\n```" },
            { id: '12', numOrder: 12, type: SheetContentType.YoutubeVideo, content: "oH91OL9zlnc" },
            { id: '13', numOrder: 13, type: SheetContentType.Text, content: "La combinación de View y Text permite crear interfaces de usuario ricas y complejas, manteniendo la simplicidad y eficiencia en el código." },
            { id: '14', numOrder: 14, type: SheetContentType.Image, content: "https://i.ytimg.com/vi/9cYRdJPLuAk/maxresdefault.jpg" },
            { id: '15', numOrder: 15, type: SheetContentType.Text, content: "React Native ofrece una amplia gama de otros componentes nativos que se pueden combinar con View y Text para construir aplicaciones completas y funcionales." }
        ],
        prev: null,
        next: null,
    },
];
