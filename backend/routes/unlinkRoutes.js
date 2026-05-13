const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { unlinkIdentities } = require("../controllers/unlinkController");

router.post("/run", auth, unlinkIdentities);

module.exports = router;
