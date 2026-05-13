// backend/utils/hashing.js
const crypto = require("crypto");

// A static pepper used ONLY for indexing to allow O(1) database lookups
// In a real production system, this would be stored securely in an HSM or env.
const GLOBAL_PEPPER = process.env.INDEX_PEPPER || "super_secret_pepper_for_index_8f92a";

function hashIdentity(value, salt) {
  return crypto
    .createHmac("sha256", String(salt))
    .update(String(value).trim())
    .digest("hex");
}

function generateBlindedIndex(value) {
  return crypto
    .createHmac("sha256", GLOBAL_PEPPER)
    .update(String(value).trim())
    .digest("hex");
}

module.exports = { hashIdentity, generateBlindedIndex };
