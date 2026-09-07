# DevPilot

**DevPilot** is a minimalist, modern GitHub Repository Analysis and Code Intelligence Platform. It provides real-time multi-language repository indexing, AST code syntax parsing, SAST security auditing placeholders, and seamless GitHub OAuth2 integration.

---

## Technical Architecture

### Frontend (`/client`)
- **Core Framework**: React 18 + Vite 5
- **Styling**: Tailwind CSS v4 + Lucide Icons
- **Design System**: Pure white theme (`#ffffff`), Geist/Inter typography, responsive grid cards, and custom toast notification system.
- **State Management**: React Context (`AuthContext`, `ToastContext`), Unified Query Caching, and custom hooks (`useRepos`).

### Backend (`/backend`)
- **Core Framework**: Spring Boot 3.4 + JDK 21
- **Persistence**: Spring Data JPA + Flyway Database Migrations
- **Database Support**: Zero-config H2 In-Memory DB (default for local dev) or MySQL 8.0 (production/Docker)
- **Security**: Spring Security + GitHub OAuth2 Authentication

---

## Getting Started

### 1. Prerequisites
- **JDK 21+**
- **Node.js 18+** & `npm`
- *(Optional)* Docker & Docker Compose (for local MySQL database)

### 2. Backend Setup
Navigate to the `backend` directory and launch the Spring Boot server:
```bash
cd backend
./mvnw spring-boot:run
```
The backend REST API will start at `http://localhost:8080`.

### 4. Frontend Setup
In a separate terminal, navigate to the `client` directory:
```bash
cd client
npm install
npm run dev
```
The Vite development server will start at `http://localhost:3000` with automated proxy routing to the backend.

---

## Features
- **GitHub OAuth2 Login**: Secure authentication flow with user profile and token mapping.
- **Demo Mode**: Explore full analytical features out-of-the-box without requiring GitHub OAuth credentials.
- **Repository Management**: Search, filter by language (TS, JS, Java, C++, Python, Go, Rust), sync repositories, and view indexing status.
- **Interactive Connection**: Connect repositories for real-time analysis and query context attachment.

---

## License
MIT License &copy; 2026 DevPilot.
