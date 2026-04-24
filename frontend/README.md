<<<<<<< HEAD
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
=======
# UniSphere - Frontend Application

This is the frontend interface for the UniSphere system. It is responsible for the UI, state management, and communicating with the backend APIs.

## How to Run

1. Open your terminal and navigate to the `frontend` folder.
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the application via the link provided in the terminal (usually `http://localhost:5173`).

## Key Technology Stack
- React 19 + Vite
- Tailwind CSS (For styling)
- React Router DOM (For navigation)
- Axios (For API calls)
- Framer Motion (For animations)
- jsPDF & jsPDF-AutoTable (For PDF exports)
- Lucide React (For icons)

## Main Features (My Module)
- **Authentication**: Google OAuth login integration.
- **Role-Based Workflows**: Separate views and access rules for Students, Lecturers, Technicians, and Admins.
- **Profile Management**: Profile updating with photo uploads and dependent dropdowns.
- **Admin Dashboard**: Manage users, filter by role, accept/reject pending users, toggle active status, and export user reports to PDF.
- **Notifications**: See real-time alerts and user-centric notifications.
>>>>>>> origin/main
