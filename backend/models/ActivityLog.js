const mongoose = require("mongoose");

const ActivityLogSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // verifier
  eventType: String,
  details: {
    verifierId: String,
    verifierEmail: String,
    targetUserId: String,
    targetUserEmail: String,
    identitiesChecked: [String],
    trustScore: Number,
    confidence: String,
    result: String
  },
  previousHash: { type: String, default: "GENESIS" },
  currentHash: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("ActivityLog", ActivityLogSchema);
