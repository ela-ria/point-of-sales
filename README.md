# Point of Sales (POS) System

A full-stack point of sale application built with React (frontend) and Laravel (backend). This system provides comprehensive tools for managing sales transactions, products, users, and generating audit reports.

## Project Overview

This is a modern POS system designed to streamline retail operations with role-based access control, transaction management, and detailed reporting capabilities.

### Features

- **Sales Management** - Process customer transactions and manage receipts
- **Product Management** - Create, update, and manage product inventory
- **User Management** - Manage users with different roles and permissions
- **Audit Logging** - Track all system activities and transactions
- **Admin Dashboard** - View key metrics and system overview
- **Reports** - Generate transaction reports and audit logs
- **Role-Based Access Control** - Supervisor and admin roles with different permissions

## Tech Stack

### Frontend
- **React** - UI library
- **JavaScript** - Core language
- **CSS** - Styling

### Backend
- **Laravel** - Web application framework
- **PHP** - Server-side language
- **Laravel Sanctum** - API authentication
- **CORS** - Cross-origin resource sharing configured

## Project Structure

```
point-of-sales/
├── frontend (React app)
│   ├── src/
│   │   ├── auth/          - Login and user management pages
│   │   ├── components/    - Reusable UI components
│   │   ├── pages/         - Main application pages
│   │   ├── reports/       - Reporting pages
│   │   └── App.js         - Main app component
│   ├── public/
│   └── package.json
│
└── backend (Laravel app)
    ├── app/               - Application code
    ├── bootstrap/         - Application bootstrapping
    ├── config/            - Configuration files (CORS, etc.)
    ├── database/          - Database migrations and seeds
    ├── routes/            - API routes
    └── vendor/            - Dependencies
```

## Getting Started

### Prerequisites
- Node.js and npm (for frontend)
- PHP 8.1+ (for backend)
- Composer (for backend dependencies)

### Installation & Running

#### Frontend
```bash
npm install
npm start
```
The app will open at [http://localhost:3000](http://localhost:3000)

#### Backend
```bash
cd backend
composer install
php artisan serve
```
The API will run at [http://localhost:8000](http://localhost:8000)

## Main Pages & Components

### Pages
- **AdminDashboard** - System overview and metrics
- **POSPage** - Main point of sale interface
- **ProductsPage** - Product management
- **LoginPage** - User authentication
- **TransactionsPage** - Transaction history
- **AuditLog** - System activity logs
- **SupervisorPage** - Supervisor dashboard

### Components
- **Sidebar** - Navigation menu
- **Receipt** - Receipt display and printing
- **Modals** - Dialog components
- **PrintReceipt** - Print functionality

## Configuration

### CORS Settings
API CORS is configured in `backend/config/cors.php` to allow requests from:
- http://localhost:3000
- http://localhost:5173

### Environment Variables
Configure backend settings in `backend/.env`

## API Endpoints

The backend provides REST API endpoints for:
- Authentication (Sanctum)
- Product management
- Transaction processing
- User management
- Audit logging

## Development Notes

- The frontend is built with Create React App
- The backend follows Laravel conventions
- Role-based middleware is implemented for access control
- CORS is enabled for frontend-backend communication

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
