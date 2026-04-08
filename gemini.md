UniSphere: Smart Campus Operations Hub
Module A: Facilities & Assets Catalogue
This project is a core component of the IT3030-PAF Assignment 2026. This module focuses on maintaining a comprehensive catalogue of bookable university resources, including lecture halls, labs, meeting rooms, and equipment.


________________________________________
🛠 Tech Stack
•	Backend: Java Spring Boot REST API.
•	Frontend: React.js client web application.
•	Database: MongoDB.
o	Connection URI: mongodb+srv://unisphere-team:Shashi2002@cluster0.aja2e.mongodb.net/SmartCampusDB?retryWrites=true&w=majority&appName=Cluster0
________________________________________

📂 Project Structure & File Names
To avoid merge conflicts and maintain monorepo standards, ensure you only create and modify these specific files within the established UniSphere/ structure.

High-Level Monorepo Structure

Plaintext

UniSphere/ (Project Root)
├── backend/                  <-- ALL Spring Boot files go here
│   ├── src/main/java/...     <-- Backend Source code
│   ├── src/main/resources/   <-- application.properties, DB migrations
│   └── pom.xml               <-- Maven config
│
└── frontend/                 <-- ALL React/Vite files go here
    ├── src/                  <-- Frontend Source code
    ├── public/               <-- Static assets
    ├── package.json          <-- NPM Dependencies
    └── vite.config.js        <-- Vite configuration


Backend (Spring Boot) Implementation
Location: backend/src/main/java/com/unisphere/
•	Entity: entity/Resource.java (Maps to MongoDB collection).
•	Repository: repository/ResourceRepository.java.
•	Service: service/ResourceService.java.
•	Controller: controller/ResourceController.java.
•	DTO: dto/ResourceRequest.java & dto/ResourceResponse.java.


Frontend (React) Implementation
Location: frontend/src/
•	Pages: * pages/AdminResourceForm.jsx (Admin data entry page).
o	pages/ResourceCategoryHub.jsx (Central 4-button component page).
o	pages/LectureHalls.jsx.
o	pages/Labs.jsx.
o	pages/MeetingRooms.jsx.
o	pages/Equipment.jsx.
•	Services: services/resourceService.js (API call logic).

________________________________________
🚀 Implementation Requirements
1. Admin Page (Data Entry)
The Admin page must include a form to register new assets with the following input fields:
•	Resource Type: A dropdown menu categorizing the asset as LECTURE_HALL, LAB, MEETING_ROOM, or EQUIPMENT.
•	Capacity: A number input to specify accommodation limits.
•	Location: A text input or dropdown for building, floor, or room number.
•	Availability Windows: A section (using time-pickers) to define operational hours (e.g., 08:00 AM - 05:00 PM).
•	Status Toggle: A radio button or switch to set the state as ACTIVE or OUT_OF_SERVICE.


2. Resource Hub (Navigation)
A component page representing 4 navigation buttons with suitable online images:
•	Lecture Halls: Navigates to the Lecture Halls and details page.
•	Labs: Navigates to the Labs and details page.
•	Meeting Rooms: Navigates to the Meeting Rooms and details page.
•	Equipment: Navigates to the Equipment and details page.


3. Details & Search Pages
Each category page must display data added from the Admin page in a table format:
•	Columns: Resource Name | Capacity | Location | Availability Window Count | Status (Booking or Available).
•	Search Bar: Every detail page must include a search bar for filtering resources.

________________________________________
📂 Technical Specifications for Implementation

1. Backend Configuration (Spring Boot)
•	Database Config: Add the MongoDB URI to backend/src/main/resources/application.properties.
•	Dependencies: Ensure pom.xml includes spring-boot-starter-data-mongodb and spring-boot-starter-web.
•	Model Fields: The Resource.java entity must include:
o	String id, String type, int capacity, String location, String availabilityWindow, String status.


2. Frontend Routing (React)
Using react-router-dom, implement the following paths:
•	/admin/resources -> AdminResourceForm.jsx
•	/categories -> ResourceCategoryHub.jsx
•	/categories/lecture-halls -> LectureHalls.jsx
•	/categories/labs -> Labs.jsx
•	/categories/meeting-rooms -> MeetingRooms.jsx
•	/categories/equipment -> Equipment.jsx


3. API Endpoints (Required for Assessment)
You must implement these 4 methods in ResourceController.java:
•	POST /api/resources (Add new resource from Admin page)
•	GET /api/resources/type/{type} (Get resources for specific category pages)
•	PUT /api/resources/{id} (Update status/details)
•	DELETE /api/resources/{id} (Remove a resource)


4. Search & Filter Logic
•	The Search Bar on details pages must filter the table by Name, Capacity, or Location locally or via API query parameters.

________________________________________
📝 Development Rules
•	Monorepo Hygiene: Never create package.json or node_modules in the root directory. Always cd frontend for npm commands or cd backend for mvn commands.
•	API Standards: Implement at least four (4) REST API endpoints using different HTTP methods (GET, POST, PUT, DELETE).
•	Collaboration: If a resource update requires a notification, use the existing notificationService.send(...) within your logic.
•	Git: Pull the latest main branch before starting work and commit frequently to ensure individual contribution is visible in the history.

