// backend/routes/linkRoutes.js

const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const { linkIdentities } = require("../controllers/linkController");

// POST /api/link/do
router.post("/do", auth, linkIdentities);

module.exports = router;
