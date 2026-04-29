# UniSphere - Backend Server API

This is the Spring Boot REST API for the UniSphere project. It manages database interactions, user authentication, and core business logic.

---

## 🛠️ Tech Stack
- **Framework**: Spring Boot 3.2 (Java 17)
- **Database**: MongoDB (via MongoDB Atlas)
- **Authentication**: JWT & OAuth2 (Google)
- **File Storage**: Cloudinary

## 📋 Prerequisites
- **Java Development Kit (JDK) 17** or higher.
- **MongoDB** (Local or Atlas connection string).
- **Maven** (Optional, as the project includes a wrapper).

## 🚀 Getting Started

### 1. Environment Configuration
Create a `.env` file in the `backend/` root directory and add the following:

```env
MONGODB_URI=your_mongodb_connection_string
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 2. Install & Run
Open your terminal in the `backend` folder:

**Windows (PowerShell):**
```powershell
.\mvnw.cmd clean install
.\mvnw.cmd spring-boot:run
```

**Mac/Linux/Git Bash:**
```bash
./mvnw clean install
./mvnw spring-boot:run
```

The server will be available at: `http://localhost:8081/api`

---

## 🌟 Project Modules

### 1. Authentication and Notification Module
- **OAuth2 Integration**: Secure Google login with domain validation.
- **Onboarding Flow**: Role-specific registration and approval workflows.
- **Real-time Notifications**: Backend support for user alerts and activity tracking.
- **Admin Tools**: Comprehensive user management and role-based access control.

### 2. Booking Management Module
- **Resource Reservation**: Core logic for booking campus facilities and equipment.
- **Availability Checking**: Ensures no double-bookings and manages time slots.
- **Booking Status**: Tracks pending, approved, and cancelled reservations.

### 3. Resource Management Module
- **Inventory Tracking**: Manage details of campus resources, including status and location.
- **Image Integration**: Connected to Cloudinary for visual resource management.
- **CRUD Operations**: Complete management of resource metadata.

### 4. Ticketing Module
- **Issue Tracking**: System for students and staff to report issues or request help.
- **Status Updates**: Lifecycle management of tickets from 'Open' to 'Resolved'.
- **Comments & Feedback**: Threaded communication on specific tickets or resources.
