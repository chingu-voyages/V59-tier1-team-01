let flashcardsData = [];
let currentQuestions = [];
let currentIndex = 0;

let attemptsLeft = 2;
let correctCount = 0;
let wrongCount = 0;
let questionsShown = 0;
let pendingContinueAction = null;
let interviewComplete = false;
let feedbackReturnTo = "interview";
const answerHistory = [];

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

function goHome() {
  window.location.href = "index.html";
}

// Show/hide screens
function showScreen(screenName) {
  const interviewScreen = document.getElementById("interview_screen");
  const resultsScreen = document.getElementById("results_screen");
  const feedbackScreen = document.getElementById("feedback_screen");

  if (!interviewScreen || !resultsScreen || !feedbackScreen) return;

  interviewScreen.classList.toggle("hidden", screenName !== "interview");
  resultsScreen.classList.toggle("hidden", screenName !== "results");
  feedbackScreen.classList.toggle("hidden", screenName !== "feedback");
}

function updateViewFeedbackButtons() {
  const enabled = answerHistory.length > 0;

  const viewFeedbackButton = document.getElementById("view_feedback_button");
  if (viewFeedbackButton) viewFeedbackButton.disabled = !enabled;

  const resultsViewFeedbackButton = document.getElementById("results_view_feedback_button");
  if (resultsViewFeedbackButton) resultsViewFeedbackButton.disabled = !enabled;
}

// Feedback message
function clearFeedback() {
  const feedback = document.getElementById("answer_feedback");
  if (!feedback) return;

  feedback.classList.add("hidden");
  feedback.classList.remove("success", "error", "info");
  feedback.innerHTML = "";
  setContinueAction(null);
}

function setAnswerInputsDisabled(disabled) {
  document
    .querySelectorAll('input[name="answer"]')
    .forEach(input => {
      input.disabled = disabled;
    });
}

function setContinueAction(action) {
  pendingContinueAction = typeof action === "function" ? action : null;

  const continueButton = document.getElementById("continue_button");
  if (!continueButton) return;

  continueButton.disabled = pendingContinueAction === null;
}

function handleContinueClick() {
  if (typeof pendingContinueAction !== "function") return;

  const action = pendingContinueAction;
  clearFeedback();
  action();
}

// Record the final answer
function recordFinalAnswer(q, chosenLetter, isCorrect) {
  answerHistory.push({
    number: questionsShown + 1,
    question: q.question,
    chosenLetter,
    chosenText: q.options?.[chosenLetter] ?? "",
    correctLetter: q.answer,
    correctText: q.options?.[q.answer] ?? "",
    rationale: q.rationale ?? "",
    isCorrect
  });

  updateViewFeedbackButtons();
}

// Render feedback screen with answer history
function renderFeedbackScreen() {
  const summary = document.getElementById("feedback_summary");
  const list = document.getElementById("feedback_list");
  if (!summary || !list) return;

  const correct = answerHistory.filter(x => x.isCorrect).length;
  const wrong = answerHistory.length - correct;
  summary.textContent = `Answered: ${answerHistory.length}. Correct: ${correct}. Wrong: ${wrong}.`;

  if (answerHistory.length === 0) {
    list.innerHTML = "<p>No answers yet.</p>";
    return;
  }

  list.innerHTML = answerHistory
    .map(item => {
      const badgeClass = item.isCorrect ? "correct" : "wrong";
      const badgeText = item.isCorrect ? "Correct" : "Wrong";
      const chosenLine = `Your answer: ${item.chosenLetter}) ${item.chosenText}`;
      const correctLine = `Correct answer: ${item.correctLetter}) ${item.correctText}`;
      const explanation = item.rationale ? `Explanation:\n${item.rationale}` : "";

      return `
        <div class="feedback_item">
          <div class="feedback_item_header">
            <span class="feedback_badge ${badgeClass}">${badgeText}</span>
            <span>Question ${item.number}</span>
          </div>
          <div class="feedback_q">${item.question}</div>
          <p class="feedback_kv">${chosenLine}</p>
          <p class="feedback_kv">${correctLine}</p>
          ${explanation ? `<p class="feedback_kv">${explanation}</p>` : ""}
        </div>
      `;
    })
    .join("");
}

function showFeedbackScreen(returnTo) {
  feedbackReturnTo = returnTo;
  renderFeedbackScreen();
  showScreen("feedback");
}

function handleFeedbackBack() {
  if (feedbackReturnTo === "results") {
    showScreen("results");
    return;
  }
  showScreen("interview");
}

// Show feedback message
function showFeedback(title, message, tone = "info", continueHandler = null) {
  const feedback = document.getElementById("answer_feedback");
  if (!feedback) return;

  const hasContinue = typeof continueHandler === "function";

  feedback.classList.remove("hidden", "success", "error", "info");
  feedback.classList.add(tone);
  feedback.innerHTML = `
    <p class="feedback_title">${title}</p>
    <p class="feedback_message">${message}</p>
  `;

  if (hasContinue) {
    document.getElementById("submit_answer").disabled = true;
    setAnswerInputsDisabled(true);
    setContinueAction(continueHandler);
    return;
  }

  setContinueAction(null);
  document.getElementById("submit_answer").disabled = false;
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
  showScreen("interview");
  clearFeedback();
  document.getElementById("submit_answer").disabled = false;

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

  setAnswerInputsDisabled(false);
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
  if (!selected) {
    showFeedback("Select an answer first", "Pick one option before submitting.", "info");
    return;
  }

  const q = currentQuestions[currentIndex];
  const chosen = selected.value;

  if (chosen === q.answer) {
    correctCount++;
    recordFinalAnswer(q, chosen, true);
    showFeedback("Correct", q.rationale, "success", nextQuestion);
  } else {
    attemptsLeft--;
    document.getElementById("attempts_text").textContent =
      `Attempts left: ${attemptsLeft}`;

    if (attemptsLeft <= 0) {
      wrongCount++;
      recordFinalAnswer(q, chosen, false);
      const message = `Correct answer: ${q.answer}\n\n${q.rationale}`;
      showFeedback("Out of attempts", message, "error", nextQuestion);
    } else {
      showFeedback("Not quite", `Try again. Attempts left: ${attemptsLeft}.`, "error");
    }
  }
}

// Show final score screen
function showFinalScore() {
  const percent = Math.round((correctCount / MAX_QUESTIONS) * 100);
  interviewComplete = true;

  const resultsCorrect = document.getElementById("results_correct");
  const resultsWrong = document.getElementById("results_wrong");
  const resultsTotal = document.getElementById("results_total");
  const resultsPercent = document.getElementById("results_percent");

  if (resultsCorrect) resultsCorrect.textContent = String(correctCount);
  if (resultsWrong) resultsWrong.textContent = String(wrongCount);
  if (resultsTotal) resultsTotal.textContent = String(MAX_QUESTIONS);
  if (resultsPercent) resultsPercent.textContent = String(percent);

  setContinueAction(null);
  showScreen("results");

  updateViewFeedbackButtons();
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

  document
    .getElementById("continue_button")
    .addEventListener("click", handleContinueClick);

  document
    .getElementById("view_feedback_button")
    .addEventListener("click", () => showFeedbackScreen("interview"));

  document
    .getElementById("results_view_feedback_button")
    .addEventListener("click", () => showFeedbackScreen("results"));

  document
    .getElementById("results_home_button")
    .addEventListener("click", goHome);

  document
    .getElementById("feedback_home_button")
    .addEventListener("click", goHome);

  document
    .getElementById("feedback_back_button")
    .addEventListener("click", handleFeedbackBack);

  updateViewFeedbackButtons();
});
