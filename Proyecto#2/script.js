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

    // ---NAVEGACION ENTRE VISTAS---
    function showView(viewName) {
        Object.values(views).forEach(view => view.style.display = "none");
        if (views[viewName]) {
            views[viewName].style.display = "block";
        }
    }

    // ---FUNCION DE UTILIDAD: DECODIFICAR TEXTO HTML (de la API)---
    function decodeHTML(html) {
        const txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    }

    // ---1. INICIALIZACION: CARGAR CATEGORIAS---
    async function fetchCategories() {
        try {
            const response = await fetch("https://opentdb.com/api_category.php");
            if (!response.ok) throw new Error("No se pudieron cargar las categorías.");
            const data = await response.json();
            
            // Ordenamos categorias alfabéticamente
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

    // ---2. CONFIGURACION DEL JUEGO (SUBMIT DEL FORMULARIO)---
    setupForm.addEventListener("submit", (e) => {
        e.preventDefault();
        // Validaciones
        const name = playerNameInput.value.trim();
        const amount = parseInt(questionAmountInput.value);

        // Guardar configuración
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

    // ---4. OBTENER PREGUNTAS (ASÍNCRONO)---
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
        
        gameProgress.textContent = `Pregunta ${currentQuestionIndex + 1} de ${gameSettings.amount}`;
        gameScore.textContent = `Puntuación: ${score}`;
        questionText.textContent = decodeHTML(question.question);

        const answers = [...question.incorrect_answers, question.correct_answer];
        shuffleArray(answers);

        answerOptions.innerHTML = "";

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
    }

    // ---6.MANEJO DE RESPUESTA (CLICK)---
    function handleAnswerClick(e) {
        
        const selectedButton = e.target;
        const isCorrect = selectedButton.dataset.correct === "true";

        Array.from(answerOptions.children).forEach(btn => {
            btn.disabled = true;
        });

        // Feedback visual
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

        // Siguiente pregunta despues de un delay
        setTimeout(nextQuestion, 1500); // 1.5 segundos de feedback
    }

    // ---INICIAR LA APP---
    fetchCategories(); // Cargar categorias al inicio
    showView("setup"); // Mostrar la vista de configuración
});