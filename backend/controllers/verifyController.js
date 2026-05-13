const Linked = require("../models/LinkedIdentities");
const User = require("../models/User");
const { hashIdentity, generateBlindedIndex } = require("../utils/hashing");
const { generateZKP } = require("../utils/zkpSimulator");
const { logActivity } = require("../utils/activityLogger");

/* Assurance weights */
const ASSURANCE_WEIGHT = {
  AADHAAR: 40,
  ABHA: 30,
  PHONE: 20,
  DIGILOCKER: 10
};

/* Format validators */
const FORMAT_VALIDATORS = {
  AADHAAR: v => /^\d{12}$/.test(v),
  PHONE: v => /^\d{10}$/.test(v),
  ABHA: v => /^\d{4}-\d{4}-\d{4}-\d{2}$/.test(v),
  DIGILOCKER: v => v.length >= 4
};

exports.verifyIdentities = async (req, res) => {
  try {
    const verifierId = req.user.id;
    const verifier = await User.findById(verifierId);

    let { identities } = req.body;
    identities = identities.filter(i => i.identityType && i.identityValue);

    if (identities.length < 2) {
      return res.json({
        success: false,
        message: "At least two identities are required"
      });
    }

    /* ===== FORMAT VALIDATION ===== */
    for (const i of identities) {
      const validate = FORMAT_VALIDATORS[i.identityType];
      if (!validate || !validate(i.identityValue)) {
        return res.json({
          success: true,
          belong: false,
          title: "Invalid Format",
          message: `${i.identityType} format is invalid`,
          trustScore: 0,
          confidence: "N/A",
          zkp: null
        });
      }
    }

    /* ===== MATCHING (O(1) OPTIMIZED) ===== */
    let matchedWeight = 0;
    let totalWeight = 0;
    let failed = [];
    let targetUserId = null;

    for (const item of identities) {
      const { identityType, identityValue } = item;
      const weight = ASSURANCE_WEIGHT[identityType] || 0;
      totalWeight += weight;

      // 1. Generate the fast-lookup blinded index
      const blindedIndex = generateBlindedIndex(identityValue);

      // 2. O(1) Database Lookup
      const rec = await Linked.findOne({
        identityType,
        blindedIndex,
        status: "ACTIVE"
      });

      if (!rec) {
        failed.push(`${identityType}: not linked or value mismatch`);
        continue;
      }

      // 3. Double-check with the salted payload to guarantee no collisions
      const hashed = hashIdentity(identityValue, rec.salt);
      
      if (hashed !== rec.hashedIdentifier) {
         failed.push(`${identityType}: value mismatch`);
         continue;
      }

      // First successful match decides the target user
      if (!targetUserId) {
        targetUserId = rec.userId.toString();
      }

      // Ensure all subsequent identities belong to the same target user
      if (rec.userId.toString() === targetUserId) {
        matchedWeight += weight;
      } else {
        failed.push(`${identityType}: belongs to different user`);
      }
    }

    const trustScore = Math.round((matchedWeight / totalWeight) * 100);
    let confidence = "LOW";
    if (trustScore >= 80) confidence = "HIGH";
    else if (trustScore >= 50) confidence = "MEDIUM";

    const identitiesList = identities.map(i => i.identityType);

    /* ===== FAILURE ===== */
    if (failed.length || !targetUserId) {
      await logActivity(verifierId, "IDENTITY_VERIFIED", {
        verifierId: verifier._id.toString(),
        verifierEmail: verifier.email,
        targetUserId: targetUserId,
        identitiesChecked: identitiesList,
        trustScore,
        confidence,
        result: "NOT_SAME"
      });

      return res.json({
        success: true,
        belong: false,
        title: "Not Same Person",
        message: failed.join(", "),
        trustScore,
        confidence,
        zkp: generateZKP(false)
      });
    }

    /* ===== SUCCESS ===== */
    const targetUser = await User.findById(targetUserId);

    await logActivity(verifierId, "IDENTITY_VERIFIED", {
      verifierId: verifier._id.toString(),
      verifierEmail: verifier.email,
      targetUserId: targetUser._id.toString(),
      targetUserEmail: targetUser.email,
      identitiesChecked: identitiesList,
      trustScore,
      confidence: "HIGH",
      result: "SAME"
    });

    return res.json({
      success: true,
      belong: true,
      title: "Same Person",
      message: "All identities belong to the same person",
      trustScore,
      confidence: "HIGH",
      zkp: generateZKP(true, identitiesList)
    });

  } catch (err) {
    console.error("VERIFY ERROR:", err);
    return res.status(500).json({ message: "Verification failed" });
  }
};
