# Roommate Expense Tracker

A web application to track and split expenses among roommates. Built with Node.js, Express, and MongoDB.

## Features

- Add and track expenses with details (item, price, person, date, note)
- Automatic expense splitting among roommates
- Monthly expense tracking
- Settlement calculations showing who owes whom
- Responsive design for both desktop and mobile
- Secure reset functionality with confirmation

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm (Node Package Manager)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd expense-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following content:
   ```
   MONGODB_URI=mongodb://localhost:27017/expense-tracker
   PORT=3000
   ```
   Note: Modify the MongoDB URI if you're using a different database configuration.

4. Start MongoDB:
   ```bash
   # If using MongoDB locally
   mongod
   ```

## Running the Application

1. Start the server:
   ```bash
   npm start
   ```
   For development with auto-reload:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Usage Guide

### Adding Expenses

1. Fill in the expense form with:
   - Item name
   - Price (in ₹)
   - Person who paid
   - Date
   - Optional note

2. Click "Add Expense" to save

### Viewing Statistics

The dashboard shows:
- Total expenses for the current month
- Per-person expense breakdown
- Settlement details showing who owes whom

### Deleting Expenses

1. Find the expense in the list
2. Click the "Delete" button
3. Confirm the deletion

### Resetting All Expenses

1. Navigate to `/reset.html`
2. Click "Reset All Expenses"
3. Confirm twice to prevent accidental resets

## API Endpoints

- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Add new expense
- `DELETE /api/expenses/:id` - Delete an expense
- `GET /api/statistics` - Get expense statistics
- `POST /api/reset` - Reset all expenses

## Project Structure

```
expense-tracker/
├── public/              # Static files
│   ├── index.html      # Main application page
│   ├── reset.html      # Reset page
│   ├── style.css       # Styles
│   └── script.js       # Client-side JavaScript
├── src/
│   ├── models/         # Database models
│   ├── controllers/    # Route controllers
│   ├── routes/         # API routes
│   └── middleware/     # Custom middleware
├── server.js           # Main server file
├── package.json        # Project dependencies
└── .env               # Environment variables
```

## Security Features

- Content Security Policy (CSP) implementation
- Input validation and sanitization
- Rate limiting
- Secure headers with Helmet
- Environment variable protection

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 