let flashcardsData = [];
let currentQuestions = [];
let currentIndex = 0;

let attemptsLeft = 2;
let correctCount = 0;
let wrongCount = 0;
let questionsShown = 0;

const MAX_QUESTIONS = 5;

// Get selections from chosen options
function getSelections() {
  const params = new URLSearchParams(window.location.search);
  return {
    role: params.get("role"),
    tier: params.get("tier"),
    topic: params.get("topic")
  };
}

// Load JSON file
async function loadFlashcards() {
  const res = await fetch("flashcards.json");
  flashcardsData = await res.json();
}

// Get questions
function getQuestionsForRole(roleName) {
  const roleData = flashcardsData.find(r => r.role === roleName);
  return roleData ? roleData.flashcards : [];
}

// Show question and options
function showQuestion() {
  if (!currentQuestions.length) return;

  const q = currentQuestions[currentIndex];

  document.getElementById("question_progress").textContent =
    `Question ${questionsShown + 1} of ${MAX_QUESTIONS}`;

  document.getElementById("question_text").textContent = q.question;

  document.getElementById("attempts_text").textContent =
    `Attempts left: ${attemptsLeft}`;

  const container = document.getElementById("options_container");
  container.innerHTML = "";

  Object.entries(q.options).forEach(([letter, text]) => {
    const label = document.createElement("label");
    label.className = "option_row";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "answer";
    input.value = letter;

    const textNode = document.createTextNode(` ${letter}) ${text}`);

    label.appendChild(input);
    label.appendChild(textNode);

    container.appendChild(label);
  });
}

// Move to next question
function nextQuestion() {
  questionsShown++;

  if (questionsShown >= MAX_QUESTIONS) {
    showFinalScore();
    return;
  }

  attemptsLeft = 2;

  // pick another random question
  currentIndex = Math.floor(Math.random() * currentQuestions.length);

  showQuestion();
}

// Handle answer submission
function submitAnswer() {
  const selected = document.querySelector('input[name="answer"]:checked');
  if (!selected) return;

  const q = currentQuestions[currentIndex];
  const chosen = selected.value;

  if (chosen === q.answer) {
    correctCount++;

    alert(
      "Correct!\n\n" +
      "Explanation:\n" +
      q.rationale
    );

    nextQuestion();
  } else {
    attemptsLeft--;

    if (attemptsLeft <= 0) {
      wrongCount++;

      alert(
        "Out of attempts.\n\n" +
        `Correct answer: ${q.answer}\n\n` +
        "Explanation:\n" +
        q.rationale
      );

      nextQuestion();
    } else {
      document.getElementById("attempts_text").textContent =
        `Attempts left: ${attemptsLeft}`;
    }
  }
}

// Show final score screen
function showFinalScore() {
  const container = document.getElementById("interview_container");

  const percent = Math.round((correctCount / MAX_QUESTIONS) * 100);

  container.innerHTML = `
    <h2>Interview Complete</h2>
    <h3>Results:</h3>

    <p>Correct: ${correctCount}</p>
    <p>Wrong: ${wrongCount}</p>
    <p>Total: ${MAX_QUESTIONS}</p>
    <p><strong>Percent: ${percent}%</strong></p>

    <div style="margin-top:20px;">
      <button onclick="window.location.href='/'">Back to Home</button>
    </div>
  `;
}

// Run when page has fully loaded
document.addEventListener("DOMContentLoaded", async () => {
  const { role } = getSelections();

  await loadFlashcards();

  currentQuestions = getQuestionsForRole(role);

  currentIndex = Math.floor(Math.random() * currentQuestions.length);

  showQuestion();

  document
    .getElementById("submit_answer")
    .addEventListener("click", submitAnswer);

  document
    .querySelector(".back_button")
    .addEventListener("click", goHome);
});
