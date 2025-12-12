// redirect.js
// This script should be included on your root (/) page, e.g., client/index.html or client/root.html
// It will redirect based on login status

(function() {
  // Check if user is logged in
  const token = localStorage.getItem("token");
  if (token) {
    // If logged in, redirect to main app page
    window.location.href = "index.html";
  } else {
    // If not logged in, redirect to login page
    window.location.href = "login.html";
  }
})();
