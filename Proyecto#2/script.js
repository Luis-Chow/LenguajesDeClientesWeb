document.addEventListener("DOMContentLoaded", () => {
    // ---REFERENCIAS A ELEMENTOS DEL DOM---
    const views = {
        setup: document.getElementById("setup-view"),
        loading: document.getElementById("loading-view"),
        game: document.getElementById("game-view"),
        results: document.getElementById("results-view"),
    };
    
    const setupForm = document.getElementById("setup-form");
    const setupError = document.getElementById("setup-error");
    const playerNameInput = document.getElementById("player-name");
    const questionAmountInput = document.getElementById("question-amount");
    const difficultySelect = document.getElementById("difficulty");
    const categorySelect = document.getElementById("category");

    const gameProgress = document.getElementById("game-progress");
    const gameScore = document.getElementById("game-score");
    const timerText = document.getElementById("timer-text");
    const timerBar = document.getElementById("timer-bar");
    const questionText = document.getElementById("question-text");
    const answerOptions = document.getElementById("answer-options");

    const resultsPlayerName = document.getElementById("results-player-name");
    const resultsScore = document.getElementById("results-score");
    const resultsCorrect = document.getElementById("results-correct");
    const resultsAccuracy = document.getElementById("results-accuracy");
    const resultsAvgTime = document.getElementById("results-avg-time");
    
    const restartSameBtn = document.getElementById("restart-same-btn");
    const restartNewBtn = document.getElementById("restart-new-btn");

    // ---ESTADO DEL JUEGO---
    let gameSettings = {
        playerName: "",
        amount: 10,
        difficulty: "medium",
        category: "any",
    };
    
    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let timerInterval = null;
    let timeLeft = 20;
    let questionStartTime = 0;
    let answerTimes = [];

    // ---NAVEGACION ENTRE VISTAS ---
    function showView(viewName) {
        Object.values(views).forEach(view => view.style.display = "none");
        if (views[viewName]) {
            views[viewName].style.display = "block";
        }
    }

    // ---DECODIFICAR TEXTO HTML---
    function decodeHTML(html) {
        const txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    }

    // ---BARAJAR UN ARRAY---
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // ---1. INICIALIZACION: CARGAR CATEGORIAS ---
    async function fetchCategories() {
        try {
            const response = await fetch("https://opentdb.com/api_category.php");
            if (!response.ok) throw new Error("No se pudieron cargar las categorías.");
            const data = await response.json();
            
            data.trivia_categories.sort((a, b) => a.name.localeCompare(b.name));

            data.trivia_categories.forEach(category => {
                const option = document.createElement("option");
                option.value = category.id;
                option.textContent = decodeHTML(category.name);
                categorySelect.appendChild(option);
            });
        } catch (error) {
            console.error("Error al cargar categorías:", error);
            setupError.textContent = "Error al cargar categorías. Inténtalo de nuevo.";
        }
    }

    // ---2. CONFIGURACION DEL JUEGO---
    setupForm.addEventListener("submit", (e) => {
        e.preventDefault();
        //Validaciones
        const name = playerNameInput.value.trim();
        const amount = parseInt(questionAmountInput.value);

        if (name.length < 2 || name.length > 20) {
            setupError.textContent = "El nombre debe tener entre 2 y 20 caracteres.";
            return;
        }
        if (amount < 5 || amount > 20) {
            setupError.textContent = "La cantidad de preguntas debe ser entre 5 y 20.";
            return;
        }

        //Guardar configuracion
        gameSettings = {
            playerName: name,
            amount: amount,
            difficulty: difficultySelect.value,
            category: categorySelect.value,
        };
        
        setupError.textContent = "";
        startGame();
    });

    // ---3. INICIAR EL JUEGO---
    function startGame() {
        questions = [];
        currentQuestionIndex = 0;
        score = 0;
        correctCount = 0;
        incorrectCount = 0;
        answerTimes = [];
        
        showView("loading");
        fetchQuestions();
    }

    // ---4. OBTENER PREGUNTAS---
    async function fetchQuestions() {
        let apiUrl = `https://opentdb.com/api.php?amount=${gameSettings.amount}&difficulty=${gameSettings.difficulty}&type=multiple`;
        if (gameSettings.category !== "any") {
            apiUrl += `&category=${gameSettings.category}`;
        }

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error("Error de red con la API.");
            
            const data = await response.json();
            
            if (data.response_code !== 0) {
                throw new Error("No se encontraron preguntas para esta configuración. Prueba con 'Mixtas'.");
            }

            questions = data.results;
            showView("game");
            displayQuestion();

        } catch (error) {
            console.error("Error al obtener preguntas:", error);
            showView("setup");
            setupError.textContent = error.message;
        }
    }

    // ---5. MOSTRAR PREGUNTA ACTUAL---
    function displayQuestion() {
        if (currentQuestionIndex >= questions.length) {
            showResults();
            return;
        }

        const question = questions[currentQuestionIndex];
        
        //Actualizar UI
        gameProgress.textContent = `Pregunta ${currentQuestionIndex + 1} de ${gameSettings.amount}`;
        gameScore.textContent = `Puntuación: ${score}`;
        questionText.textContent = decodeHTML(question.question);

        //Preparar y barajar respuestas
        const answers = [...question.incorrect_answers, question.correct_answer];
        shuffleArray(answers);

        //Limpiar opciones anteriores
        answerOptions.innerHTML = "";

        //Crear botones de respuesta
        answers.forEach(answer => {
            const button = document.createElement("button");
            button.innerHTML = decodeHTML(answer);
            button.className = "btn-answer";
            
            if (answer === question.correct_answer) {
                button.dataset.correct = "true";
            }
            
            button.addEventListener("click", handleAnswerClick);
            answerOptions.appendChild(button);
        });

        //Iniciar temporizador
        questionStartTime = Date.now();
        startTimer();
    }

    // ---6. MANEJO DEL TEMPORIZADOR (ASINCRONO)---
    function startTimer() {
        timeLeft = 20;
        updateTimerDisplay();
        
        // Asegurarse de que la barra tenga el color correcto al inicio
        timerBar.classList.add("timer-ok");
        timerBar.classList.remove("timer-low");

        clearInterval(timerInterval); // Limpiar cualquier temporizador anterior

        //Usamos setInterval para actualizar el temporizador cada segundo
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();

            //Advertencia visual
            if (timeLeft <= 5 && timeLeft > 0) {
                timerText.classList.add("timer-warning");
            }

            //Tiempo agotado
            if (timeLeft <= 0) {
                handleTimeout();
            }
        }, 1000);
    }
    
    function stopTimer() {
        clearInterval(timerInterval);
        timerText.classList.remove("timer-warning");
    }
    
    function updateTimerDisplay() {
        timerText.textContent = timeLeft;
        const percentage = (timeLeft / 20) * 100;
        timerBar.style.width = `${percentage}%`;
        
        if (timeLeft <= 5) {
            timerBar.classList.remove("timer-ok");
            timerBar.classList.add("timer-low");
        } else {
            timerBar.classList.remove("timer-low");
            timerBar.classList.add("timer-ok");
        }
    }

    function handleTimeout() {
        stopTimer();
        incorrectCount++;
        answerTimes.push(20);
        
        // Deshabilitar botones y mostrar la correcta
        Array.from(answerOptions.children).forEach(btn => {
            btn.disabled = true;
            if (btn.dataset.correct) {
                btn.classList.add("show-correct"); // Resaltar la correcta
            }
        });

        setTimeout(nextQuestion, 2000); // 2 segundos de feedback
    }

    // ---7. MANEJO DE RESPUESTA (CLICK)---
    function handleAnswerClick(e) {
        stopTimer();
        
        const selectedButton = e.target;
        const isCorrect = selectedButton.dataset.correct === "true";
        const timeTaken = (Date.now() - questionStartTime) / 1000;
        answerTimes.push(parseFloat(timeTaken.toFixed(2))); //Guardar tiempo

        //Deshabilitar todos los botones
        Array.from(answerOptions.children).forEach(btn => {
            btn.disabled = true;
        });

        //Feedback visual
        if (isCorrect) {
            score += 10;
            correctCount++;
            selectedButton.classList.add("correct");
            gameScore.textContent = `Puntuación: ${score}`;
        } else {
            incorrectCount++;
            selectedButton.classList.add("incorrect");
            // Mostrar la correcta
            const correctButton = answerOptions.querySelector('[data-correct="true"]');
            if (correctButton) {
                correctButton.classList.add("show-correct");
            }
        }

        setTimeout(nextQuestion, 1500); // 1.5 segundos de feedback
    }

    // ---8. SIGUIENTE PREGUNTA---
    function nextQuestion() {
        currentQuestionIndex++;
        displayQuestion(); // Esto llamará a showResults si se acaban las preguntas
    }

    // ---9. MOSTRAR RESULTADOS FINALES---
    function showResults() {
        stopTimer();
        showView("results");

        const totalQuestions = gameSettings.amount;
        const accuracy = totalQuestions > 0 ? ((correctCount / totalQuestions) * 100).toFixed(0) : 0;
        const avgTime = answerTimes.length > 0 
            ? (answerTimes.reduce((a, b) => a + b, 0) / answerTimes.length).toFixed(1) 
            : "N/A";

        resultsPlayerName.textContent = `¡Felicidades, ${gameSettings.playerName}!`;
        resultsScore.textContent = `${score} Puntos`;
        resultsCorrect.textContent = `${correctCount} de ${totalQuestions}`;
        resultsAccuracy.textContent = `${accuracy}%`;
        resultsAvgTime.textContent = `${avgTime} seg.`;
    }

    // ---10. BOTONES DE REINICIO---
    restartSameBtn.addEventListener("click", startGame);
    restartNewBtn.addEventListener("click", () => showView("setup"));

    // ---INICIAR LA APP---
    fetchCategories(); // Cargar categorías al inicio
    showView("setup"); // Mostrar la vista de configuración
});