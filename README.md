# ChatType

![ChatType Banner](https://via.placeholder.com/1200x300?text=ChatType+Real-time+Communication+Redefined)

**ChatType** is a modern, full-stack real-time chat application built to demonstrate scalable architecture, seamless user experience, and robust performance. It leverages a powerful stack comprising **React 19**, **Node.js**, **Socket.io**, and **MongoDB**, wrapped in a type-safe **TypeScript** environment.

Whether you're looking for real-time messaging, secure user authentication (including Google OAuth), or media sharing, ChatType delivers it all with a sleek, responsive UI powered by **TailwindCSS (v4)** and **Ant Design**.

---

## 🚀 Features

- **Real-time Messaging**: Instant communication powered by Socket.io.
- **Secure Authentication**: Traditional Email/Password login & **Google OAuth** integration via Passport.js.
- **Robust Security**: JWT-based authentication with cookie management, Helmet for headers, and secure password hashing.
- **Media Sharing**: Upload and share images smoothly using **Cloudinary** and **Multer**.
- **Interactive UI**: Rich user experience with **Framer Motion** animations and **Emoji Mart** integration.
- **Responsive Design**: Mobile-first approach using **TalwindCSS v4**.
- **State Management**: Scalable state handling with **Redux Toolkit**.
- **Form Handling**: Robust form validation using **Zod** and **React Hook Form**.
- **Containerization**: Fully Dockerized for easy deployment.

---

## 🛠 Tech Stack

### Frontend

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [TailwindCSS v4](https://tailwindcss.com/), [Ant Design](https://ant.design/), [Framer Motion](https://www.framer.com/motion/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Utilities**: Axios, Zod, Lucide React, Emoji Mart

### Backend

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [MongoDB](https://www.mongodb.com/) with Mongoose ODM
- **Real-time**: [Socket.io](https://socket.io/)
- **Authentication**: Passport.js (Google OAuth), JWT, BCrypt
- **File Storage**: Cloudinary, Multer
- **Email**: Nodemailer, Resend

### DevOps

- **Containerization**: Docker & Docker Compose

---

## 📂 Project Structure

```bash
ChatType/
├── backend/                # Server-side logic
│   ├── src/
│   │   ├── config/         # DB & App configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # Express routes
│   │   ├── services/       # Business logic services
│   │   ├── socket.io/      # Socket event handlers
│   │   ├── middlewares/    # Auth & Error middlewares
│   │   └── index.ts        # Entry point
│   ├── .env                # Environment variables
│   └── package.json
├── frontend/               # Client-side application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── store/          # Redux setup
│   │   ├── pages/          # Application views
│   │   └── App.tsx
│   ├── vite.config.ts
│   └── package.json
└── docker-compose.yml      # Docker orchestration
```

---

## 🏁 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Docker & Docker Compose](https://www.docker.com/) (Optional, for containerized run)
- [MongoDB](https://www.mongodb.com/try/download/community) (If running locally without Docker)

---

### 🔧 Installation & Running Locally

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/ChatType.git
   cd ChatType
   ```

2. **Environment Setup**
   Create a `.env` file in the `backend` directory based on your `.env.example` (if available) or ensure the following variables are set:

   ```env
   # backend/.env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   CLIENT_URL=http://localhost:5173
   ```

3. **Install Dependencies**

   **Backend:**

   ```bash
   cd backend
   npm install
   ```

   **Frontend:**

   ```bash
   cd ../frontend
   npm install
   ```

4. **Start the Application**

   **Start Backend:**

   ```bash
   # Inside backend/
   npm run dev
   ```

   _Server runs on http://localhost:5000_

   **Start Frontend:**

   ```bash
   # Inside frontend/
   npm run dev
   ```

   _Client runs on http://localhost:5173_

---

### 🐳 Running with Docker

You can easily spin up the entire application using Docker Compose.

1. **Build and Run**

   ```bash
   # From the root directory
   docker-compose up --build
   ```

   This command will:
   - Build the backend and frontend images.
   - Start the backend service on port `5000`.
   - Start the frontend service on port `5173` (or as configured in `docker-compose.yml`).

2. **Stop Containers**
   ```bash
   docker-compose down
   ```

---

## 🤝 Contributing

Contributions are welcome! If you have any ideas, suggestions, or bug reports, please open an issue or submit a pull request.

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
