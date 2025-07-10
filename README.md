# 📝 Basic Full Stack Todo App

A simple, beginner-friendly full stack application built with HTML, CSS, JavaScript, and Node.js. Perfect for learning web development basics!

## 🎯 What You'll Learn

This project teaches you:
- How to build a complete web application from scratch
- Frontend and backend communication
- RESTful API design
- Data persistence
- Modern web development practices

## ✨ Features

- ✅ Add new todos
- ✅ Mark todos as completed
- ✅ Edit existing todos
- ✅ Delete todos
- ✅ View statistics (total and completed)
- ✅ Responsive design (works on mobile!)
- ✅ Data persistence using JSON file

## 🛠️ Tech Stack

**Frontend (What users see):**
- HTML5 - Structure of the web page
- CSS3 - Styling and animations
- Vanilla JavaScript - Interactive functionality

**Backend (Server-side):**
- Node.js - JavaScript runtime for the server
- Express.js - Web framework for building APIs
- File system - Simple data storage using JSON files

## 📁 Project Structure

```
fullstack-app/
├── server.js          # 🖥️  Backend server (handles API requests)
├── package.json       # 📦 Project dependencies and scripts
├── data/              # 💾 Data storage folder
│   └── todos.json     # 📄 File where todos are saved
├── public/            # 🌐 Frontend files (served to browser)
│   ├── index.html     # 📝 Main web page
│   ├── style.css      # 🎨 Styles and design
│   └── script.js      # ⚡ Frontend JavaScript logic
└── README.md          # 📖 This file
```

## 🚀 Quick Start

### Prerequisites (What you need first)

1. **Install Node.js** (if you haven't already):
   - Go to [nodejs.org](https://nodejs.org/)
   - Download and install the LTS version
   - Verify installation: open terminal and type `node --version`

### Installation Steps

1. **Download this project** (if you haven't already)

2. **Open your terminal/command prompt** and navigate to the project folder:
   ```bash
   cd path/to/fullstack-app
   ```

3. **Install dependencies** (download required packages):
   ```bash
   npm install
   ```
   
   This downloads Express and other packages needed for the project.

## 🏃 Running the Application

### Method 1: Basic Start
```bash
npm start
```

### Method 2: Development Mode (with auto-restart)
```bash
npm run dev
```

### What happens when you run it:
1. The server starts on port 3000
2. You'll see: "Server running on http://localhost:3000"
3. Open your browser and go to: **http://localhost:3000**
4. 🎉 Your todo app is now running!

## 📱 How to Use the App

1. **Add a todo**: Type in the input box and click "Add Todo" or press Enter
2. **Mark as complete**: Click the checkbox next to any todo
3. **Edit a todo**: Click the "Edit" button and change the text
4. **Delete a todo**: Click the "Delete" button (be careful!)
5. **View stats**: See your progress at the top of the page

## 🔗 API Endpoints (For developers)

The backend provides these API endpoints:

- `GET /api/todos` - Get all todos
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/:id` - Update a specific todo
- `DELETE /api/todos/:id` - Delete a specific todo

You can test these with tools like Postman or curl.

You can test these with tools like Postman or curl.

## 🎓 Learning Features

This project demonstrates key web development concepts:

### Frontend-Backend Communication
- How the browser talks to the server using JavaScript `fetch()` API
- Sending and receiving JSON data

### RESTful API Design
- Standard HTTP methods (GET, POST, PUT, DELETE)
- Clean URL structure (`/api/todos`)

### Data Persistence
- Saving data to a JSON file
- Data survives server restarts

### Error Handling
- Both client-side and server-side error handling
- User-friendly error messages

### Responsive Design
- Works on desktop, tablet, and mobile
- Modern CSS with flexbox and animations

## 🚀 Deployment Options

### Option 1: Local Development (Current)
- Run on your computer only
- Access at `http://localhost:3000`

### Option 2: Docker (Containerized)
```bash
docker build -t todo-app .
docker run -p 3000:3000 todo-app
```

### Option 3: Kubernetes (Advanced)
- See `KIND-DEPLOYMENT.md` for Kind cluster setup
- Production-ready with load balancing and scaling

### Option 4: Cloud Deployment
- **Heroku**: Easy deployment with git
- **Vercel**: Great for frontend + serverless functions
- **Railway**: Simple full-stack deployment
- **DigitalOcean**: VPS deployment

## 🐛 Troubleshooting

### Common Issues:

**"Command not found: npm"**
- Solution: Install Node.js from [nodejs.org](https://nodejs.org/)

**"Port 3000 is already in use"**
- Solution: Kill the process using port 3000 or change the port in `server.js`

**"Cannot GET /"**
- Solution: Make sure you're accessing `http://localhost:3000` (not just `localhost`)

**"Module not found"**
- Solution: Run `npm install` to install dependencies

## 🤝 Contributing

This is a learning project! Feel free to:
- Report bugs
- Suggest improvements
- Add new features
- Share your modifications

## 📚 Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/)
- [MDN Web Docs](https://developer.mozilla.org/) (HTML, CSS, JavaScript)
- [RESTful API Tutorial](https://restfulapi.net/)

## 📄 License

This project is open source and available under the MIT License.

---

**Happy coding! 🎉** If you run into any issues, check the troubleshooting section above or feel free to ask for help!
