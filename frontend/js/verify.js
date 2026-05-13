const API = "http://localhost:5000/api";
const token = localStorage.getItem("token");

const selectedIdentities = {};

// Toggle identity selection
// Toggle identity selection
function toggleVerify(type) {
  const card = document.getElementById(`verify-${type}`);
  if (!card) return;

  const existingInput = document.getElementById(`input-${type}`);

  // FIX: If already selected OR input exists in DOM, deselect it
  if (selectedIdentities[type] !== undefined || existingInput) {
    delete selectedIdentities[type];
    if (existingInput) existingInput.remove();
    card.classList.remove("selected");
    return;
  }

  // Select
  selectedIdentities[type] = "";
  card.classList.add("selected");
  renderInput(type);
}

// Render input field
function renderInput(type) {
  if (document.getElementById(`input-${type}`)) return;

  const container = document.getElementById("verifyInputs");

  const div = document.createElement("div");
  div.id = `input-${type}`;
  div.className = "col-md-6";

  div.innerHTML = `
    <label class="fw-bold">${type} Value</label>
    <input
      class="form-control"
      placeholder="Enter ${type}"
      oninput="selectedIdentities['${type}']=this.value"
    />
  `;

  container.appendChild(div);
}

// Run verification
function runVerification() {
  if (!token) {
    alert("Session expired. Please login again.");
    window.location.href = "login.html";
    return;
  }

  const identities = Object.keys(selectedIdentities)
    .filter(k => selectedIdentities[k])
    .map(k => ({
      identityType: k,
      identityValue: selectedIdentities[k]
    }));

  if (identities.length < 2) {
    alert("Please select at least two identities");
    return;
  }

  fetch(`${API}/verify/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ identities })
  })
    .then(res => res.json())
    .then(d => {
      const box = document.getElementById("resultBox");
      box.classList.remove("d-none");

      const title = document.getElementById("resultTitle");
      title.innerText = d.title || "";
      title.style.color = d.belong ? "#16a34a" : "#dc2626";

      document.getElementById("resultMessage").innerText = d.message || "";
      document.getElementById("trustScore").innerText = (d.trustScore ?? 0) + "%";
      document.getElementById("confidenceScore").innerText = d.confidence || "N/A";
      
      let zkpText = "N/A";
      if (d.zkp && d.zkp.proof) {
        // Display the commitment hash as the ZKP representation
        zkpText = typeof d.zkp.proof === 'object' ? d.zkp.proof.commitment : d.zkp.proof;
      }
      document.getElementById("zkpStatus").innerText = zkpText;
    })
    .catch(() => {
      alert("Verification failed. Server error.");
    });
}
