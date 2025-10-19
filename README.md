# 🗣️ Evangadi Forum - Backend API

Welcome to the **Evangadi Forum** backend – a RESTful API that powers a Question & Answer platform built for Evangadi community members. This backend service handles user authentication, posting questions, retrieving answers, and more.

---

## 🌟 Features

- ✅ **User Authentication**
  - Sign up and login with secure password hashing (bcrypt)
  - JWT-based session authentication
- ❓ **Questions API**
  - Create a new question
  - Get all questions
  - Get a single question by ID
- 💬 **Answers API**
  - Post an answer to a question
  - Get all answers for a specific question (via query parameter)

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL (with connection pooling)
- **Authentication**: JWT (JSON Web Tokens)
- **Other Tools**: bcrypt, dotenv, OpenAI API (if applicable)

---

## 📁 Project Structure

``` yaml
Evangadi-forum-backend/  
│  
├── controllers/  
│ ├── userController.js  
│ ├── questionController.js  
│ └── answerController.js  
│  
├── routes/  
│ ├── userRoutes.js  
│ ├── questionRoutes.js  
│ └── answerRoutes.js  
│  
├── middleware/  
│ └── authMiddleware.js  
│  
├── db/  
│ └── connection.js  
│  
├── .env  
├── app.js  
├── package.json  
└── README.md

```

---

## 🚀 Getting Started

### 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Dese-1216/Evangadi-Fourm.git
   cd evangadi-forum-backend
Install dependencies


```bash
npm install
```

🛡️ Environment Variables
Create a .env file and add the following variables:

``` .env
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_DATABASE=evangadi_forum
DB_CONNECTION_LIMIT=10

JWT_SECRET=your_jwt_secret_key
OPENAI_API_KEY=your_openai_key_if_needed
```

▶️ Running the Server
Start the server with:


`npm start`
The API will be available at:
http://localhost:5000 (default port unless changed)



🙌 Contributing
We welcome contributions! Please fork the repository and submit a pull request for any improvements or bug fixes. Be sure to follow clean code practices.

📄 License
This project is licensed under the MIT License.

Made with ❤️ by the Evangadi March 29 Batch Group 2 Water Team
