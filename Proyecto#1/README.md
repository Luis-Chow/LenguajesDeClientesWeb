# Calculadora de Matrices Web Interactiva

Proyecto #1 de Lenguajes de Clientes Web del periodo 2025C

Una aplicacion web desarrollada con HTML, CSS y JavaScript puro que permite a los usuarios realizar operaciones matemáticas con matrices cuadradas de tamaño n×n (donde 2 ≤ n ≤ 10).

## Funcionalidades

### Operaciones Soportadas
- **Suma de matrices (A + B)**
- **Resta de matrices (A - B)**
- **Multiplicación de matrices (A × B)**
- **Multiplicación por un escalar (k × A)**
- **Transposición de una matriz (Aᵀ)**
- **Cálculo del Determinante (det(A))**: Implementado mediante expansion por cofactores.
- **Cálculo de la Matriz Inversa (A⁻¹)**: Utiliza el metodo de la matriz adjunta. Incluye una validacion para asegurar que el determinante no sea cero y muestra la comprobacion `A × A⁻¹ = I`.
- **Generacion de la Matriz Identidad (In)**

### Interfaz de Usuario
- **Entrada Manual**: Rellena las matrices directamente en una cuadrícula intuitiva.
- **Generacion Aleatoria**: Popula las matrices con números enteros aleatorios entre -10 y 10.
- **Carga de Ejemplos**: Rellena una matriz con datos de ejemplo para pruebas rápidas.
- **Limpieza de Entradas**: Botones para reiniciar los valores de las matrices.
- **Diseño Responsivo**: La interfaz se adapta a diferentes tamaños de pantalla.

## 🚀 Cómo Usar

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/Luis-Chow/LenguajesDeClientesWeb.git
   ```
2. **Abre `index.html`:**
   Navega a la carpeta del proyecto y abre el archivo `index.html` en tu navegador web.

## 🛠️ Estructura del Código

El proyecto está organizado en tres archivos principales:
- `index.html`: La estructura semantica de la pagina.
- `style.css`: Los estilos visuales y el diseño responsive.
- `script.js`: Contiene toda la logica funcional, separada en:
    - **Logica de UI**: Funciones para crear y leer las cuadriculas y mostrar resultados.
    - **Funciones Matemáticas Puras**: Un objeto `matrixMath` que contiene todos los algoritmos para las operaciones, sin manipular el DOM.
    - **Manejadores de Eventos**: Conectan las acciones del usuario con la logica correspondiente.