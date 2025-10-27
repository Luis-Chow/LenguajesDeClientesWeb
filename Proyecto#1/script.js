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
    
    //FUNCIONES PURAS PARA OPERACIONES MATEMÁTICAS
    
    const matrixMath = {
        //A + B
        add: (A, B) => A.map((row, i) => row.map((val, j) => val + B[i][j])),
        
        //A - B
        subtract: (A, B) => A.map((row, i) => row.map((val, j) => val - B[i][j])),

        //A × B
        multiply: (A, B) => {
            const size = A.length;
            const C = Array(size).fill(0).map(() => Array(size).fill(0));
            for (let i = 0; i < size; i++) {
                for (let j = 0; j < size; j++) {
                    for (let k = 0; k < size; k++) {
                        C[i][j] += A[i][k] * B[k][j];
                    }
                }
            }
            return C;
        },

        //k × A
        multiplyScalar: (k, A) => A.map(row => row.map(val => val * k)),

        //A^t
        transpose: (A) => A[0].map((_, colIndex) => A.map(row => row[colIndex])),

        //In
        identity: (n) => Array(n).fill(0).map((_, i) => Array(n).fill(0).map((__, j) => (i === j ? 1 : 0))),
        
        //det(A) usando expansión por cofactores (recursivo)
        determinant: (A) => {
            const n = A.length;
            if (n === 2) return A[0][0] * A[1][1] - A[0][1] * A[1][0];
            
            let det = 0;
            for (let j = 0; j < n; j++) {
                const subMatrix = A.slice(1).map(row => row.filter((_, colIndex) => colIndex !== j));
                det += ((-1) ** j) * A[0][j] * matrixMath.determinant(subMatrix);
            }
            return det;
        },
        
        //A^-1 usando el método de la adjunta
        inverse: (A) => {
            const n = A.length;
            const det = matrixMath.determinant(A);
            if (Math.abs(det) < 1e-10) { // Validar que el determinante no sea cero
                throw new Error("La matriz no es invertible (determinante es cero).");
            }

            //Calcular matriz de cofactores
            const cofactors = Array(n).fill(0).map(() => Array(n).fill(0));
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    const subMatrix = A.filter((_, rowIndex) => i !== rowIndex)
                                       .map(row => row.filter((_, colIndex) => j !== colIndex));
                    cofactors[i][j] = ((-1) ** (i + j)) * matrixMath.determinant(subMatrix);
                }
            }

            //Calcular adjunta (transpuesta de la de cofactores)
            const adjugate = matrixMath.transpose(cofactors);

            //Inversa = (1/det(A)) * Adj(A)
            return matrixMath.multiplyScalar(1 / det, adjugate);
        }
    };

    const handleOperation = (op) => {
        try {
            const A = readMatrixFromGrid(gridA, currentSize);
            let B, k, result, title;

            switch(op) {
                case 'add':
                    B = readMatrixFromGrid(gridB, currentSize);
                    result = matrixMath.add(A, B);
                    title = "Resultado de A + B";
                    break;
                case 'subtract':
                    B = readMatrixFromGrid(gridB, currentSize);
                    result = matrixMath.subtract(A, B);
                    title = "Resultado de A - B";
                    break;
                case 'multiply':
                    B = readMatrixFromGrid(gridB, currentSize);
                    result = matrixMath.multiply(A, B);
                    title = "Resultado de A × B";
                    break;
                case 'multiply-scalar':
                    k = parseFloat(document.getElementById('scalar-input').value);
                    if (isNaN(k)) throw new Error("El valor del escalar 'k' no es válido.");
                    result = matrixMath.multiplyScalar(k, A);
                    title = `Resultado de ${k} × A`;
                    break;
                case 'transpose':
                    result = matrixMath.transpose(A);
                    title = "Matriz Transpuesta Aᵀ";
                    break;
                case 'determinant':
                    result = matrixMath.determinant(A);
                    title = "Determinante de A";
                    break;
                case 'inverse':
                    const A_inv = matrixMath.inverse(A);
                    const verification = matrixMath.multiply(A, A_inv);
                    displayResult(A_inv, "Matriz Inversa A⁻¹");
                    //Añadir la verificación A × A^-1 = I
                    displayResult(verification, "Verificación: A × A⁻¹ (debería ser la Identidad)");
                    return; //Salir para evitar doble renderizado
                case 'identity':
                    result = matrixMath.identity(currentSize);
                    title = `Matriz Identidad I${currentSize}`;
                    break;
            }
            displayResult(result, title);
        } catch (error) {
            displayError(error.message);
        }
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