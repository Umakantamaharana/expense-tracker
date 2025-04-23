# 🏠 Roommate Expense Tracker

A modern, real-time expense tracking application designed specifically for roommates to manage shared expenses and settle bills efficiently. Built with Node.js, Express, MongoDB, and vanilla JavaScript.

![Roommate Expense Tracker](https://raw.githubusercontent.com/yourusername/expense-tracker/main/screenshot.png)

## ✨ Features

- **Real-time Expense Tracking**
  - Add expenses with details (item, price, person, date, and notes)
  - View a chronological list of all expenses
  - Delete expenses with confirmation
  - Responsive and user-friendly interface

- **Smart Statistics**
  - Total expenses overview
  - Per-person expense breakdown
  - Automatic calculation of who owes whom
  - Real-time settlement suggestions

- **Clean & Modern UI**
  - Bootstrap 5 for responsive design
  - Intuitive card-based layout
  - Interactive notifications
  - Mobile-friendly interface

## 🚀 Technologies Used

- **Backend**
  - Node.js
  - Express.js
  - MongoDB with Mongoose
  - RESTful API architecture

- **Frontend**
  - Vanilla JavaScript (ES6+)
  - Bootstrap 5
  - HTML5 & CSS3
  - Bootstrap Icons

- **Security**
  - Helmet.js for security headers
  - Rate limiting
  - Input validation
  - XSS protection
  - CORS enabled

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/expense-tracker.git
   cd expense-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   PORT=3000
   ```

4. Start the server:
   ```bash
   npm start
   ```

5. Open `http://localhost:3000` in your browser

## 🌐 Deployment

### Backend Deployment (Render)

1. Create a free account on [Render](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Set the following environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `PORT`: 10000 (or any port Render assigns)
5. Deploy the service

### Frontend Deployment (GitHub Pages)

1. Create a new repository named `expense-tracker-frontend`
2. Copy the following files to the new repository:
   - `public/index.html`
   - `public/script.js`
   - `public/style.css`
3. Update the API URL in `script.js`:
   ```javascript
   const API_URL = 'https://your-backend-url.onrender.com/api/expenses';
   ```
4. Enable GitHub Pages in repository settings:
   - Go to Settings > Pages
   - Select main branch as source
   - Save the settings

Your application will be available at: `https://yourusername.github.io/expense-tracker-frontend`

## 🛠️ API Endpoints

- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Add new expense
- `DELETE /api/expenses/:id` - Delete an expense
- `GET /api/statistics` - Get expense statistics and settlements

## 💡 Usage

1. **Adding Expenses**
   - Fill in the expense details (item, price, person, date, note)
   - Click "Add Expense" to record the transaction
   - View the expense in the list below

2. **Viewing Statistics**
   - Total expenses are shown in the blue card
   - Individual contributions are displayed in the middle card
   - Settlement details appear in the right card

3. **Managing Expenses**
   - View all expenses in chronological order
   - Delete any expense using the delete button
   - See real-time updates in statistics

## 🔒 Security Features

- Content Security Policy (CSP) implementation
- Rate limiting to prevent abuse
- Input validation and sanitization
- Secure HTTP headers with Helmet.js
- MongoDB injection protection
- XSS attack prevention

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Bootstrap for the amazing UI components
- MongoDB for the reliable database
- Express.js for the robust backend framework
- The open-source community for inspiration and support 