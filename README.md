# Random Vision - Inspirational Quote Platform

Random Vision is a production-grade, secure, and responsive inspirational quote platform built using a modern decoupled architecture:

*   **Backend**: Java 21 / Spring Boot 3 REST API securing endpoints with stateless JWT authentication, refresh token rotations, Flyway migrations, and scheduled daily quote mail dispatchers.
*   **Frontend**: React 19 / Vite SPA structured with Material UI (MUI v6), custom fonts (Outfit, Inter), togglable premium dark/light mode themes, and personalized quote recommendations.
*   **Reverse Proxy**: Nginx container routing `/api/*` to the Spring Boot application and all other path variations to the React container.
*   **Mail Catcher**: Maildev SMTP server intercepting outgoing verification, password recovery, saved quote lists, and daily inspiration emails.

---

## Port Mappings & Services

When running under Docker Compose, the following services are available:

| Service | Host Port | Internal Port | Description |
| :--- | :--- | :--- | :--- |
| **Nginx (Entry)** | `80` | `80` | Client entrypoint routing frontend views and API requests |
| **Backend API** | `8080` | `8080` | REST API service |
| **Maildev Web** | `1080` | `1080` | Webmail GUI to inspect outbox logs and sent emails |
| **MySQL DB** | `3306` | `3306` | Persistent database storage |

---

## Seed Credentials & Database Mappings

The database is pre-seeded with two default accounts (passwords are `password123`):

*   **Admin User**:
    *   Username: `admin`
    *   Email: `admin@randomvision.com`
*   **Standard User**:
    *   Username: `user`
    *   Email: `user@randomvision.com`

---

## Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
*   [Docker & Docker Compose](https://www.docker.com/)
*   (Optional for local development) [JDK 21](https://adoptium.net/), [Maven](https://maven.apache.org/), and [Node.js (v20+)](https://nodejs.org/)

### Spin Up with Docker Compose

To build and launch the complete stack:

```bash
# Clone the repository and run at the project root
docker-compose up --build -d
```

Once successfully started:
1.  Open `http://localhost` in your browser to access the frontend dashboard.
2.  Open `http://localhost:1080` to view intercepted registration/verification emails.

---

## Development Verification Flow

1.  **Register a new user**: Go to `http://localhost/register` and submit a new username and email.
2.  **Verify email**: Open `http://localhost:1080` in your browser. Locate the verification email, copy the verification link, and navigate to it to activate your account.
3.  **Log In**: Sign in with your registered account.
4.  **Dashboard**: Spin new random quotes, view category chips, and click the Heart icon to favorite quotes.
5.  **Saved List**: View your favorites, search quotes by keywords, and click **Email Me My Saved List** to receive a rich HTML copy of your quotes in Maildev.
6.  **Admin Panel**: Sign in as `admin` to access the Admin dashboard, check system stats, list registered users, and perform CRUD actions on quotes.
