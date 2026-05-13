// frontend/js/logout.js
function logout(){
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  alert("Logged out");
  window.location.href = "login.html";
}
