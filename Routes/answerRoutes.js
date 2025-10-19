const express = require("express");
const router = express.Router();
const { postAnswer, getanswer } = require("../Controller/answerController");

router.get("/getanswer", getanswer);

// router.post('/answer').post( postAnswer);
router.post(`/:questionid`, postAnswer);

module.exports = router;
