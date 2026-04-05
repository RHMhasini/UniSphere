# Smart Campus Operations Hub - Backend API

Spring Boot REST API for Smart Campus Operations Hub. This API provides endpoints for managing facility bookings, incident ticketing, and user notifications.

## Technology Stack

- **Framework**: Spring Boot 3.2.0
- **Language**: Java 17
- **Database**: MySQL 8.0
- **Authentication**: OAuth 2.0 + JWT
- **Build Tool**: Maven
- **ORM**: JPA/Hibernate

## Project Structure

```
src/main/java/com/unisphere/
├── config/              # Configuration classes (Security, CORS, JWT, Database)
├── controller/          # REST Controllers (Auth, Resource, Booking, Ticket, Notification)
├── service/             # Business Logic Layer
├── repository/          # Data Access Layer (Spring Data JPA)
├── entity/              # JPA Entity classes
├── dto/                 # Data Transfer Objects (Request/Response)
├── exception/           # Custom Exception classes
├── security/            # Security utilities (JWT, OAuth2)
├── util/                # Utility classes
└── validation/          # Custom validation annotations

src/main/resources/
├── application.properties       # Main configuration
├── application-dev.properties   # Development profile
├── application-prod.properties  # Production profile
└── db/migration/                # Flyway database migrations
```

## Prerequisites

- Java 17 or higher
- MySQL 8.0
- Maven 3.6+
- Environment variables configured (see `.env.example`)

## Setup & Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd backend
```

### 2. Database Configuration
Create a MySQL database:
```sql
CREATE DATABASE unisphere_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL=jdbc:mysql://localhost:3306/unisphere_db
DATABASE_USERNAME=root
DATABASE_PASSWORD=yourpassword
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=86400000
```

### 4. Install Dependencies & Build
```bash
mvn clean install
```

### 5. Run the Application
```bash
mvn spring-boot:run
```

The API will be available at `http://localhost:8080/api`

### 6. Development with Hot Reload
```bash
mvn clean install -DskipTests
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```

## Database Migrations

Database migrations are automatically applied on startup using Flyway.

Migration files location: `src/main/resources/db/migration/`

To add a new migration:
1. Create a new SQL file: `V<number>__<Description>.sql`
2. Place it in `src/main/resources/db/migration/`
3. Restart the application

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/oauth2/callback` - OAuth 2.0 callback
- `POST /api/auth/logout` - User logout
- `GET /api/auth/user` - Get current user

### Resources (Facilities & Assets)
- `GET /api/resources` - Get all resources
- `POST /api/resources` - Create new resource
- `GET /api/resources/{id}` - Get resource details
- `PUT /api/resources/{id}` - Update resource
- `DELETE /api/resources/{id}` - Delete resource

### Bookings
- `GET /api/bookings` - Get all bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/{id}` - Get booking details
- `PUT /api/bookings/{id}` - Update booking
- `PUT /api/bookings/{id}/approve` - Approve booking (Admin)
- `PUT /api/bookings/{id}/reject` - Reject booking (Admin)
- `DELETE /api/bookings/{id}` - Cancel booking

### Tickets
- `GET /api/tickets` - Get all tickets
- `POST /api/tickets` - Create ticket
- `GET /api/tickets/{id}` - Get ticket details
- `PUT /api/tickets/{id}` - Update ticket status
- `DELETE /api/tickets/{id}` - Delete ticket
- `POST /api/tickets/{id}/comments` - Add comment
- `POST /api/tickets/{id}/attachments` - Upload attachment

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread` - Get unread notifications
- `PUT /api/notifications/{id}/read` - Mark as read

## Testing

Run unit tests:
```bash
mvn test
```

Run integration tests:
```bash
mvn verify
```

Generate test coverage:
```bash
mvn jacoco:report
```

## API Documentation

Postman collection available: `../../postman/UniSphere_API_Collection.json`

Import into Postman:
1. Open Postman
2. Click "Import"
3. Select the JSON file
4. Configure environment variables in Postman
5. Start testing endpoints

## Security

- OAuth 2.0 for third-party authentication (Google)
- JWT for API token-based authentication
- Role-based access control (USER, ADMIN, TECHNICIAN, MANAGER)
- Password encryption using BCrypt

## Logging

Logs are configured in `application.properties`:
- Development: DEBUG level
- Production: WARN level
- Logs location: Console and optional file appender

## Troubleshooting

### Database Connection Issues
- Ensure MySQL is running
- Check database credentials in `application.properties`
- Verify database exists: `SHOW DATABASES;`

### OAuth 2.0 Issues
- Confirm Google Client ID and Secret are set
- Check redirect URI matches Google Cloud Console

### Migration Errors
- Clear database and recreate: `DROP DATABASE unisphere_db;`
- Disable existing migrations: Set `flyway.baselineOnMigrate=true`

## Contributing

1. Create a feature branch
2. Commit changes with clear messages
3. Push to repository
4. Create Pull Request

## License

This project is part of the Smart Campus Operations Hub assignment (IT3030).

## Support

For issues or questions, contact the development team or create an issue in the repository.
