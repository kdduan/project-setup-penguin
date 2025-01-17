/**
 * assumptions:
 * a12ccfc9-21da-4430-a37c-69416621dc09 is an existing deck id
 * 0 is a nonexistent deck id
 */
const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../app.js");
const jwt = require("jsonwebtoken");
const { jwtOptions } = require("../jwt-config");
// the following token can be used to test any protected route
const token = jwt.sign(
  { id: "619aceba4508732901f2a751" },
  jwtOptions.secretOrKey
);

chai.use(chaiHttp);
const expect = chai.expect;

describe("User", () => {
  describe("POST /user/login", () => {
    it("should return error when user doesn't exist", (done) => {
      chai
        .request(app)
        .post("/user/login")
        .send({ email: "notrandom@gmail.com", password: "notstring" })
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });
    it("should return email and token when successful", (done) => {
      chai
        .request(app)
        .post("/user/login")
        .send({ email: "janet@gmail.com", password: "1234" })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("email");
          expect(res.body).to.have.property("token");
          done();
        });
    });
  });
  describe("POST /", () => {
    it("error when creating account", (done) => {
      chai
        .request(app)
        .post("/user")
        .send({ email: "", password: "string", name: "me" })
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });
  });
});

describe("Decks", () => {
  describe("POST /", () => {
    it("should return id of newly created deck", (done) => {
      chai
        .request(app)
        .post("/deck")
        .send({
          token,
          deckName: "generated",
          deckDescription: "from mocha test",
          cardText: JSON.stringify({
            name: "Name Here",
            city: "NYC",
            tagline: "~5 word tagline about yourself",
            summary: "ROLE (# YOE), working hours & time zone",
            sectionLabel0: "Strengths",
            sectionLabel1: "Weaknesses",
            sectionLabel2: "Communication Preferences",
            sectionContent0: "What do you excel at?",
            sectionContent1: "What do you struggle with?",
            sectionContent2: "How do you want people to contact you?",
            sliderLabelMin: "Introvert",
            sliderLabelMax: "Extrovert",
            sliderValue: 50,
          }),
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("deckId");
          done();
        });
    });
  });
  describe("PATCH /", () => {
    it("should return error when updating nonexistent deck", (done) => {
      chai
        .request(app)
        .patch("/deck/-1")
        .set("Authorization", `JWT ${token}`)
        .send({
          deckName: "updated",
          deckDescription: "from mocha test",
        })
        .end((err, res) => {
          expect(res).to.have.status(500);
          done();
        });
    });
    it("should successfully update the deck", (done) => {
      chai
        .request(app)
        .patch("/deck/619acedb4508732901f2a755")
        .set("Authorization", `JWT ${token}`)
        .send({
          deckName: "updated",
          deckDescription: "from mocha test",
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });
  });
  describe("GET /", () => {
    it("should return an error when getting nonexistent deck", (done) => {
      chai
        .request(app)
        .get("/deck/0?page=1&limit=1")
        .set("Authorization", `JWT ${token}`)
        .end((err, res) => {
          expect(res).to.have.status(500);
          done();
        });
    });
  });
  describe("GET /", () => {
    it("should return an error when missing the page query param", (done) => {
      chai
        .request(app)
        .get("/deck/619acedb4508732901f2a755?limit=1")
        .set("Authorization", `JWT ${token}`)
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });
  });
});

describe("Cards", () => {
  describe("POST /", () => {
    it("should return error when adding to nonexistent deck", (done) => {
      chai
        .request(app)
        .post("/card")
        .set("Authorization", `JWT ${token}`)
        .send({
          deckId: 0,
          name: "test card",
          cardText: JSON.stringify({
            name: "Name Here",
            city: "NYC",
            tagline: "~5 word tagline about yourself",
            summary: "ROLE (# YOE), working hours & time zone",
            sectionLabel0: "Strengths",
            sectionLabel1: "Weaknesses",
            sectionLabel2: "Communication Preferences",
            sectionContent0: "What do you excel at?",
            sectionContent1: "What do you struggle with?",
            sectionContent2: "How do you want people to contact you?",
            sliderLabelMin: "Introvert",
            sliderLabelMax: "Extrovert",
            sliderValue: 50,
          }),
        })
        .end((err, res) => {
          expect(res).to.have.status(500);
          done();
        });
    });
    it("should return id of newly created card", (done) => {
      chai
        .request(app)
        .post("/card")
        .set("Authorization", `JWT ${token}`)
        .send({
          deckId: "61980be9df5ede5f64158de9",
          name: "test card",
          cardText: JSON.stringify({
            name: "Name Here",
            city: "NYC",
            tagline: "~5 word tagline about yourself",
            summary: "ROLE (# YOE), working hours & time zone",
            sectionLabel0: "Strengths",
            sectionLabel1: "Weaknesses",
            sectionLabel2: "Communication Preferences",
            sectionContent0: "What do you excel at?",
            sectionContent1: "What do you struggle with?",
            sectionContent2: "How do you want people to contact you?",
            sliderLabelMin: "Introvert",
            sliderLabelMax: "Extrovert",
            sliderValue: 50,
          }),
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("cardId");
          done();
        });
    });
  });
});
