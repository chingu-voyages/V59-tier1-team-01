let flashcardsData = [];
let currentQuestions = [];
let currentIndex = 0;

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
    `Question ${currentIndex + 1} of ${currentQuestions.length}`;

  document.getElementById("question_text").textContent = q.question;

  const container = document.getElementById("options_container");
  container.innerHTML = "";

  Object.entries(q.options).forEach(([letter, text]) => {
    const label = document.createElement("label");
    label.className = "option_row";

    label.innerHTML = `
      <input type="radio" name="answer" value="${letter}">
      ${letter}) ${text}
    `;

    container.appendChild(label);
  });
}

// Back to home
function goHome() {
  window.location.href = "/";
}

// Run when page has fully loaded
document.addEventListener("DOMContentLoaded", async () => {
  const { role } = getSelections();

  await loadFlashcards();

  currentQuestions = getQuestionsForRole(role);
  // Pick a random question each time
  currentIndex = Math.floor(Math.random() * currentQuestions.length);

  showQuestion();

  document.querySelector(".back_button").addEventListener("click", goHome);
});
