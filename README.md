# 🚗 Vehicle Rental System API

## 📌 Project Name
**Vehicle Rental System**

## 🌐 Live URL
👉 https://assignment-2-vert.vercel.app/

## 📂 GitHub Repository
👉 https://github.com/FozleRabbi1/L2B6A2

---

## 🎯 Project Overview
The **Vehicle Rental System** is a backend RESTful API designed to manage vehicle rentals efficiently.  
It provides complete functionality for vehicle inventory management, user authentication, and booking lifecycle handling with role-based access control.

The system supports:
- Secure authentication using JWT
- Role-based authorization (Admin & Customer)
- Automated booking return logic
- Clean, modular, and scalable architecture

---

## ✨ Key Features
- User registration and authentication with JWT
- Role-based access control (Admin & Customer)
- Vehicle inventory management with availability tracking
- Booking creation, cancellation, and return handling
- Automatic price calculation based on rental duration
- Auto-return system when rental period ends
- Secure password hashing using bcrypt
- Modular and feature-based code structure

---

## 🛠️ Technology Stack
- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Authentication:** JSON Web Token (JWT)
- **Security:** bcrypt for password hashing
- **ORM / Query Layer:** PostgreSQL native / query-based

---

## 📁 Project Structure
The project follows a **modular and feature-based architecture** with a clear separation of concerns.



Each module contains:
- Routes
- Controllers
- Services
- Validations (if applicable)

---

## 📊 Database Schema

### Users Table
| Field | Description |
|-----|------------|
| id | Auto-generated |
| name | Required |
| email | Required, unique, lowercase |
| password | Required, minimum 6 characters |
| phone | Required |
| role | `admin` or `customer` |

### Vehicles Table
| Field | Description |
|-----|------------|
| id | Auto-generated |
| vehicle_name | Required |
| type | `car`, `bike`, `van`, or `SUV` |
| registration_number | Required, unique |
| daily_rent_price | Required, positive |
| availability_status | `available` or `booked` |

### Bookings Table
| Field | Description |
|-----|------------|
| id | Auto-generated |
| customer_id | References Users table |
| vehicle_id | References Vehicles table |
| rent_start_date | Required |
| rent_end_date | Required (after start date) |
| total_price | Required, positive |
| status | `active`, `cancelled`, or `returned` |

---

## 🔐 Authentication & Authorization

### User Roles
- **Admin**
  - Full system access
  - Manage users, vehicles, and all bookings
- **Customer**
  - Register and login
  - View vehicles
  - Create and manage own bookings

### Authentication Flow
- Passwords are hashed using **bcrypt**
- Login returns a **JWT token**
- Protected routes require:


- Unauthorized access returns:
- `401 Unauthorized`
- `403 Forbidden`

---

## 🌐 API Endpoints

### 🔑 Authentication
| Method | Endpoint | Access | Description |
|------|--------|-------|------------|
| POST | `/api/v1/auth/signup` | Public | Register new user |
| POST | `/api/v1/auth/signin` | Public | Login and receive JWT |

### 🚘 Vehicles
| Method | Endpoint | Access | Description |
|------|--------|-------|------------|
| POST | `/api/v1/vehicles` | Admin | Add new vehicle |
| GET | `/api/v1/vehicles` | Public | View all vehicles |
| GET | `/api/v1/vehicles/:vehicleId` | Public | View vehicle details |
| PUT | `/api/v1/vehicles/:vehicleId` | Admin | Update vehicle |
| DELETE | `/api/v1/vehicles/:vehicleId` | Admin | Delete vehicle |

### 👤 Users
| Method | Endpoint | Access | Description |
|------|--------|-------|------------|
| GET | `/api/v1/users` | Admin | View all users |
| PUT | `/api/v1/users/:userId` | Admin / Own | Update user |
| DELETE | `/api/v1/users/:userId` | Admin | Delete user |

### 📦 Bookings
| Method | Endpoint | Access | Description |
|------|--------|-------|------------|
| POST | `/api/v1/bookings` | Customer/Admin | Create booking |
| GET | `/api/v1/bookings` | Role-based | View bookings |
| PUT | `/api/v1/bookings/:bookingId` | Role-based | Cancel / Return booking |

---

## ⚙️ Environment Variables
Create a `.env` file in the root directory:

```env
PORT=5000
CONNECTION_STRING=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_key
