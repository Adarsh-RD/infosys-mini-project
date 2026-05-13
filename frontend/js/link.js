const API = "http://localhost:5000/api";
const token = localStorage.getItem("token");

const selectedIdentities = {};

/* ===============================
   Toggle identity selection
================================ */
function toggleIdentity(type, el) {
  if (selectedIdentities[type]) {
    delete selectedIdentities[type];
    el.classList.remove("selected");
    document.getElementById(`form-${type}`)?.remove();
  } else {
    selectedIdentities[type] = {};
    el.classList.add("selected");
    renderIssuerForm(type);
  }
}

/* ===============================
   Render issuer-specific forms
================================ */
function renderIssuerForm(type) {
  const container = document.getElementById("issuerForms");
  let html = "";

  if (type === "AADHAAR") {
    html = `
      <div id="form-AADHAAR" class="border rounded p-3 mb-3">
        <h6>Aadhaar (UIDAI Verification)</h6>
        <input class="form-control mb-2" placeholder="12-digit Aadhaar"
          onchange="selectedIdentities.AADHAAR.value=this.value">
        <select class="form-select mb-2"
          onchange="selectedIdentities.AADHAAR.otp=this.value==='true'">
          <option value="">OTP Verification</option>
          <option value="true">OTP Passed</option>
          <option value="false">OTP Failed</option>
        </select>
        <select class="form-select"
          onchange="selectedIdentities.AADHAAR.bio=this.value==='true'">
          <option value="">Biometric Verification</option>
          <option value="true">Biometric Passed</option>
          <option value="false">Biometric Failed</option>
        </select>
      </div>`;
  }

  if (type === "PHONE") {
    html = `
      <div id="form-PHONE" class="border rounded p-3 mb-3">
        <h6>Phone (Telco Verification)</h6>
        <input class="form-control mb-2" placeholder="10-digit phone"
          onchange="selectedIdentities.PHONE.value=this.value">
        <select class="form-select"
          onchange="selectedIdentities.PHONE.otp=this.value==='true'">
          <option value="">SIM OTP Verification</option>
          <option value="true">OTP Passed</option>
          <option value="false">OTP Failed</option>
        </select>
      </div>`;
  }

  if (type === "ABHA") {
    html = `
      <div id="form-ABHA" class="border rounded p-3 mb-3">
        <h6>ABHA (ABDM Verification)</h6>
        <input class="form-control mb-2" placeholder="ABHA ID"
          onchange="selectedIdentities.ABHA.value=this.value">
        <select class="form-select"
          onchange="selectedIdentities.ABHA.login=this.value==='true'">
          <option value="">Health ID Login</option>
          <option value="true">Login Successful</option>
          <option value="false">Login Failed</option>
        </select>
      </div>`;
  }

  if (type === "DIGILOCKER") {
    html = `
      <div id="form-DIGILOCKER" class="border rounded p-3 mb-3">
        <h6>DigiLocker (MeitY Verification)</h6>
        <input class="form-control mb-2" placeholder="DigiLocker Username"
          onchange="selectedIdentities.DIGILOCKER.value=this.value">
        <select class="form-select"
          onchange="selectedIdentities.DIGILOCKER.sso=this.value==='true'">
          <option value="">Govt SSO Authentication</option>
          <option value="true">SSO Passed</option>
          <option value="false">SSO Failed</option>
        </select>
      </div>`;
  }

  container.insertAdjacentHTML("beforeend", html);
}

/* ===============================
   Link identities (backend-driven)
================================ */
function linkSelectedIdentities() {
  const resultBox = document.getElementById("linkResultBox");
  resultBox.classList.add("d-none");
  resultBox.innerHTML = "";

  const identities = Object.keys(selectedIdentities).map(type => ({
    identityType: type,
    identityValue: selectedIdentities[type].value,
    otpPassed:
      selectedIdentities[type].otp ||
      selectedIdentities[type].login ||
      selectedIdentities[type].sso,
    biometricPassed: selectedIdentities[type].bio ?? true
  }));

  if (identities.length === 0) {
    showResult("Please select at least one identity.");
    return;
  }

  fetch(`${API}/link/do`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ identities })
  })
    .then(r => r.json())
    .then(data => {
      if (!data.success) {
        showResult(data.message || "Linking failed");
        return;
      }

      const messages = data.details.map(d => {
    return `${d.identityType}: ${d.message}`;
      });

      showResult(messages.join("<br>"));
    })
    .catch(() => {
      showResult("Server or network error");
    });
}

function showResult(message) {
  const box = document.getElementById("linkResultBox");
  const lines = message.split("<br>");

  box.innerHTML = `
    <div class="fw-semibold mb-2">Linking Status</div>
    ${lines
      .map(
        line => `
        <div class="link-result-item">
          <span class="link-dot"></span>
          <span>${line}</span>
        </div>`
      )
      .join("")}
  `;
  box.classList.remove("d-none");
}
