const express = require("express");
const passport = require("passport");
const router = express.Router();
const userController = require("../controllers/userController");
const { body } = require("express-validator");
const { authenticate } = require("../jwt-config");

router.post(
  "/",
  [
    body("name", "Name is required").notEmpty(),
    body("email", "Email is required").notEmpty(),
    body("password", "Password is required").notEmpty(),
  ],
  userController.createUser
);

router.delete(
  "/",
  authenticate,
  userController.deleteUser
);

router.get(
  "/",
  authenticate,
  userController.getUser
);

router.get(
  "/account",
  authenticate,
  userController.getUserAccount
);

// TODO: update this to align with get request (get id from req.user not req.params)
// TODO: incorporate express-validator
router.patch(
  "/",
  authenticate,
  userController.updateUser
);

router.post(
  "/login",
  [
    body("email", "Email is required").notEmpty(),
    body("password", "Password is required").notEmpty(),
  ],
  userController.loginUser
);

module.exports = router;
