# UniSphere - Backend Server API

This is the Spring Boot REST API for the UniSphere project. It manages the database interactions, user authentication, and business logic.

## Technical Details
- **Framework**: Spring Boot 3.2 (Java 17)
- **Database**: MongoDB (via MongoDB Atlas)
- **Authentication**: JWT & OAuth2 (Google)
- **File Storage**: Cloudinary (For profile pictures)

## How to Set Up

1. Open your terminal and navigate to the `backend` folder.
2. Build the project using Maven:
   ```bash
   mvn clean install
   ```
3. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
4. The server will start running on port `8081` (`http://localhost:8081/api`).

## Initial Configuration (.env)
You must create a `.env` file in the root of the `backend` folder containing the following configurations before starting the server:

```env
MONGODB_URI=your_mongodb_connection_string
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```
*(Development JWT secrets are mostly handled automatically by default configuration values in `application.properties` unless overridden in production).*

## Main Features (My Module)
- **OAuth2 Interception**: Validates domain specific emails before saving to prevent bad accounts.
- **Onboarding Flow**: Automatically marks students as approved, while pushing staff to a pending state.
- **Admin Endpoints**: Provides endpoints to fetch all users, toggle active status, and perform role-based approvals.
- **Notification Services**: Backend structure to send and retrieve user-specific alerts.
