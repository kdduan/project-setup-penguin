const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const fs = require("fs").promises;
const db = require("../db.js");
const { validationResult } = require("express-validator");

const User = require("../models/user");
const Card = require("../models/card");
const Deck = require("../models/deck");

const { jwtOptions } = require("../jwt-config");

const createUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((error) => error.msg);
    return res.status(400).json({ messages });
  }

  const { email, password, name } = req.body;

  const existingUser = await User.findOne({ email: email }).catch((err) => {
    next(err);
  });
  if (existingUser) {
    res.status(401).json({ success: false, messages: [`email already taken`] });
  }

  const hash = await bcrypt.hash(password, 10).catch((err) => {
    next(err);
  });
  const user = await new User({
    name: name,
    email: email,
    password: hash,
    cards: [],
  })
    .save()
    .catch((err) => {
      next(err);
    });

  const payload = { id: user._id };
  const token = jwt.sign(payload, jwtOptions.secretOrKey);
  res.json({ success: true, email: user.email, token: token });
};

const deleteUser = async (req, res, next) => {
  const userId = req.user._id;
  const userData = await User.findOne({ _id: userId });
  const userCardIds = userData.cards;

  //remove all cards from decks
  userCardIds.forEach(async (cardId) => {
    const card = await Card.findOne({ _id: cardId });

    const deck = await Deck.findOne({ _id: card.deckId });

    // delete card document
    await Card.deleteOne({ _id: cardId }).catch((err) => next(err));

    // delete cardId from deck object
    deck.cards = deck.cards.filter(
      (currCardId) => currCardId.toString() != cardId
    );
    deck.save();
  });

  //make all decks set to the user null
  const decks = await Deck.updateMany(
    { ownerId: userId },
    { $unset: { ownerId: 1 } }
  );

  //Delete user
  try {
    User.deleteOne({ _id: userId }).then(() => {
      res.status(200);
      res.json({ messages: ["User successfully deleted"] });
    });
  } catch (e) {
    next(e);
  }
};

const getUser = async (req, res, next) => {
  const userId = req.user._id;

  // query DB for user data and extract array of cardIds
  const userData = await User.findOne({ _id: userId }).catch((err) => {
    next(err);
  });
  const userCardIds = userData.cards;

  // query DB and replace cardIds with card objects
  const userCards = await Promise.all(
    userCardIds.map(
      async (cardId) => await Card.findOne({ _id: cardId.toString() })
    )
  );

  // query DB for whether user owns the deck
  const userCardsWithDeckData = await Promise.all(
    userCards.map(async (userCard) => {
      const deckData = await Deck.findOne({
        _id: userCard.deckId.toString(),
      }).catch((err) => {
        next(err);
      });

      return {
        isOwned: deckData.ownerId.equals(userId),
        deckName: deckData.deckName,
        cardTemplate: deckData.cardTemplate,
        cardData: {
          ...userCard.toObject(),
          _id: userCard._id.toString(),
          deckId: userCard.deckId.toString(),
        },
      };
    })
  );

  res.send(userCardsWithDeckData);
};

const getUserAccount = async (req, res, next) => {
  const userId = req.user._id;

  const userData = await User.findOne({ _id: userId }).catch((err) => {
    next(err);
  });

  console.log(userData);
  res.status(200);
  res.json({ name: userData.name, email: userData.email });
};

const updateUser = async (req, res, next) => {
  const userId = req.user._id;
  const { email, password, name } = req.body;

  //check if User does not exists
  const count = await User.exists({ _id: userId }).catch((err) => {
    next(err);
  });
  if (count === 0) {
    throw "User does not exist";
  }

  //find relevant info - don't allow updates if conflicting email present
  const prevInfo = await User.find({ _id: userId }).select({
    _id: 0,
    email: 1,
  });

  if (!email || !password || !name) throw "Empty field";

  if (prevInfo[0].email !== email) {
    const conflict = await User.countDocuments({ email: email });
    console.log(conflict);
    if (conflict >= 1) {
      throw "User email conflict";
    }
  }

  bcrypt.hash(password, saltRounds, async function (err, hash) {
    await User.findOneAndUpdate({ _id: userId }, { name, email, hash })
      .exec()
      .catch((err) => {
        next(err);
      });
  });
  res.json({ userId });
};

const loginUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((error) => error.msg);
    return res.status(400).json({ messages });
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email: email });
  if (!user) {
    res
      .status(401)
      .json({ success: false, messages: [`user not found: ${email}.`] });
  }
  const match = await bcrypt.compare(password, user.password).catch((err) => {
    next(err);
  });

  if (match) {
    const payload = { id: user._id };
    const token = jwt.sign(payload, jwtOptions.secretOrKey);
    res.json({ success: true, email: user.email, token: token });
  } else {
    res
      .status(401)
      .json({ success: false, messages: [`passwords did not match`] });
  }
};

module.exports = {
  getUser,
  createUser,
  deleteUser,
  updateUser,
  loginUser,
  getUserAccount,
};
