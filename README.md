# ⚖️ Lex Triage – AI Legal Intake & Client Query Triage System

An AI-powered legal intake platform that helps law firms automate client intake, categorize legal matters, assess urgency, and streamline case management through an intuitive dashboard.

---

## 📌 Overview

Lex Triage is a modern legal operations platform designed to reduce manual intake work by automatically analyzing client submissions and organizing legal matters efficiently.

The platform enables legal professionals to:

- Collect client information digitally
- Analyze legal matters using AI
- Classify practice areas automatically
- Estimate urgency levels
- Recommend supporting documents
- Manage client matters from a centralized dashboard

---

## ✨ Features

### 🏠 Landing Page
- Modern responsive UI
- AI Legal Operations branding
- Workflow explanation
- FAQ section
- Contact information
- Professional footer

### 👤 Authentication
- Secure Login
- Secure Signup
- Protected Dashboard

### 📝 Legal Intake
- Multi-step intake form
- Client information
- Matter details
- Document upload
- Review before submission
- AI analysis

### 🤖 AI Matter Analysis
Automatically provides:

- Practice Area Classification
- Urgency Level
- Confidence Score
- Suggested Documents
- Recommended Department
- Next Actions

---

## 📊 Dashboard

Displays real-time legal intake information including:

- Total Requests
- Pending Reviews
- High Priority Matters
- Completed Matters
- Matter Categories
- Recent Activity
- AI Insights

---

## 📁 Client Directory

A centralized client management page displaying:

- Client Name
- Email
- Phone Number
- Matter Category
- Status
- Urgency
- Created Date

Search functionality included.

---

## 📈 Analytics

Interactive charts showing:

- Matter Category Distribution
- Status Distribution
- Legal Intake Statistics

---

## 👤 User Profile

Users can:

- View Profile
- Update Information
- Manage Account Settings

---

## 🛠 Tech Stack

### Frontend

- React
- TypeScript
- TanStack Router
- Tailwind CSS
- Lucide Icons
- Recharts
- Vite

### Backend

- Node.js
- Express.js

### Database

- Supabase

### Authentication

- Supabase Authentication

### AI Integration

- Python AI Service
- REST API Integration

---

## 📂 Project Structure

```
AI-Legal-Intake/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── routes/
│   ├── services/
│   └── lib/
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   └── db/
│
└── README.md
```

---

## 🚀 Installation

### 1. Clone Repository

```bash
git clone https://github.com/abinayatech/AI-Legal-Intake.git
```

### 2. Navigate

```bash
cd AI-Legal-Intake
```

### 3. Install Dependencies

Frontend

```bash
cd frontend
npm install
```

Backend

```bash
cd ../backend
npm install
```

---

## ▶ Run Application

Frontend

```bash
npm run dev
```

Backend

```bash
npm start
```

---

## ⚙ Environment Variables

Create a `.env` file.

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key

SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

AI_SERVICE_URL=http://localhost:8000
```
---

## 🎯 Learning Outcomes

This project demonstrates practical knowledge of:

- Full Stack Web Development
- REST API Integration
- React & TypeScript
- Authentication
- Database Design
- AI Integration
- Responsive UI Design
- CRUD Operations
- Dashboard Development

---

## 📄 License

This project is developed for educational and academic purposes.
