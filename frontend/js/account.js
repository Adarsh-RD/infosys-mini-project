console.log("ACCOUNT.JS LOADED");

const API = "http://localhost:5000/api/activity/all";
const token = localStorage.getItem("token");

const activityList = document.getElementById("activityList");
const verifiedByList = document.getElementById("verifiedByList");

// Show logged-in user info
document.getElementById("accountEmail").innerText =
  localStorage.getItem("userEmail") || "User";

document.getElementById("accountPhone").innerText =
  localStorage.getItem("userPhone") || "";

async function loadActivity() {
  try {
    const res = await fetch(API, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error("Failed to fetch activity");

    const { myActivity, verifiedByOthers } = await res.json();

    /* ================= MY ACTIVITY ================= */
    activityList.innerHTML = "";

    if (!myActivity.length) {
      activityList.innerHTML =
        "<p class='text-muted mb-0'>No activity yet.</p>";
    } else {
      myActivity.forEach(log => {
        activityList.innerHTML += `
          <div class="mb-2 border-bottom pb-2 small">
            <strong>${log.eventType}</strong><br>
            <span class="text-muted">
              ${new Date(log.createdAt).toLocaleString()}
            </span>
          </div>
        `;
      });
    }

    /* ============ VERIFIED BY OTHERS ============ */
    verifiedByList.innerHTML = "";

    if (!verifiedByOthers.length) {
      verifiedByList.innerHTML =
        "<p class='text-muted mb-0'>No one has verified you yet.</p>";
    } else {
      verifiedByOthers.forEach(log => {
        verifiedByList.innerHTML += `
          <div class="mb-2 border-bottom pb-2 small text-danger">
            <strong>Verified By:</strong> ${log.details.verifierEmail}<br>
            <strong>Identities:</strong>
            ${log.details?.identitiesChecked?.join(", ")}<br>
            <strong>Trust Score:</strong>
            ${log.details?.trustScore}%<br>
            <span class="text-muted">
              ${new Date(log.createdAt).toLocaleString()}
            </span>
          </div>
        see
        `;
      });
    }
  } catch (err) {
    console.error("ACTIVITY LOAD ERROR:", err);
    activityList.innerHTML =
      "<p class='text-danger'>Failed to load activity</p>";
  }
}

loadActivity();
