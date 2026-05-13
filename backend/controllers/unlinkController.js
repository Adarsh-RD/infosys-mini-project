const Linked = require("../models/LinkedIdentities");
const { hashIdentity } = require("../utils/hashing");
const { logActivity } = require("../utils/activityLogger");

exports.unlinkIdentities = async (req, res) => {
  try {
    const userId = req.user.id;
    const { identities } = req.body;

    if (!Array.isArray(identities) || identities.length === 0) {
      return res.status(400).json({
        success: false,
        details: ["❌ No identities selected"]
      });
    }

    const results = [];

    for (const item of identities) {
      const { identityType, identityValue } = item;

      // 1️⃣ Fetch ONLY logged user's ACTIVE identity
      const record = await Linked.findOne({
        userId,
        identityType,
        status: "ACTIVE"
      });

      if (!record) {
        results.push(`❌ ${identityType}: not linked or already unlinked`);
        continue;
      }

      // 2️⃣ Hash check
      const hashedInput = hashIdentity(
        String(identityValue).trim(),
        record.salt
      );

      if (hashedInput !== record.hashedIdentifier) {
        results.push(`❌ ${identityType}: value does not belong to your account`);
        continue;
      }

      // 3️⃣ Revoke
      record.status = "REVOKED";
      await record.save();

      await logActivity(userId, "IDENTITY_UNLINKED", {
        identityType
      });

      results.push(`✅ ${identityType}: successfully unlinked`);
    }

    return res.json({
      success: true,
      details: results
    });

  } catch (err) {
    console.error("UNLINK ERROR:", err);
    return res.status(500).json({
      success: false,
      details: ["❌ Server error during unlink"]
    });
  }
};
