require("dotenv").config();
// Updated: Import the PostgreSQL connection pool
const pool = require("../db/dbconfig"); 
const { StatusCodes } = require("http-status-codes");
const { v4: uuidv4 } = require("uuid"); // Keep the uuidv4 import
const OpenAI = require("openai");

const openai = new OpenAI({
   apiKey: process.env.OPENAI_API_KEY,
});

// post question
const askQuestion = async (req, res) => {
   const { title, description, tag } = req.body;
   const userid = req.user.userid;
    
   // Simplified: uuidv4 generates a cryptographically strong UUID directly
   const questionid = uuidv4(); 
    
   // Changed: Use $1, $2, $3, $4, $5 placeholders
   const askQuery = `INSERT INTO questions (questionid,userid,title,description,tag) VALUES ($1,$2,$3,$4,$5)`;
   try {
      // Changed: Use pool.query
      await pool.query(askQuery, [
         questionid,
         userid,
         title,
         description,
         tag,
      ]);
      return res.status(StatusCodes.CREATED).json({ msg: "Question asked!" });
   } catch (error) {
      console.log(error.message);
      return res
         .status(StatusCodes.INTERNAL_SERVER_ERROR)
         .json({ msg: "something went wrong, try again later!" });
   }
};

// Get all questions
const getAllQuestions = async (req, res) => {
   try {
      
      const fetchQuestions = `
         SELECT 
          q.title,
          q.questionid,
          q.userid,
          u.username,
          q.created_at AS createdAt
        FROM questions q
        LEFT JOIN Users u ON q.userid = u.userid
        ORDER BY q.id DESC
      `; // Assumes 'questions' has an 'id' column for proper chronological ordering
    
      // Changed: Use pool.query and extract data from result.rows
      const result = await pool.query(fetchQuestions);
    const questions = result.rows;

      return res.status(StatusCodes.OK).json({ questions });
   } catch (error) {
      console.log(error.message);
      return res
         .status(StatusCodes.INTERNAL_SERVER_ERROR)
         .json({ msg: "Something went wrong, try again later!" });
   }
};


// Get single question

async function getSingleQuestion(req, res) {
   try {
      const { questionid } = req.query;

      // Changed: Used $1 placeholder and table aliases (q and u) for clarity
      const fetchSingleQuestion = `
         SELECT 
            q.questionid, 
            q.title, 
            q.description, 
            q.userid, 
            u.username
         FROM questions q
         LEFT JOIN Users u ON q.userid = u.userid
         WHERE q.questionid = $1
      `; // Removed ORDER BY question.id DESC as it's typically unnecessary for single fetches

      // Changed: Use pool.query and extract data from result.rows
      const result = await pool.query(fetchSingleQuestion, [questionid]);
    const rows = result.rows;

      return res.status(StatusCodes.OK).json({ questions: rows });
   } catch (error) {
      console.error("Backend error:", error.message);
      return res
         .status(StatusCodes.INTERNAL_SERVER_ERROR)
         .json({ msg: "Something went wrong, try again later!" });
   }
}

// Edit Question
const editQuestion = async (req, res) => {
   const { questionid } = req.params;
   const { userid, title, description } = req.body;
    
    // Check for missing data
    if (!title || !description) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "Title and description are required for editing." });
    }

   // Verify ownership - Changed: Use $1, $2 and extract data from result.rows
   const checkQuery = "SELECT questionid FROM questions WHERE questionid = $1 AND userid = $2";
   const resultCheck = await pool.query(checkQuery, [questionid, userid]);
  const rows = resultCheck.rows;


   if (rows.length === 0)
      return res
         .status(StatusCodes.FORBIDDEN)
         .json({ message: "You can only edit your own question" });

   // Changed: Use $1, $2, $3 placeholders
  const updateQuery = "UPDATE questions SET title = $1, description = $2 WHERE questionid = $3";
   await pool.query(updateQuery, [title, description, questionid]);

   res.json({ message: "Question updated" });
};

// Delete Question
const deleteQuestion = async (req, res) => {
   const { questionid } = req.params;
   const { userid } = req.body;

   // Verify ownership - Changed: Use $1, $2 and extract data from result.rows
   const checkQuery = "SELECT questionid FROM questions WHERE questionid = $1 AND userid = $2";
   const resultCheck = await pool.query(checkQuery, [questionid, userid]);
  const rows = resultCheck.rows;

   if (rows.length === 0)
      return res
         .status(StatusCodes.FORBIDDEN)
         .json({ message: "You can only delete your own question" });

   // Changed: Use pool.query and $1 placeholder
   await pool.query("DELETE FROM questions WHERE questionid = $1", [
      questionid,
   ]);
   res.json({ message: "Question deleted" });
};

// ask GPT (No changes needed, as this does not interact with the database)
const askgpt = async (req, res) => {
   const { question } = req.body;
   if (!question) return res.status(400).json({ error: "Question is required" });

   try {
      const response = await openai.chat.completions.create({
         model: "gpt-4o-mini",
         messages: [{ role: "user", content: question }],
      });

      const gptAnswer = response.choices[0].message.content;
      res.json({ answer: gptAnswer });
   } catch (err) {
      console.error("OpenAI error:", err);

      if (err.code === "insufficient_quota") {
         return res.status(429).json({
            error: "You exceeded your OpenAI quota. Check your plan and billing.",
         });
      }
      res.status(500).json({ error: err.message || "ChatGPT error" });
   }
};

module.exports = {
   getAllQuestions,
   askQuestion,
   askgpt,
   getSingleQuestion,
   editQuestion,
   deleteQuestion,
};
