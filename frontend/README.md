# UniSphere - Frontend Application

This is the React-based frontend for the UniSphere system. It provides a dynamic, responsive interface for users and administrators.

---

## 🛠️ Tech Stack
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API / Hooks
- **Navigation**: React Router DOM
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **PDF Generation**: jsPDF

## 📋 Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (comes with Node.js)

## 🚀 Getting Started

### 1. Install Dependencies
Open your terminal in the `frontend` folder and run:
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

The application will be available at: `http://localhost:5173`

---

## 🌟 Project Modules

### 1. Authentication and Notification Module
- **Google OAuth2**: Seamless login with automatic role detection.
- **User Dashboard**: Personalized views for different user roles.
- **Notifications**: Real-time toast alerts and activity center.
- **Admin Panel**: Tools to manage users, approve staff, and export PDF reports.

### 2. Booking Pages
- **Interactive Booking**: User-friendly forms for reserving resources.
- **Calendar/Slot Selection**: Visual representation of available time slots.
- **Booking History**: Track all past and upcoming reservations.

### 3. Resource/Facility Management
- **Resource Gallery**: Browse available campus resources with images.
- **Management UI**: Admin tools to add, edit, or remove campus facilities.
- **Image Uploads**: Integrated image handling via Cloudinary.

### 4. Ticketing System
- **Support Portal**: UI for creating and managing support tickets.
- **Interaction Hub**: Commenting system for tickets and resources.
- **Status Visuals**: Clear indicators for ticket progress.
