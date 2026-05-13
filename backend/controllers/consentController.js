const Consent = require("../models/Consent");
const User = require("../models/User");

exports.grantConsent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { verifierEmail, durationDays = 7, identities = [] } = req.body;

    const verifier = await User.findOne({ email: verifierEmail });
    if (!verifier) return res.status(404).json({ success: false, message: "Verifier not found" });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    const consent = await Consent.create({
      userId,
      verifierId: verifier._id,
      identities,
      expiresAt
    });

    res.json({ success: true, message: "Consent granted", consentId: consent._id });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.revokeConsent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { consentId } = req.body;
    
    await Consent.findOneAndUpdate({ _id: consentId, userId }, { status: "REVOKED" });
    res.json({ success: true, message: "Consent revoked" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
