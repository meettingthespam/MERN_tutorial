const express = require("express");
const request = require("request");
const config = require("config");
const router = express.Router();
const authorization = require("../../middleware/authorization.js");
const { check, validationResult } = require("express-validator/check");
const ProfileModel = require("../../models/ProfileModel");

// @route               GET api/profile/me
// @ description        Get current users profile
// @access              Private
router.get("/me", authorization, async (request, response) => {
  try {
    // this "user" is what is named in the ProfileSchema
    const profile = await ProfileModel.findOne({
      user: request.user.id
    }).populate("usersmodel", ["name", "avatar"]); // grabbing the user's name and avatar from the usermodel
    if (!profile) {
      return response
        .status(400)
        .json({ msg: "There is no profile for this user" });
    }
    // if there is a profile, sends it along with response
    response.json(profile);
  } catch (error) {
    console.error(error.message);
    response.status(500).send("Server Error _ Profile 1");
  }
});

// @route               Post api/profile
// @ description        Create or update user profile
// @access              Private
router.post(
  "/",
  [
    authorization,
    [
      check("bio", "Bio is required")
        .not()
        .isEmpty(),
      check("favorite_color", "Favorite Color is required")
        .not()
        .isEmpty()
    ]
  ],
  async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    // descructuring since there are a ton of fields
    // this is a cool feature in Javascript
    const {
      bio,
      favorite_color,
      website,
      experience,
      skills,
      youtube,
      twitter,
      facebook,
      linkedin,
      instagram
    } = request.body;

    // building a profile object
    // initialize as an empty object and initial each field individually
    const profileFields = {};
    profileFields.user = request.user.id;
    if (bio) profileFields.bio = bio;
    if (favorite_color) profileFields.favorite_color = favorite_color;
    if (website) profileFields.website = website;
    if (experience) profileFields.experience = experience;
    // since skills are an array of strings, we're splittig each
    // skill on the commas, and makinging sure there aren't any blank space between the words
    if (skills) {
      profileFields.skills = skills.split(",").map(skill => skill.trim());
    }
    console.log(profileFields.skills);

    // keeping the social array seperate
    // by building the object separately
    profileFields.social = {};
    if (youtube) profileFields.youtube = youtube;
    if (twitter) profileFields.twitter = twitter;
    if (facebook) profileFields.facebook = facebook;
    if (linkedin) profileFields.linkedin = linkedin;
    if (instagram) profileFields.instagram = instagram;

    // rememebr since we're using mongoose we need to user async await
    // since it returns a promise
    try {
      // making sure the user is updating their profile (by matching the id)
      let profile = await ProfileModel.findOne({ user: request.user.id });

      // updaing the profile based on the user matching
      if (profile) {
        profile = await ProfileModel.findOneAndUpdate(
          { user: request.user.id },
          // notice syntax here with $set
          { $set: profileFields },
          { new: true }
        );
        return response.json(profile);
      }

      // else, if profile doesn't exist already, creating the profile
      profile = new ProfileModel(profileFields);

      // cool feature with mongodb <- easy save
      // but make sure to save on the instance of the model you created (profile just above)
      await profile.save();
      // returning the profile after the user saves their profile
      response.json(profile);
    } catch (error) {
      console.error(error.message);
      response.status(500).send("Server Error _ Profile 2");
    }
  }
);

// @route    GET api/profile
// @desc     Get all profiles
// @access   Public
router.get("/", async (request, response) => {
  try {
    const profiles = await ProfileModel.find().populate("user", [
      "name",
      "username",
      "avatar"
    ]);
    response.json(profiles);
  } catch (error) {
    console.error(error.message);
    response.status(500).send("Server Error _ Profile 3");
  }
});

// @route               Get api/profile/user/user_id
// @ description        Get user profile based on ID
// @access              Public
router.get("/user/:user_id", async (request, response) => {
  try {
    const profile = await ProfileModel.findOne({
      user: request.params.user_id
    }).populate("user", ["name", "username", "avatar"]);
    if (!profile)
      return response.status(400).json({ msg: `Profile not found` });
    response.json(profile);
  } catch (error) {
    console.error(error.message);
    // different responses based on certain "kinds" of errors
    // this is due to someone searching an ID with less than or more than
    // digits for a good jsonwebtoken
    if (error.kind == "ObjectId") {
      return response.status(400).json({ msg: `Profile not found` });
    }
    response.status(500).send("Server Error _ Profile 4");
  }
});

// @route               DELETE api/profile
// @ description        DELETE user profile, user and user's posts
// @access              Private
// https://www.udemy.com/mern-stack-front-to-back/learn/lecture/10055208#content
// go over this again if you need a different way to delete the user
router.delete("/", authorization, async (request, response) => {
  try {
    // Remove profile
    await ProfileModel.findOneAndRemove({ user: request.user.id });

    // Remove user
    // "_id" is to match user.id (due to mongodb)
    await UsersModel.findOneAndRemove({ _id: request.user.id });

    response.json({ msg: "User Deleted" });
  } catch (error) {
    console.error(error.message);
    // different responses based on certain "kinds" of errors
    // this is due to someone searching an ID with less than or more than
    // digits for a good jsonwebtoken
    if (error.kind == "ObjectId") {
      return response.status(400).json({ msg: `Profile not found` });
    }
    response.status(500).send("Server Error _ Profile 5");
  }
});

// @route               PUT api/profile/experience
// @description         Add profile experience
// @access              Private
router.put(
  "/experience",
  [
    authorization,
    [
      check("title", "Job Title is required")
        .not()
        .isEmpty(),
      check("description", "Job description is required")
        .not()
        .isEmpty()
    ]
  ],
  async (request, response) => {
    // checking for errors, see api/users for more description
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    } = request.body;

    // creating an object of the new data the user submits
    const newExperience = {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    };

    // doing a try catch with mongodb.com
    try {
      // making sure it's the right person's profile before
      // making changes
      const profile = await ProfileModel.findOne({ user: request.user.id });
      // unshift() is same as push(), but pushes it at the beginning
      // rather than the end. so most recent changes are first
      profile.experience.unshift(newExperience);

      await profile.save();

      // returning the updated profile
      response.json(profile);
    } catch (error) {
      console.error(error.message);
      response.status(500).send("Server Error _ Profile 6");
    }
  }
);

// @route               DELETE api/profile/experience/:experience_id
// @description         Delete profile experience
// @access              Private
router.delete(
  "/experience/:experience_id",
  authorization,
  async (request, response) => {
    try {
      const profile = await ProfileModel.findOne({ user: request.user.id });

      // getting remove index (to remove correct experience)
      const removeIndex = profile.experience
        .map(item => item.id)
        .indexOf(request.params.experience_id);

      // since we have the experience index, we can use splice to remove it
      profile.experience.splice(removeIndex, 1);

      await profile.save();

      response.json(profile);
    } catch (error) {
      console.error(error.message);
      response.status(500).send("Server Error _ Profile 7");
    }
  }
);

module.exports = router;
