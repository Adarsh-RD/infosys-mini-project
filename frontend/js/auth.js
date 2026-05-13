console.log("AUTH.JS LOADED");

const API_URL = "http://localhost:5000/api/auth";

/* ================= CAPTCHA ================= */
function generateCaptcha() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let cap = "";
  for (let i = 0; i < 5; i++) {
    cap += chars[Math.floor(Math.random() * chars.length)];
  }
  return cap;
}

window.currentCaptcha = generateCaptcha();

window.addEventListener("DOMContentLoaded", () => {
  const captchaText = document.getElementById("captchaText");
  if (captchaText) captchaText.innerText = window.currentCaptcha;

  document.getElementById("refreshCaptcha")?.addEventListener("click", () => {
    window.currentCaptcha = generateCaptcha();
    document.getElementById("captchaText").innerText = window.currentCaptcha;
  });
});

/* ================= SIGNUP ================= */
document.getElementById("signupForm")?.addEventListener("submit", async (e) => {
  e.preventDefault(); // 🔥 MOST IMPORTANT

  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value;
  const consent = document.getElementById("consent").checked;
  const captchaInput = document.getElementById("captchaInput").value.trim();
  const captchaError = document.getElementById("captchaError");

  // CAPTCHA check
  if (captchaInput !== window.currentCaptcha) {
    captchaError.innerText = "Incorrect Captcha. Try again.";
    window.currentCaptcha = generateCaptcha();
    document.getElementById("captchaText").innerText = window.currentCaptcha;
    return;
  }
  captchaError.innerText = "";

  if (!consent) {
    alert("Consent is required to create an account.");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, phone, password, consent })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Signup failed");
      return;
    }

    // Save session
    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.user.id);
    localStorage.setItem("userEmail", data.user.email);
    localStorage.setItem("userPhone", data.user.phone);

    alert("Signup successful!");
    window.location.href = "dashboard.html";

  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    alert("Cannot connect to server");
  }
});

/* ================= LOGIN ================= */
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const emailOrPhone = document.getElementById("emailOrPhone").value.trim();
  const password = document.getElementById("password").value;
  const captchaInput = document.getElementById("captchaInput").value.trim();
  const captchaError = document.getElementById("captchaError");

  // CAPTCHA check
  if (captchaInput !== window.currentCaptcha) {
    captchaError.innerText = "Incorrect Captcha. Try again.";
    window.currentCaptcha = generateCaptcha();
    document.getElementById("captchaText").innerText = window.currentCaptcha;
    return;
  }
  captchaError.innerText = "";

  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailOrPhone, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Login failed");
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.user.id);
    localStorage.setItem("userEmail", data.user.email);
    localStorage.setItem("userPhone", data.user.phone);
    localStorage.setItem("loginTime", new Date().toLocaleString());

    alert("Login successful!");
    window.location.href = "dashboard.html";

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    alert("Cannot connect to server");
  }
});
