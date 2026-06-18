# Production Deployment Guide

This document describes how to build, configure, and deploy the **Random Vision** application in a production environment.

## 1. Production Docker Staging

To deploy to production, you should separate the build outputs and override development environment variables (like SMTP details and JWT secrets).

### Recommended Production Compose Config (`docker-compose.prod.yml`)

Create a production compose override file to lock down ports and specify real secrets:

```yaml
version: '3.8'

services:
  db:
    image: mysql:8.0
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${PROD_DB_ROOT_PASSWORD}
      MYSQL_DATABASE: random_vision
      MYSQL_USER: rv_prod_user
      MYSQL_PASSWORD: ${PROD_DB_PASSWORD}
    volumes:
      - mysql_prod_data:/var/lib/mysql

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: always
    environment:
      - SPRING_DATASOURCE_URL=jdbc:mysql://db:3306/random_vision?useSSL=true&requireSSL=true&serverTimezone=UTC
      - SPRING_DATASOURCE_USERNAME=rv_prod_user
      - SPRING_DATASOURCE_PASSWORD=${PROD_DB_PASSWORD}
      - SPRING_MAIL_HOST=${SMTP_SERVER}
      - SPRING_MAIL_PORT=${SMTP_PORT}
      - SPRING_MAIL_USERNAME=${SMTP_USER}
      - SPRING_MAIL_PASSWORD=${SMTP_PASSWORD}
      - JWT_SECRET=${PROD_JWT_SECRET}
      - JWT_EXPIRATION_MS=1800000 # 30 mins
      - JWT_REFRESH_EXPIRATION_MS=604800000 # 7 days
      - UPLOAD_DIR=/app/uploads
    volumes:
      - upload_prod_data:/app/uploads

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    restart: always

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/prod.conf:/etc/nginx/conf.d/default.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro

volumes:
  mysql_prod_data:
  upload_prod_data:
```

---

## 2. Environment Variables Configuration

The following variables must be configured in your environment manager (or `.env` file) before deploying:

| Variable | Description | Recommendation |
| :--- | :--- | :--- |
| `PROD_DB_PASSWORD` | Database password | Cryptographically random string (e.g. 24+ characters) |
| `PROD_JWT_SECRET` | HS256 JWT sign key | Random string of at least 64 bytes (512 bits) |
| `SMTP_SERVER` | Real SMTP provider host | e.g. `smtp.sendgrid.net`, `smtp.gmail.com` |
| `SMTP_PORT` | SMTP Port | `587` (STARTTLS) or `465` (SSL) |
| `SMTP_USER` | SMTP Username | API Key or service username |
| `SMTP_PASSWORD` | SMTP Password | API Key secret or application password |

---

## 3. Security Hardening Checklist

1.  **JWT Signing Keys**: Never use the default JWT secret in production. Change `JWT_SECRET` immediately.
2.  **HTTPS / SSL Encryption**: Configure Nginx to redirect HTTP traffic on port 80 to HTTPS on port 443. Obtain free SSL certificates using Let's Encrypt / Certbot.
3.  **Root MySQL Permissions**: Avoid connecting the Backend application with the MySQL root account. Use the dedicated user (`rv_prod_user`) with restricted privileges on the `random_vision` database.
4.  **SMTP STARTTLS**: Configure Spring Mail properties to enforce authentication and encryption:
    ```properties
    spring.mail.properties.mail.smtp.auth=true
    spring.mail.properties.mail.smtp.starttls.enable=true
    ```
5.  **Disable CORS Wildcards**: In `SecurityConfig.java`, modify the `corsConfigurationSource()` to allow only your explicit production domain instead of `*`.
