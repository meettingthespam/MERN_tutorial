const express = require("express");
const router = express.Router();

// WHAT WE WANT COMMENTED ON EACH ROUTE:
// @route               GET api/employees
// @ description        Test route
// @access              Public
router.get("/", (request, response) => response.send("Employees Route"));

module.exports = router;
