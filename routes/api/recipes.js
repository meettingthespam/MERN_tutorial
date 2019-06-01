const express = require("express");
const router = express.Router();

// WHAT WE WANT COMMENTED ON EACH ROUTE:
// @route               GET api/recipe_post
// @ description        Test route
// @access              Public
router.get("/", (request, response) => response.send("Recipe Post Route"));

module.exports = router;
