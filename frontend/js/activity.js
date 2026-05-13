const API_ACTIVITY = "http://localhost:5000/api/activity/all";
const token = localStorage.getItem("token");

async function loadActivity() {
  const myActivityBox = document.getElementById("activityList");
  const verifiedByBox = document.getElementById("verifiedByList");

  const res = await fetch(API_ACTIVITY, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const { myActivity, verifiedByOthers } = await res.json();

  console.log("ACTIVITY RESPONSE:", myActivity, verifiedByOthers);

  myActivityBox.innerHTML = "";
  verifiedByBox.innerHTML = "";

  if (!myActivity.length) {
    myActivityBox.innerHTML = "<p>No activity yet</p>";
    return;
  }

  myActivity.forEach(log => {
    myActivityBox.innerHTML += `
      <div>
        <b>${log.eventType}</b><br>
        ${new Date(log.createdAt).toLocaleString()}
      </div>
    `;
  });
}

loadActivity();
