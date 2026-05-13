const Activity = require("../models/ActivityLog");
const crypto = require("crypto");

async function logActivity(actor, eventType, details = {}) {
  try {
    // Fetch the most recent log to get the previous hash
    const lastLog = await Activity.findOne().sort({ createdAt: -1 });
    const previousHash = lastLog ? lastLog.currentHash : "GENESIS";

    const logData = {
      actor: String(actor),
      eventType,
      details,
      previousHash
    };

    // Generate the current hash
    const currentHash = crypto
      .createHash("sha256")
      .update(JSON.stringify(logData))
      .digest("hex");

    await Activity.create({
      ...logData,
      currentHash
    });
  } catch (err) {
    console.error("ACTIVITY LOG ERROR:", err.message);
  }
}

module.exports = { logActivity };
