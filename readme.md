# 🎰 SorteoGenius

**SorteoGenius** es una aplicación web moderna, elegante y funcional para realizar sorteos aleatorios. Diseñada con una experiencia de usuario de primer nivel, utiliza Inteligencia Artificial para añadir un toque de diversión y personalización a cada resultado.

![Licencia](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)
![Gemini](https://img.shields.io/badge/AI-Google_Gemini-orange?logo=google-gemini)

## ✨ Características Principales

-   **Dualidad de Modos**: 
    -   **Números**: Define un rango (mínimo/máximo) y obtén un ganador al instante.
    -   **Nombres/Frases**: Gestiona listas de participantes personalizadas.
-   **🤖 IA Integrada (Google Gemini)**: Cada ganador viene acompañado de un dato curioso, una felicitación épica o un mensaje divertido generado en tiempo real por el modelo `gemini-2.5-flash`.
-   **🎁 Gestión de Premios**: Configura un premio opcional que se muestra con animaciones especiales al anunciar al ganador.
-   **🔄 Auto-Eliminación**: Opción inteligente para eliminar automáticamente al ganador de la lista de nombres, evitando repeticiones en sorteos múltiples.
-   **📜 Historial Dinámico**: Registro de todos los sorteos realizados durante la sesión con detalles de premios y mensajes de la IA.
-   **📤 Exportación Avanzada**:
    -   **TXT**: Descarga el historial detallado de los sorteos.
    -   **Proyecto ZIP**: Exporta el código fuente completo listo para ser ejecutado localmente con Vite.
-   **🎨 UI/UX Premium**: 
    -   Efectos de sonido (Web Audio API) sincronizados con la animación.
    -   Splash Screen de carga profesional.
    -   Confeti y animaciones de "rebote elástico" para los ganadores.
    -   Diseño responsive y modo oscuro elegante.

## 🚀 Tecnologías Utilizadas

-   **Frontend**: React 19 (Hooks, Context, Refs).
-   **Lenguaje**: TypeScript para un desarrollo robusto y tipado.
-   **Estilos**: Tailwind CSS con animaciones personalizadas y efectos de glassmorphism.
-   **Iconos**: Lucide React.
-   **IA**: `@google/genai` (SDK de Google Generative AI).
-   **Audio**: Web Audio API para generación de sonidos procedurales (sin archivos externos).
-   **Utilidades**: 
    -   `JSZip` para la generación y exportación de archivos comprimidos.
    -   `LocalStorage` para la persistencia de listas de participantes y premios.

## 🛠️ Instalación y Configuración (Local)

Si descargas el proyecto mediante la opción "Exportar Proyecto", sigue estos pasos:

1.  Extrae el archivo ZIP.
2.  Instala las dependencias:
    ```bash
    npm install
    ```
3.  Configura tu clave de API de Google Gemini en un archivo `.env`:
    ```env
    VITE_API_KEY=tu_clave_aqui
    ```
4.  Inicia el servidor de desarrollo:
    ```bash
    npm run dev
    ```
    Nota: Sino tienes una APIKEY no importa, se puede utilizar la APP de todas formas

## 🧠 Detalles de la Integración con IA

La aplicación utiliza el modelo `gemini-2.5-flash` para procesar el valor ganador. El sistema envía un prompt estructurado que varía si el ganador es un número o un nombre, solicitando una respuesta en formato JSON para garantizar una integración fluida con la interfaz.

---

Desarrollado con ❤️ por **Juan**