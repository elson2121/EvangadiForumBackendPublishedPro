// Updated: Import the PostgreSQL pool object
const pool = require("../db/dbconfig"); 
const asyncHandler = require("express-async-handler");
const { StatusCodes } = require("http-status-codes");

//post answer
const postAnswer = asyncHandler(async (req, res) => {
  const { userid, answer } = req.body;
  const { questionid } = req.params; // <-- take from URL

  if (!answer || !questionid || !userid) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("Question ID, user ID, and answer text are required.");
  }

  // Check if question exists
  // Changed: Use pool.query, use $1 placeholder, rows extracted from result.rows
  const resultCheck = await pool.query(
    "SELECT questionid FROM questions WHERE questionid = $1",
    [questionid]
  );
  const questionRows = resultCheck.rows;

  if (questionRows.length === 0) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error("Question not found with the provided ID.");
  }

  try {
    // Changed: Use $1, $2, $3 placeholders and add 'RETURNING answerid'
    const insertQuery = `
      INSERT INTO answers (userid, questionid, answer) 
      VALUES ($1, $2, $3) 
      RETURNING answerid`;

    const result = await pool.query(insertQuery, [
      userid,
      questionid,
      answer,
    ]);
    
    // Changed: Check result.rowCount and use result.rows[0].answerid
    const newAnswerId = result.rows[0] ? result.rows[0].answerid : null;

    if (result.rowCount === 1 && newAnswerId) {
      res.status(StatusCodes.CREATED).json({
        message: "Answer submitted successfully",
        answer: {
          answer_id: newAnswerId,
          userid,
          questionid,
          answer,
        },
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR);
      throw new Error("Failed to save the answer in the database.");
    }
  } catch (error) {
    console.error("Database error while posting answer:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    throw new Error("Server error while saving answer.");
  }
});

// Get Answer

const getanswer = asyncHandler(async (req, res) => { // Added asyncHandler here for consistency
  const questionid = req.query.questionid; 
    
    // Note: Removed the default value "default_value" as it can mask real errors.

  if (!questionid) {
    return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Question ID query parameter is required." });
  }

  try {
    // Changed: Used $1 placeholder
    const readAnswers = `
      SELECT 
        a.answerid, a.userid, a.questionid, a.answer, a.created_at, 
        u.username 
      FROM answers a 
      LEFT JOIN Users u ON a.userid = u.userid 
      WHERE a.questionid = $1
      ORDER BY a.created_at DESC`; // Added alias and ordered by creation time

    // Changed: Use pool.query and extract answers from result.rows
    const result = await pool.query(readAnswers, [questionid]);
    const answers = result.rows;

    if (answers.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ msg: "No answers found for this question" });
    }

    return res.status(StatusCodes.OK).json({ answers });
  } catch (error) {
    console.error("Error fetching answers:", error.stack);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something went wrong, try again later!" });
  }
});

module.exports = { postAnswer, getanswer };
