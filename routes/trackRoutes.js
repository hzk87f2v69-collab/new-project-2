const express = require("express");
const { getTracks, getTrackClasses } = require("../controllers/trackController");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/", asyncHandler(getTracks));
router.get("/:trackId/classes", asyncHandler(getTrackClasses));

module.exports = router;
