const Linked = require("../models/LinkedIdentities");
const { verifyWithIssuer } = require("../utils/sandboxVerifier");
const { hashIdentity } = require("../utils/hashing");
const { logActivity } = require("../utils/activityLogger");

exports.linkIdentities = async (req, res) => {
  try {
    const userId = req.user.id;
    const { identities } = req.body;

    /* ---------------- BASIC CHECK ---------------- */
    if (!Array.isArray(identities) || identities.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No identities provided"
      });
    }

    /* -------- MINIMUM 2 FOR FIRST LINK -------- */
    const existingCount = await Linked.countDocuments({
      userId,
      status: "ACTIVE"
    });

    if (existingCount === 0 && identities.length < 2) {
      return res.status(400).json({
        success: false,
        message: "At least two identities must be linked initially"
      });
    }

    const results = [];

    /* ================= MAIN LOOP ================= */
    for (const item of identities) {
      const { identityType, identityValue, otpPassed, biometricPassed } = item;

      const status = {
        identityType,
        format: "PASSED",
        issuer: "NOT_CHECKED",
        link: "NOT_CHECKED",
        message: ""
      };

      /* ------------ FORMAT VALIDATION ------------ */

      // Aadhaar
      if (
        identityType === "AADHAAR" &&
        (!identityValue || !/^\d{12}$/.test(identityValue))
      ) {
        status.format = "FAILED";
        status.message = "Invalid Aadhaar format (12 digits required)";
        results.push(status);
        continue;
      }

      // Phone
      if (
        identityType === "PHONE" &&
        (!identityValue || !/^\d{10}$/.test(identityValue))
      ) {
        status.format = "FAILED";
        status.message = "Invalid phone number format (10 digits required)";
        results.push(status);
        continue;
      }

      // ABHA
      if (
        identityType === "ABHA" &&
        (!identityValue ||
          !/^\d{4}-\d{4}-\d{4}-\d{2}$/.test(identityValue))
      ) {
        status.format = "FAILED";
        status.message = "Invalid ABHA format (XXXX-XXXX-XXXX-XX)";
        results.push(status);
        continue;
      }

      // DigiLocker (🔥 FIXED – NULL SAFE)
      if (
        identityType === "DIGILOCKER" &&
        (!identityValue || identityValue.length < 4)
      ) {
        status.format = "FAILED";
        status.message = "Invalid DigiLocker ID";
        results.push(status);
        continue;
      }

      /* ------------ ISSUER VERIFICATION ------------ */
      let issuerResult = { verified: false };

      if (identityType === "PHONE") {
        issuerResult = {
          verified: otpPassed === true,
          issuer: "TELCO",
          assuranceLevel: "MEDIUM"
        };
      } else {
        issuerResult = await verifyWithIssuer(identityType, {
          otpPassed,
          biometricPassed
        });
      }

      if (!issuerResult || issuerResult.verified !== true) {
        status.issuer = "FAILED";
        status.message = "Issuer verification failed";
        results.push(status);
        continue;
      }

      status.issuer = "PASSED";

      /* ------------ DUPLICATE CHECK ------------ */
      const exists = await Linked.findOne({
        userId,
        identityType,
        status: "ACTIVE"
      });

      if (exists) {
        status.link = "ALREADY_LINKED";
        status.message = "Identity already linked";
        results.push(status);
        continue;
      }

      /* ------------ STORE IDENTITY ------------ */
      const salt = Date.now().toString();
      const hashedIdentifier = hashIdentity(identityValue, salt);
      const blindedIndex = require("../utils/hashing").generateBlindedIndex(identityValue);

      await Linked.create({
        userId,
        identityType,
        hashedIdentifier,
        blindedIndex,
        salt,
        verifiedBy: issuerResult.issuer,
        assuranceLevel: issuerResult.assuranceLevel
      });

      await logActivity(userId, "IDENTITY_LINKED", { identityType });

      status.link = "LINKED";
      status.message = "Identity linked successfully";
      results.push(status);
    }

    /* ---------------- RESPONSE ---------------- */
    return res.json({
      success: true,
      message: "Linking process completed",
      details: results
    });

  } catch (err) {
    console.error("LINK ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Server error during linking"
    });
  }
};
