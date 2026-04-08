# Commit 1: Setup & Configuration
git add frontend/package.json frontend/package-lock.json frontend/vite.config.js frontend/eslint.config.js frontend/index.html frontend/src/main.jsx .gitignore
git commit -m "chore(setup): initialize project structure and configuration"

# Commit 2: Landing Page & Shared Components
git add frontend/src/assets/ frontend/src/components/landingPage/ frontend/src/components/common/ frontend/src/styles/ frontend/src/index.css frontend/src/App.css frontend/src/pages/landingPage/
git commit -m "feat(ui): implement main landing page and reusable shared components"

# Commit 3: Authentication & Registration Infrastructure
git add frontend/src/pages/Auth.css frontend/src/pages/Register* frontend/src/utils/ backend/src/main/java/com/unisphere/dto/request/ backend/src/main/java/com/unisphere/entity/User.java backend/src/main/java/com/unisphere/security/ backend/src/main/java/com/unisphere/service/auth/ backend/src/main/java/com/unisphere/controller/auth/ frontend/src/App.jsx
git commit -m "feat(auth): build google oauth routing, registration workflow, and role handling"

# Commit 4: Dashboard & Navigation Layout
git add frontend/src/components/dashboard/ frontend/src/pages/dashboard/Dashboard.css frontend/src/pages/dashboard/Home/ frontend/src/pages/dashboard/Analytics/ frontend/src/pages/error/ frontend/src/pages/dashboard/Profile/ frontend/src/pages/dashboard/Settings/ frontend/public/
git commit -m "feat(dashboard): setup internal layout, nested navigation, and generic views"

# Commit 5: Cloudinary Profile Uploads
git add backend/pom.xml backend/src/main/java/com/unisphere/config/CloudinaryConfig.java backend/src/main/java/com/unisphere/service/file/ backend/src/main/java/com/unisphere/dto/response/UserProfileResponse.java
git commit -m "feat(upload): integrate cloudinary service for persisting user profiles and avatars"

# Commit 6: Notification Engine Module
git add backend/src/main/java/com/unisphere/entity/Notification.java backend/src/main/java/com/unisphere/repository/NotificationRepository.java backend/src/main/java/com/unisphere/service/notification/ backend/src/main/java/com/unisphere/controller/notification/ backend/src/main/java/com/unisphere/dto/response/Notification* backend/src/main/java/com/unisphere/controller/test/ frontend/src/pages/Notifications.css frontend/src/pages/Notifications.jsx frontend/src/pages/dashboard/Notifications/ frontend/src/pages/dashboard/Simulator/ frontend/src/pages/dashboard/UserManagement/
git commit -m "feat(notifications): build real-time system alerts, unread counts, and testing environment"

# Commit 7: Fixes & Code Refinements (Everything leftover)
git add .
git commit -m "fix(core): resolve routing edge-cases and finalize UI alignments"
