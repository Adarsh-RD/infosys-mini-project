const API = "http://localhost:5000/api";
const token = localStorage.getItem("token");

const selectedUnlinks = {};

function toggleUnlink(type, card) {
  const existingEl = document.getElementById(`unlink-${type}`);

  // FIX: If selected in memory OR exists in DOM, remove it (Deselect)
  if (selectedUnlinks[type] || existingEl) {
    if (existingEl) existingEl.remove();
    delete selectedUnlinks[type];
    card.classList.remove("selected");
    return;
  }

  // ✅ Select
  selectedUnlinks[type] = "";
  card.classList.add("selected");

  const container = document.getElementById("unlinkInputs");

  const div = document.createElement("div");
  div.className = "col-md-6";
  div.id = `unlink-${type}`;

  div.innerHTML = `
    <label class="fw-bold">${type} Value</label>
    <input
      class="form-control"
      placeholder="Enter ${type}"
      oninput="selectedUnlinks['${type}']=this.value"
    />
  `;

  container.appendChild(div);
}
function runUnlink() {
  const identities = Object.keys(selectedUnlinks)
    .filter(k => selectedUnlinks[k])
    .map(k => ({
      identityType: k,
      identityValue: selectedUnlinks[k]
    }));

  if (identities.length === 0) {
    renderUnlinkResult(false, ["❌ No identities selected"]);
    return;
  }

  fetch(`${API}/unlink/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ identities })
  })
    .then(res => res.json())
    .then(d => renderUnlinkResult(d.success, d.details))
    .catch(() =>
      renderUnlinkResult(false, ["❌ Unlink request failed"])
    );
}
function renderUnlinkResult(success, details) {
  const box = document.getElementById("unlinkResult");
  const title = document.getElementById("unlinkTitle");
  const list = document.getElementById("unlinkList");

  box.style.display = "block";
  title.innerText = success ? "Unlink Result" : "Unlink Failed";
  title.style.color = success ? "#16a34a" : "#dc2626";

  list.innerHTML = "";

  details.forEach(msg => {
    const li = document.createElement("li");
    li.style.color = msg.startsWith("✅") ? "#16a34a" : "#dc2626";
    li.innerText = msg;
    list.appendChild(li);
  });
}
