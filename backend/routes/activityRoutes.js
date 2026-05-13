const express = require("express");
const router = express.Router();
const Activity = require("../models/ActivityLog");
const auth = require("../middleware/authMiddleware");

router.get("/all", auth, async (req, res) => {
  try {
    const userId = String(req.user.id);

    const logs = await Activity.find({})
      .sort({ createdAt: -1 })
      .limit(200);

    const myActivity = [];
    const verifiedByOthers = [];

    logs.forEach(log => {
      const actor = String(log.actor);
      const target = log.details?.targetUserId
        ? String(log.details.targetUserId)
        : null;

      // 🟢 Actions I performed
      if (actor === userId) {
        myActivity.push(log);
      }

      // 🔵 Others verified me
      if (
        log.eventType === "IDENTITY_VERIFIED" &&
        target === userId &&
        actor !== userId
      ) {
        verifiedByOthers.push(log);
      }
    });

    res.json({ myActivity, verifiedByOthers });

  } catch (err) {
    console.error("ACTIVITY FETCH ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
