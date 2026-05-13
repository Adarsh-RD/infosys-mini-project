const mongoose = require("mongoose");

const ConsentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  verifierId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  identities: [{ type: String }], // Optional: restrict which identities they can verify
  expiresAt: { type: Date, required: true },
  status: { type: String, enum: ["ACTIVE", "REVOKED"], default: "ACTIVE" }
}, { timestamps: true });

module.exports = mongoose.model("Consent", ConsentSchema);
