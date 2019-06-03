const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const authorization = require("../../middleware/authorization.js");

const GenericPostModel = require("../../models/GenericPostModel.js");
const ProfileModel = require("../../models/ProfileModel.js");
const UsersModel = require("../../models/UsersModel.js");
const AdminModel = require("../../models/AdminModel.js");

// @route               POST api/generic_posts
// @ description        Create a generic blog post
// @access              Private
router.post(
  "/",
  [
    authorization,
    [
      check("text", "text is required")
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
      const user =
        (await UsersModel.findById(request.user.id).select("-password")) ||
        (await AdminModel.findById(request.user.id).select("-password"));
      const newPost = new GenericPostModel({
        text: request.body.text,
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
      response.status(500).json({ msg: "Server Error _ Generic Post 1" });
    }
  }
);

// @route               GET api/generic_posts
// @ description        Get the generic "blog" post
// @access              Private (so it's only for logged in users)
router.get("/", authorization, async (request, response) => {
  try {
    // sorted by newest to oldest
    const posts = await GenericPostModel.find().sort({ date: -1 });
    response.json(posts);
  } catch (error) {
    console.error(error.message);
    response.status(500).json({ msg: "Server Error _ Generic Post 2" });
  }
});

// getting a specific post

// @route               GET api/generic_posts
// @ description        Get the generic "blog" post
// @access              Private (so it's only for logged in users)
router.get("/:id", authorization, async (request, response) => {
  try {
    // sorted by newest to oldest
    const specific_post = await GenericPostModel.findById(request.params.id);

    if (!specific_post) {
      return response
        .status(404)
        .json({ msg: "Server Error _ Generic Post 2" });
    }

    response.json(specific_post);
  } catch (error) {
    console.error(error.message);
    // making sure the size of the id is at least the correct length
    if (!error.kind === "ObjectId") {
      return response
        .status(404)
        .json({ msg: "Server Error _ Generic Post 2" });
    }
    response.status(500).json({ msg: "Server Error _ Generic Post 3" });
  }
});

// @route               DELETE api/generic_posts/:id
// @ description        Delete specifc
// @access              Private (so it's only for logged in users)
router.delete("/:id", authorization, async (request, response) => {
  try {
    // sorted by newest to oldest
    const specific_post = await GenericPostModel.findById(request.params.id);

    if (!specific_post) {
      return response
        .status(404)
        .json({ msg: "Server Error _ Generic Post 3" });
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
      return response
        .status(404)
        .json({ msg: "Server Error _ Generic Post 4" });
    }
    response.status(500).json({ msg: "Server Error _ Generic Post 4" });
  }
});

// @route               PUT api/generic_posts/like:id
// @ description        ability to have a user like a post
// @access              Private (so it's only for logged in users)

router.put("/like/:id", authorization, async (request, response) => {
  try {
    const specific_post = await GenericPostModel.findById(request.params.id);

    // Checking if post has already been liked
    // this just checks to see if the length of the like's under that specific user,
    // if it's greater than zero, then the like is not added,
    // otherwise then we'll allow the like
    if (
      specific_post.likes.filter(
        like => like.user.toString() === request.user.id
      ).length > 0
    ) {
      return response.status(400).json({ msg: "Post already liked" });
    }

    specific_post.likes.unshift({ user: request.user.id });

    // saving the updated post (updated only the likes)
    await specific_post.save();

    // returning the updated like on the post (due to using React)
    response.json(specific_post.likes);
  } catch (error) {
    console.error(error.message);
    response.status(500).json({ msg: "Server Error _ Generic Post 5" });
  }
});

// @route    PUT api/posts/unlike/:id
// @desc     Like a post
// @access   Private
router.put("/unlike/:id", authorization, async (request, response) => {
  try {
    const specific_post = await GenericPostModel.findById(request.params.id);

    // Check if the specific_post has already been liked
    if (
      specific_post.likes.filter(
        like => like.user.toString() === request.user.id
      ).length === 0
    ) {
      return response.status(400).json({ msg: "Post has not yet been liked" });
    }

    // Get remove index
    const removeIndex = specific_post.likes
      .map(like => like.user.toString())
      .indexOf(request.user.id);

    specific_post.likes.splice(removeIndex, 1);

    await specific_post.save();

    response.json(specific_post.likes);
  } catch (error) {
    console.error(error.message);
    response.status(500).send("Server Error");
  }
});

// @route               POST api/generic_posts/comment/:id
// @ description        Comment on user post
// @access              Private
router.post(
  "/comment/:id",
  [
    authorization,
    [
      check("text", "text is required")
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
      const user =
        (await UsersModel.findById(request.user.id).select("-password")) ||
        (await AdminModel.findById(request.user.id).select("-password"));

      const specific_post = await GenericPostModel.findById(request.params.id);

      const newComment = {
        text: request.body.text,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        user: request.user.id
      };

      specific_post.comments.unshift(newComment);

      await specific_post.save();
      response.json(specific_post.comments);
    } catch (error) {
      console.error(error.message);
      response.status(500).json({ msg: "Server Error _ Generic Post 6" });
    }
  }
);

// @route               DELTE api/generic_posts/comment/:id/:comment_id
// @ description        Delete Comment
// @access              Private
router.delete(
  "/comment/:id/:comment_id",
  authorization,
  async (request, response) => {
    try {
      const specific_post = await GenericPostModel.findById(request.params.id);

      // Grabbing the specific comment by id, under the specific post by id
      const comment = specific_post.comments.find(
        comment => comment.id === request.params.comment_id
      );

      // Making sure comment actualy exists
      if (!comment) {
        return response.status(400).json({ msg: "comment does not exist " });
      }

      // making sure the owner of the comment actually exists
      if (comment.user.toString() !== request.user.id) {
        return response.status(401).json({ msg: "Not Authorized" });
      }

      // Get remove index
      const removeIndex = specific_post.comments
        .map(comment => comment.id)
        .indexOf(request.params.comment_id);

      specific_post.comments.splice(removeIndex, 1);

      await specific_post.save();

      response.json(specific_post.comments);
    } catch (error) {
      console.error(error.message);
      response.status(500).json({ msg: "Server Error _ Generic Post 7" });
    }
  }
);

module.exports = router;
