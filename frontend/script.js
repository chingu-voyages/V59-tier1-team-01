let flashcardsData = [];

// Variables to store selected options
let selectedRole = null;
let selectedTier = null;
let selectedTopic = null;

// Load flashcards from JSON file
async function loadFlashcards() {
  const res = await fetch("flashcards.json");
  const data = await res.json();
  flashcardsData = data;
}

// Show roles in the selection panel
function showRoles() {
  const panel = document.getElementById("selection_panel");
  const panelTitle = document.getElementById("panel_title");
  const panelOptions = document.getElementById("panel_options");

  panel.classList.remove("hidden");
  panelTitle.textContent = "Select a Role";
  panelOptions.innerHTML = "";

  // Render each role
  flashcardsData.forEach(roleObject => {
    const roleItem = document.createElement("div");
    roleItem.className = "option_item";
    roleItem.textContent = roleObject.role;

    roleItem.addEventListener("click", () => {
      selectedRole = roleObject.role;
      selectedTier = null;
      selectedTopic = null;

      highlightSelected(panelOptions, roleItem);
      updateSelectionText();
      updateButtonState();
    });

    panelOptions.appendChild(roleItem);
  });
}

// Show tier options
function showTiers() {
  if (!selectedRole) return;

  const panel = document.getElementById("selection_panel");
  const panelTitle = document.getElementById("panel_title");
  const panelOptions = document.getElementById("panel_options");

  panel.classList.remove("hidden");
  panelTitle.textContent = "Select a Tier Level";
  panelOptions.innerHTML = "";

  const tiers = ["Tier 1", "Tier 2", "Tier 3"];

  tiers.forEach(tier => {
    const tierItem = document.createElement("div");
    tierItem.className = "option_item";
    tierItem.textContent = tier;

    tierItem.addEventListener("click", () => {
      selectedTier = tier;
      selectedTopic = null;

      highlightSelected(panelOptions, tierItem);
      updateSelectionText();
      updateButtonState();
    });

    panelOptions.appendChild(tierItem);
  });
}

// Show topic options
function showTopics() {
  if (!selectedRole || !selectedTier) return;

  const panel = document.getElementById("selection_panel");
  const panelTitle = document.getElementById("panel_title");
  const panelOptions = document.getElementById("panel_options");

  panel.classList.remove("hidden");
  panelTitle.textContent = "Select a Topic";
  panelOptions.innerHTML = "";

  const topics = ["General", "Behavioral", "Technical"];

  topics.forEach(topic => {
    const topicItem = document.createElement("div");
    topicItem.className = "option_item";
    topicItem.textContent = topic;

    topicItem.addEventListener("click", () => {
      selectedTopic = topic;

      highlightSelected(panelOptions, topicItem);
      updateSelectionText();
      updateButtonState();
    });

    panelOptions.appendChild(topicItem);
  });
}

// Highlight selected option
function highlightSelected(panelOptions, selectedItem) {
  const allOptions = panelOptions.querySelectorAll(".option_item");
  allOptions.forEach(option => option.classList.remove("selected"));
  selectedItem.classList.add("selected");
}

// Update text showing current selections
function updateSelectionText() {
  document.getElementById("selected_role").textContent =
    selectedRole ?? "None";

  document.getElementById("selected_tier").textContent =
    selectedTier ?? "None";

  document.getElementById("selected_topic").textContent =
    selectedTopic ?? "None";
}

// Update buttons based on progress
function updateButtonState() {
  document.querySelector(".tier_button").disabled = !selectedRole;
  document.querySelector(".topic_button").disabled = !selectedTier;
  document.querySelector(".generate_button").disabled =
    !(selectedRole && selectedTier && selectedTopic);
}

// Move to interview/questions page when everything is selected
function startInterview() {
  if (!selectedRole || !selectedTier || !selectedTopic) return;

  const params = new URLSearchParams({
    role: selectedRole,
    tier: selectedTier,
    topic: selectedTopic
  });

  window.location.href = "interview.html?" + params.toString();
}


// Run when page has fully loaded
document.addEventListener("DOMContentLoaded", () => {
  loadFlashcards();
  document.querySelector(".role_button")
    .addEventListener("click", showRoles);

  document.querySelector(".tier_button")
    .addEventListener("click", showTiers);

  document.querySelector(".topic_button")
    .addEventListener("click", showTopics);

  document.querySelector(".generate_button")
    .addEventListener("click", startInterview);

  updateSelectionText();
  updateButtonState();
});
