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
      highlightSelectedRole(panelOptions, roleItem);
    });

    panelOptions.appendChild(roleItem);
  });
}

// Highlight the selected role
function highlightSelectedRole(panelOptions, selectedItem) {
  const allOptions = panelOptions.querySelectorAll(".option_item");
  
  allOptions.forEach(option => {
    option.classList.remove("selected");
  });
  selectedItem.classList.add("selected");
}

// Run when page has fully loaded
document.addEventListener("DOMContentLoaded", () => {
  loadFlashcards();
  const selectRoleButton = document.querySelector(".role_button");
  // Click handler to show roles
  selectRoleButton.addEventListener("click", showRoles);
});
