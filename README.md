# Health Center Medicine Stock and Expiry Monitor

**A React and Laravel Web Application for Barangay Health Centers**

Developed by: Jeneza Garcia  
Course: BSIT-3 DC4

## About the Project

The Health Center Medicine Stock and Expiry Monitor is a web-based application designed to help barangay health centers manage medicine inventory, monitor expiration dates, and handle stock requests.

The system provides separate access for administrators and staff. Administrators manage medicines and medicine batches and process stock requests, while staff can view available inventory and submit stock-out requests.

## Features

- User registration, login, logout, and authentication using Laravel Sanctum.
- Administrator and Staff roles with backend permission enforcement.
- Medicine management: create, view, update, and delete.
- Medicine batch management with quantities and expiration dates.
- Search, filtering, and pagination for inventory lists.
- Expiration monitoring: Active, Expiring Soon, and Expired.
- Low-stock indicators based on reorder levels.
- Stock request workflow: Pending, Approved, Completed, and Rejected.
- Stock deduction from the earliest-expiring batches when a request is completed.
- Dashboard summaries and recent transactions.
- Form validation, loading and error messages, and delete confirmations.

## Technology Stack

- **Frontend:** React, Vite, React Router, Axios
- **Backend:** Laravel, PHP, Laravel Sanctum
- **Database:** MySQL
- **API Testing:** Thunder Client

Confirm the exact Laravel version and other requirements in the project's configuration files before final submission.

## Requirements

Install the following software before setting up the project:

- PHP version supported by the Laravel application
- Composer
- Node.js and npm
- MySQL
- Git

## Installation and Setup

### 1. Clone the Repository

```bash
git clone [https://github.com/eza-alt/DC4_FinalProject_medicine_monitor.git]
cd medicine-monitor
```

Replace the repository URL with your actual GitHub repository URL.

### 2. Set Up the Laravel Backend

```bash
cd backend
composer install
copy .env.example .env
php artisan key:generate
```

Create a MySQL database named `medicine_monitor` using your database management tool. Update the database settings in `backend/.env` to match your local MySQL configuration.

Run the migrations and seeders:

```bash
php artisan migrate --seed
```

Start the backend server:

```bash
php artisan serve
```

The API should be available at:

`http://127.0.0.1:8000`

### 3. Set Up the React Frontend

Open a **second terminal** in VS Code and run:

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Open the local URL displayed by Vite in the terminal. It is commonly `http://localhost:5173`, but Vite may select another port if that port is already in use.

Make sure the frontend environment configuration points to the running Laravel API.

## User Roles

### Administrator

- View the dashboard and inventory.
- Create, update, and delete medicines.
- Create, update, and delete medicine batches.
- View stock requests and update their status.
- Review inventory and expiration information.

### Staff

- View medicines and batches.
- Submit stock-out requests.
- View permitted stock request records.
- Access only the features allowed by their role.

## Demo Accounts

Use the demo accounts configured by the project seeders. Verify the actual email addresses and passwords in the seeder files before sharing this README or presenting the application.

| Role | Email | Password |
|---|---|---|
| Administrator | `admin@healthcenter.test` | `password123`* |
| Staff | `staff@healthcenter.test` | `password123`* |
| Staff | `ana@healthcenter.test` | `password123`* |

\*Confirm these credentials against the actual seeders and test them on a fresh database before submission. Change or remove any credentials that do not work.

## API Documentation

Protected API endpoints require a valid authentication token. Include the following headers when testing protected endpoints:

```http
Accept: application/json
Authorization: Bearer 

admin:14|W4iPfxOTf5Vd4gISX2VXz9Ttkc6rXVXpeVPLYzTue0bdcb9e

staff:15|QtZHZMl42Vlj7JbrZMdko1pEjA9pNUBajK1Znkrk4fc32d52
```

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/register` | Public |
| POST | `/api/login` | Public |
| POST | `/api/logout` | Authenticated |
| GET | `/api/user` | Authenticated |
| GET | `/api/dashboard` | Authenticated |
| GET | `/api/medicines` | Authenticated |
| GET | `/api/medicines/{id}` | Authenticated |
| POST | `/api/medicines` | Administrator |
| PUT | `/api/medicines/{id}` | Administrator |
| DELETE | `/api/medicines/{id}` | Administrator |
| GET | `/api/batches` | Authenticated |
| GET | `/api/batches/{id}` | Authenticated |
| POST | `/api/batches` | Administrator |
| PUT | `/api/batches/{id}` | Administrator |
| DELETE | `/api/batches/{id}` | Administrator |
| GET | `/api/stock-requests` | Authenticated |
| POST | `/api/stock-requests` | Authenticated |
| DELETE | `/api/stock-requests/{id}` | Owner or Administrator, subject to backend rules |
| PATCH | `/api/stock-requests/{id}/status` | Administrator |

screenshots are in docs/screenshots

## Database Design
check docs/erd.png

## Screenshots

Save the application screenshots in `docs/screenshots/`.

Include screenshots of the login page, administrator dashboard, medicines list, validation errors, delete confirmation, filtered expired batches, staff requests, administrator requests, and a mobile-width layout.


## References and Acknowledgments



Additional resources and AI assistance used: claude, chatgpt