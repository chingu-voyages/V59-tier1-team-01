// login + landing page navigation
function goGuest() {
  window.location.href = "index.html";
}

function goLogin() {
  window.location.href = "login.html";
}

function submitLogin() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (email.length === 0 || password.length === 0) {
    alert("Please enter email and password");
    return;
  }

  window.location.href = "index.html";
}
