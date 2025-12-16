// Helper: Round a number to a given number of decimal places (standard rounding)
function roundToDecimalPlaces(num, places) {
    const factor = Math.pow(10, places);
    return Math.round(num * factor) / factor;
}

// Generate plausible wrong answers (±1 in the target decimal place)
function generateDistractors(correct, places) {
    const step = Math.pow(10, -places);
    const offsets = [-2, -1, 1, 2];
    const distractors = new Set();
    while (distractors.size < 3) {
        const offset = offsets[Math.floor(Math.random() * offsets.length)];
        const wrong = parseFloat((correct + offset * step).toFixed(places > 4 ? 5 : places));
        // Avoid duplicates and negative numbers
        if (wrong > 0 && wrong !== correct) {
            distractors.add(wrong);
        }
    }
    return Array.from(distractors);
}

// Define place values
const decimalPlaces = [
    { name: "tenth", places: 1 },
    { name: "hundredth", places: 2 },
    { name: "thousandth", places: 3 },
    { name: "ten-thousandth", places: 4 }
];

// Generate 10 questions
const questions = [];
for (let i = 0; i < 10; i++) {
    // Random decimal between 0.0001 and 99.9999
    const number = parseFloat((Math.random() * 100).toFixed(5));
    const place = decimalPlaces[Math.floor(Math.random() * decimalPlaces.length)];
    const correct = roundToDecimalPlaces(number, place.places);
    const distractors = generateDistractors(correct, place.places);
    const options = [correct, ...distractors].map(n => parseFloat(n.toFixed(place.places > 4 ? 5 : place.places)));
    
    // Shuffle options
    for (let j = options.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        [options[j], options[k]] = [options[k], options[j]];
    }

    questions.push({
        number: number,
        placeName: place.name,
        places: place.places,
        correctAnswer: correct,
        options: options
    });
}

let currentQuestionIndex = 0;
let score = 0;
let correctSound, wrongSound;

// Audio setup
function initAudio() {
    correctSound = new Audio('assets/brass-fanfare-reverberated-146263.mp3');
    wrongSound = new Audio('assets/cartoon-fail-trumpet-278822.mp3');
    correctSound.load();
    wrongSound.load();
}

function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(id).classList.add('active');
}

function startGame() {
    currentQuestionIndex = 0;
    score = 0;
    switchScreen('quiz-screen');
    loadQuestion();
}

function loadQuestion() {
    if (currentQuestionIndex >= questions.length) {
        gameOver();
        return;
    }

    const q = questions[currentQuestionIndex];
    document.getElementById('question-number').textContent = `Question ${currentQuestionIndex + 1}/${questions.length}`;
    document.getElementById('instruction-text').textContent = 
        `Round the number below to the nearest ${q.placeName}:`;
    
    // Display original number with enough precision
    const displayNumber = q.number.toFixed(Math.max(5, q.places + 1));
    document.getElementById('decimal-to-round').textContent = displayNumber;

    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';

    q.options.forEach(option => {
        const button = document.createElement('button');
        button.classList.add('option-button');
        // Format answer to match expected decimal places
        const formatted = option.toFixed(q.places);
        button.textContent = formatted;
        button.onclick = () => selectOption(button, formatted, q.correctAnswer.toFixed(q.places));
        optionsContainer.appendChild(button);
    });
}

function selectOption(selectedButton, selectedAnswer, correctAnswer) {
    document.querySelectorAll('.option-button').forEach(btn => {
        btn.disabled = true;
        if (btn.textContent === correctAnswer) {
            btn.classList.add('correct');
        } else if (btn === selectedButton) {
            btn.classList.add('incorrect');
        }
    });

    if (selectedAnswer === correctAnswer) {
        score++;
        correctSound.currentTime = 0;
        correctSound.play().catch(e => console.log("Correct sound:", e.message));
    } else {
        wrongSound.currentTime = 0;
        wrongSound.play().catch(e => console.log("Wrong sound:", e.message));
    }

    setTimeout(() => {
        currentQuestionIndex++;
        loadQuestion();
    }, 1300);
}

function gameOver() {
    document.getElementById('final-score').textContent = `You scored ${score} out of ${questions.length}!`;
    switchScreen('game-over-screen');
}

function restartGame() {
    switchScreen('start-screen');
}

document.addEventListener('DOMContentLoaded', () => {
    initAudio();
    switchScreen('start-screen');
});