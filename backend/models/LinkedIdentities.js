const mongoose = require("mongoose");

const LinkedSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  identityType: {
    type: String,
    enum: ["AADHAAR", "ABHA", "DIGILOCKER", "PHONE"],
    required: true
  },

  hashedIdentifier: {
    type: String,
    required: true
  },

  blindedIndex: {
    type: String,
    required: true,
    index: true
  },

  salt: {
    type: String,
    required: true
  },

  verifiedBy: {
    type: String,
    required: true
  },

  assuranceLevel: {
    type: String,
    enum: ["LOW", "MEDIUM", "HIGH"],
    required: true
  },

  status: {
    type: String,
    enum: ["ACTIVE", "REVOKED"],
    default: "ACTIVE"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("LinkedIdentities", LinkedSchema);
