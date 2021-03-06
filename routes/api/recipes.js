const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const authorization = require("../../middleware/authorization.js");

const RecipePostModel = require("../../models/RecipePostModel.js");
const AdminModel = require("../../models/AdminModel.js");

// @route               POST api/recipe_post
// @ description        Create a recipe blog post
// @access              Private/Admin Post Only
router.post(
  "/",
  [
    authorization,
    [
      check("title", "Title of recipe is required")
        .not()
        .isEmpty(),
      check("recipe", "Body of recipe is required")
        .not()
        .isEmpty()
    ]
  ],
  async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    try {
      // doing this to grab the name, username, and avatar
      // since we're logged in we can use the request.user.id sans hashed password
      const user = await AdminModel.findById(request.user.id).select(
        "-password"
      );
      const newPost = new RecipePostModel({
        title: request.body.title,
        recipe: request.body.recipe,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        user: request.user.id
      });
      // having this in a variable makes it easier to read
      const post = await newPost.save();
      response.json(post);
    } catch (error) {
      console.error(error.message);
      response.status(500).json({ msg: "Server Error _ Recipe Post 1" });
    }
  }
);

// @route               GET api/recipe_post
// @ description        Get the recipe "blog" post
// @access              Private (so it's only for logged in users)
router.get("/", authorization, async (request, response) => {
  try {
    // sorted by newest to oldest
    const posts = await RecipePostModel.find().sort({ title: -1 });
    response.json(posts);
  } catch (error) {
    console.error(error.message);
    response.status(500).json({ msg: "Server Error _ Recipe Post 1.1" });
  }
});

// getting a specific post

// @route               GET api/recipe_post
// @ description        Get the recipe "blog" post
// @access              Private (so it's only for logged in users)
router.get("/:id", authorization, async (request, response) => {
  try {
    // sorted by newest to oldest
    const specific_post = await RecipePostModel.findById(request.params.id);

    if (!specific_post) {
      return response.status(404).json({ msg: "Server Error _ Recipe Post 2" });
    }

    response.json(specific_post);
  } catch (error) {
    console.error(error.message);
    // making sure the size of the id is at least the correct length
    if (!error.kind === "ObjectId") {
      return response
        .status(404)
        .json({ msg: "Server Error _ Recipe Post 2.1" });
    }
    response.status(500).json({ msg: "Server Error _ Recipe Post 2.3" });
  }
});

// @route               DELETE api/recipe_post/:id
// @ description        Delete specifc
// @access              Private (so it's only for logged in users)
router.delete("/:id", authorization, async (request, response) => {
  try {
    // sorted by newest to oldest
    const specific_post = await RecipePostModel.findById(request.params.id);

    if (!specific_post) {
      return response.status(404).json({ msg: "Server Error _ Recipe Post 3" });
    }
    // Ensuring the user who is deleting the post is the user
    // this "specific_post.user" is not a string, but the user.id is,
    // so you must convert this
    if (specific_post.user.toString() !== request.user.id) {
      return response.staus(401).json({ msg: "Not Authorized" });
    }

    await specific_post.remove();

    response.json({ msg: "Post Removed" });
  } catch (error) {
    console.error(error.message);
    // making sure the size of the id is at least the correct length
    if (!error.kind === "ObjectId") {
      return response.status(404).json({ msg: "Server Error _ Recipe Post 4" });
    }
    response.status(500).json({ msg: "Server Error _ Recipe Post 4.1" });
  }
});

module.exports = router;
