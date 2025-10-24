document.addEventListener('DOMContentLoaded', () => {

    //SELECTORES DEL DOM Y ESTADO INICIAL

    const sizeSelector = document.getElementById('matrix-size');
    const generateBtn = document.getElementById('btn-generate-grids');
    const gridA = document.getElementById('grid-a');
    const gridB = document.getElementById('grid-b');
    const resultDisplay = document.getElementById('result-display');
    const operationsPanel = document.getElementById('operations');
    const matrixActions = document.querySelector('#matrix-inputs');

    let currentSize = 3;

    //LOGICA DE LA INTERFAZ
   
    const createMatrixGrid = (container, size) => {
        container.innerHTML = ''; // Limpiar cuadricula anterior
        container.style.setProperty('--matrix-size', size);
        for (let i = 0; i < size * size; i++) {
            const input = document.createElement('input');
            input.type = 'number';
            input.placeholder = '0';
            container.appendChild(input);
        }
    };

    const readMatrixFromGrid = (gridElement, size) => {
        const matrix = [];
        const inputs = gridElement.querySelectorAll('input');
        if (inputs.length !== size * size) throw new Error("La cuadrícula de la matriz no está completa.");
        
        let k = 0;
        for (let i = 0; i < size; i++) {
            const row = [];
            for (let j = 0; j < size; j++) {
                const value = parseFloat(inputs[k++].value);
                if (isNaN(value)) {
                    throw new Error(`Entrada inválida en la fila ${i + 1}, columna ${j + 1}. Solo se permiten números.`);
                }
                row.push(value);
            }
            matrix.push(row);
        }
        return matrix;
    };
    
    const displayResult = (result, title) => {
        resultDisplay.innerHTML = `<h3>${title}</h3>`;
        if (typeof result === 'number') {
            resultDisplay.innerHTML += `<p class="scalar-result">${result.toFixed(4)}</p>`;
        } else if (typeof result === 'string') {
             resultDisplay.innerHTML += `<p>${result}</p>`;
        } else { // Es una matriz
            const resultGrid = document.createElement('div');
            resultGrid.className = 'matrix-grid';
            resultGrid.style.setProperty('--matrix-size', result.length);
            result.forEach(row => {
                row.forEach(val => {
                    const cell = document.createElement('div');
                    cell.className = 'result-cell';
                    cell.textContent = val.toFixed(4); // Mostrar con 4 decimales
                    resultGrid.appendChild(cell);
                });
            });
            resultDisplay.appendChild(resultGrid);
        }
    };

    const displayError = (message) => {
        resultDisplay.innerHTML = `<p class="error">Error: ${message}</p>`;
    };
    
    //Inicializacion
    const init = () => {
        for (let i = 2; i <= 10; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `${i} × ${i}`;
            if (i === currentSize) option.selected = true;
            sizeSelector.appendChild(option);
        }
        
        // Crear cuadrículas iniciales
        createMatrixGrid(gridA, currentSize);
        createMatrixGrid(gridB, currentSize);

        generateBtn.addEventListener('click', () => {
            currentSize = parseInt(sizeSelector.value);
            createMatrixGrid(gridA, currentSize);
            createMatrixGrid(gridB, currentSize);
            resultDisplay.innerHTML = '<p>Selecciona una operación para ver el resultado.</p>';
        });
        
        operationsPanel.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                handleOperation(e.target.dataset.op);
            }
        });

        matrixActions.addEventListener('click', (e) => {
            if (!e.target.classList.contains('btn-action')) return;
            
            const targetGrid = e.target.dataset.target === 'a' ? gridA : gridB;
            const action = e.target.dataset.action;
            const inputs = targetGrid.querySelectorAll('input');

            inputs.forEach(input => {
                if (action === 'random') {
                    input.value = Math.floor(Math.random() * 21) - 10; // Enteros entre -10 y 10
                } else if (action === 'clear') {
                    input.value = '';
                } else if (action === 'example') {
                    //Genera una matriz de ejemplo simple
                    input.value = Math.floor(Math.random() * 5) + 1;
                }
            });
        });
    };

    init();
});