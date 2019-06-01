const express = require("express");
const router = express.Router();

// WHAT WE WANT COMMENTED ON EACH ROUTE:
// @route               GET api/inventory
// @ description        Test route
// @access              Public
router.get("/", (request, response) => response.send("Inventory Route"));

module.exports = router;
