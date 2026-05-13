const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { grantConsent, revokeConsent } = require("../controllers/consentController");

router.post("/grant", auth, grantConsent);
router.post("/revoke", auth, revokeConsent);

module.exports = router;
