# TrackMySem

**TrackMySem** is a comprehensive academic management dashboard designed for university students to track their semester progress, manage assignments, and maintain study momentum.

It features a modern, dark-themed UI built with React and a robust Node.js/SQLite backend for data persistence.

<img width="1792" height="984" alt="Screenshot 2026-02-19 at 10 19 33 PM" src="https://github.com/user-attachments/assets/40d861b2-c59b-45ec-82b0-11cd274d68d7" />
 

## 🚀 Features

-   **Dashboard Hub**: Centralized view of today's tasks, upcoming deadlines, and study momentum.
-   **Subject Management**: detailed tracking of subjects, including code, credits, and status (e.g., "On Track", "Falling Behind").
-   **Task Management**: Create, edit, and complete tasks (Assignments, Exams, Study sessions).
-   **Momentum Tracker**: specific widget to track daily study streaks and total study hours.
-   **Course Selection**: Onboarding flow to select your specific engineering programme and semester.
-   **Semester Planning**: Visualize and manage your academic journey across all 8 semesters.
-   **Productivity Tools**:
    -   **Focus Mode**: Set daily goals.
    -   **Live Clock**: Keep track of time.
    -   **Smart Suggestions**: AI-like suggestions for what to focus on next.

## 🛠 Tech Stack

-   **Frontend**: React, Vite, Framer Motion (animations), Lucide React (icons).
-   **Backend**: Node.js, Express.js.
-   **Database**: SQLite (local file-based SQL database).
-   **Styling**: Plain CSS with CSS Variables for theming (Dark Mode default).
-   **Authentication**: Custom JWT-based auth (for demo purposes).

## ⚙️ Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/dorothiiy/trackmysem.git
    cd trackmysem
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Initialize Database**
    The database (`database.sqlite`) is auto-created on the first server run.
    
    To seed initial data (optional but recommended for dev):
    ```bash
    # The server automatically seeds data on first run if specific tables are empty.
    # You can also manually trigger seed scripts if available in package.json
    ```

4.  **Run the Application**
    We use `concurrently` to run both client and server:
    ```bash
    npm run dev
    ```
    -   Frontend: `http://localhost:5173`
    -   Backend: `http://localhost:3000`

## 🗂 Project Structure

```
TrackMySem/
├── public/              # Static assets
├── server/              # Backend Express app
│   ├── routes/          # API endpoints (auth, study, tasks, etc.)
│   ├── db.js            # SQLite connection & seeding logic
│   ├── index.js         # Server entry point
│   └── ...
├── src/                 # Frontend React app
│   ├── components/      # Reusable UI components
│   │   ├── Auth/        # Login/Register screens
│   │   ├── Dashboard/   # Main dashboard widgets & views
│   │   └── Layout/      # Sidebar, Topbar, Layout wrappers
│   ├── contexts/        # React Context (Auth, Dashboard, Subject)
│   ├── App.jsx          # Main App component & Routing
│   └── main.jsx         # Entry point
├── .gitignore           # Git ignore rules
├── package.json         # Dependencies & Scripts
└── README.md            # Project Documentation
```

## 🤝 Contributing

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
