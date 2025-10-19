const express = require("express");
const router = express.Router();
const {
  getAllQuestions,
  askQuestion,
  getSingleQuestion,
  editQuestion,
  deleteQuestion,
  askgpt,
} = require("../Controller/questionController");

//crud
// post question
router.post("/ask-question", askQuestion);
// get all questions
router.get("/all-questions", getAllQuestions);
// get single question
router.get("/question", getSingleQuestion);
//edit question
router.put("/question/:questionid", editQuestion);
//delete question
router.delete("/question/:questionid", deleteQuestion);
//ask gpt
router.post("/",askgpt)

module.exports = router;
