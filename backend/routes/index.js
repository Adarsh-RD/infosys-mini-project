const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const linkRoutes = require("./linkRoutes");
const verifyRoutes = require("./verifyRoutes");
const unlinkRoutes = require("./unlinkRoutes");

if (!authRoutes || !linkRoutes || !verifyRoutes || !unlinkRoutes) {
  throw new Error("One or more route files are not exporting a router");
}

router.use("/auth", authRoutes);
router.use("/link", linkRoutes);
router.use("/verify", verifyRoutes);
router.use("/unlink", unlinkRoutes);

module.exports = router;
