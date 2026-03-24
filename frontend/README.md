🌿 Life Mentor — Mental Health & Counselling Platform
> *"Sometimes the bravest thing you can do is just to show up. You matter."*
Life Mentor is a full-stack mental health and counselling web platform that connects clients with a compassionate counsellor. It provides a safe, judgment-free space for booking sessions, managing appointments, and supporting emotional well-being.
---
🔗 Live Demo
Layer	URL
🌐 Frontend	https://life-mentor-beryl.vercel.app
⚙️ Backend API	https://life-mentor-backend.onrender.com
---
📸 Screenshots
Landing Page
Hero section with impactful mental health messaging
Interactive CTA carousel with relatable emotional prompts
Blog section with clickable post modals
Full-width footer with contact and social links
Key Pages
🔐 Login / Signup — centered auth cards
📅 Book a Session — date & time slot picker
👤 Counsellor Profile — editable profile with certificates
📋 Appointments Dashboard — counsellor view with confirm/delete
⭐ Rate Your Session — interactive star rating
💼 Services — 6 service cards with a common booking CTA
---
✨ Features
👥 Client Features
Register and login securely with JWT authentication
Browse available mental health services
Book a session by selecting date and available time slot
View appointment history and booking status
Rate and review their counselling experience
🧑‍⚕️ Counsellor Features
View and manage all incoming appointments
Confirm or delete appointments
Edit profile — specialization, experience, fees, bio
Upload certificates to profile
View all client ratings and average score
🌐 Landing Page
Emotional, relatable hero section with custom illustration
Interactive carousel — 5 emotional CTA cards with arrows & dot navigation
6 blog cards with modal popups (~100 words each)
Fully responsive navbar — smart login/logout state
Dark footer with email, Instagram, YouTube, and quick links
---
🛠️ Tech Stack
Frontend
Technology	Usage
React 18	UI framework
React Router DOM	Client-side routing
Framer Motion	Page transition animations
Vite	Build tool
CSS (custom)	Styling with Google Fonts (Lora + DM Sans)
Backend
Technology	Usage
Node.js	Runtime
Express.js	REST API framework
MongoDB + Mongoose	Database
JWT	Authentication
Multer	File/certificate uploads
bcrypt	Password hashing
---
📁 Project Structure
```
life-mentor/
├── frontend/
│   ├── public/
│   │   └── images/
│   │       ├── logo.png
│   │       ├── Therapy.png
│   │       └── background.jpg
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── CTA.jsx
│   │   │   ├── Blog.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── PageWrapper.jsx
│   │   │   └── PrivateRoute.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Services.jsx
│   │   │   ├── BookSession.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DashboardHome.jsx
│   │   │   ├── ClientHistory.jsx
│   │   │   ├── CounsellorProfile.jsx
│   │   │   ├── RateSession.jsx
│   │   │   ├── Ratings.jsx
│   │   │   └── Admin.jsx
│   │   ├── utils/
│   │   │   └── auth.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
│   └── package.json
│
└── backend/
    ├── models/
    │   ├── User.js
    │   ├── Appointment.js
    │   └── Rating.js
    ├── routes/
    │   ├── auth.js
    │   ├── appointments.js
    │   ├── profile.js
    │   └── ratings.js
    ├── middleware/
    │   └── auth.js
    ├── uploads/
    ├── server.js
    └── package.json
```
---
🚀 Getting Started Locally
Prerequisites
Node.js v18+
MongoDB Atlas account (or local MongoDB)
1. Clone the repository
```bash
git clone https://github.com/chaynika0306/life-mentor.git
cd life-mentor
```
2. Setup Backend
```bash
cd backend
npm install
```
Create a `.env` file in `/backend`:
```env
PORT=5000
MONGO_URI=
JWT_SECRET=
```
Start the backend:
```bash
node server.js
```
3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
Visit `http://localhost:5173` in your browser.
---
🔐 User Roles
Role	Access
Client	Book sessions, view appointments, rate experience
Counsellor	View/manage appointments, edit profile, view ratings
Admin	Full access via `/admin` route
---
🌍 Deployment
Service	Platform
Frontend	Vercel
Backend	Render
Database	MongoDB Atlas
---
📬 Contact
📧 Email: 
📸 Instagram: 
▶️ YouTube: 
---
📄 License
This project is built for educational and mental wellness purposes.
---
<div align="center">
  Made with ❤️ for mental wellness · Life Mentor © 2025
</div>