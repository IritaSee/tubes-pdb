# Biomedical Analyst Platform - Frontend

Modern React + Vite frontend for the biomedical analyst roleplay platform.

## 🎨 Features

### Student Interface
- **NIM-only Login**: Simple authentication with student ID
- **Scenario Display**: Beautiful presentation of generated scenarios with email format
- **Real-time Chat**: Interactive conversation with AI stakeholder persona
- **Submission System**: Submit Google Drive/Colab links for progress and final reports
- **Responsive Design**: Works on desktop and mobile devices

### Lecturer Interface
- **Email/Password Login**: Secure authentication for lecturers
- **Dataset Management**: Create datasets with enhanced metadata for meta-prompt architecture
  - Column names
  - Sample data
  - Data quality notes
- **Student Roster Upload**: Bulk upload students via CSV format
- **Grading Interface**: View submissions and assign grades with feedback

## 🚀 Quick Start

### Development

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Output will be in `dist/` directory.

## 📁 Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── student/
│   │   │   ├── StudentLogin.jsx
│   │   │   └── StudentDashboard.jsx
│   │   └── lecturer/
│   │       ├── LecturerLogin.jsx
│   │       └── LecturerDashboard.jsx
│   ├── context/
│   │   └── AuthContext.jsx          # Authentication state management
│   ├── services/
│   │   └── api.js                   # API client with axios
│   ├── App.jsx                      # Main app with routing
│   ├── main.jsx                     # Entry point
│   └── index.css                    # Design system & styles
├── index.html
├── vite.config.js
└── package.json
```

## 🎨 Design System

### Color Palette

- **Primary**: Blue gradient (#667eea → #764ba2) - Medical/professional theme
- **Secondary**: Green - Success states
- **Accent**: Purple - Highlights
- **Grays**: Neutral backgrounds and text

### Typography

- **Font**: Inter (sans-serif) for UI, JetBrains Mono for code
- **Scale**: Responsive text sizes from xs (0.75rem) to 5xl (3rem)

### Components

All components use the design system defined in `index.css`:

- **Buttons**: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-success`
- **Cards**: `.card` with hover effects and shadows
- **Forms**: `.form-input`, `.form-textarea`, `.form-select`
- **Badges**: `.badge` with color variants
- **Utilities**: Spacing, flexbox, grid helpers

## 🔌 API Integration

The frontend connects to the Flask backend via `/api` proxy (configured in `vite.config.js`).

## 📱 Pages

### Landing Page (`/`)
- Role selection (Student vs Lecturer)
- Beautiful gradient background

### Student Pages
- **Login** (`/student/login`): NIM input only
- **Dashboard** (`/student/dashboard`): Scenario, Chat, Submit tabs

### Lecturer Pages
- **Login** (`/lecturer/login`): Email + password
- **Dashboard** (`/lecturer/dashboard`): Datasets, Students, Grading tabs

## 🚢 Deployment

Configured for Vercel deployment as part of the monolithic application.

See `../docs/vercel_deployment.md` for complete deployment instructions.
