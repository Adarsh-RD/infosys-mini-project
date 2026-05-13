const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { verifyIdentities } = require("../controllers/verifyController");

/*
  Auth is kept to ensure only trusted
  authorities (hospital, govt, bank) can verify.
  Verification itself is NOT user-bound.
*/
router.post("/run", auth, verifyIdentities);

module.exports = router;
