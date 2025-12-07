# Biomedical Analyst Roleplay Platform - Backend

Flask API backend for the biomedical analyst roleplay platform with Supabase database and Google Gemini LLM integration.

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Supabase account with project created
- Google Gemini API key

### Installation

1. **Clone the repository** (if not already done)
   ```bash
   cd tubes-pdb
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and fill in your credentials:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_KEY`: Your Supabase anon key
   - `SUPABASE_SERVICE_KEY`: Your Supabase service role key
   - `GEMINI_API_KEY`: Your Google Gemini API key
   - `JWT_SECRET`: Generate with `openssl rand -hex 32`

5. **Set up database**
   - Go to your Supabase project → SQL Editor
   - Run the SQL in `docs/db_schema.sql`

6. **Run the development server**
   ```bash
   python backend/app.py
   ```
   
   Backend will be available at `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── __init__.py
├── app.py                    # Flask app factory
├── config.py                 # Configuration management
├── models/                   # Pydantic data models
│   ├── user.py
│   ├── student.py
│   ├── dataset.py
│   ├── assignment.py
│   ├── chat_message.py
│   ├── submission.py
│   └── grade.py
├── routes/                   # API endpoints
│   ├── auth.py              # Authentication
│   ├── datasets.py          # Dataset management
│   ├── assignments.py       # Assignment & JIT generation
│   ├── chat.py              # Chat with stakeholder
│   ├── submissions.py       # Submission handling
│   └── grading.py           # Grading interface
├── services/                 # Business logic
│   ├── llm_service.py       # Gemini LLM integration
│   ├── auth_service.py      # Authentication logic
│   └── assignment_service.py # JIT assignment logic
└── utils/
    ├── db.py                # Supabase client
    └── validators.py        # Input validation
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/student/login` - Student login (NIM only)
- `POST /api/auth/lecturer/login` - Lecturer login (email/password)
- `POST /api/auth/lecturer/register` - Register new lecturer
- `POST /api/auth/students/upload-roster` - Bulk upload students

### Datasets (Lecturer only)
- `GET /api/datasets` - List all datasets
- `POST /api/datasets` - Create new dataset
- `DELETE /api/datasets/:id` - Delete dataset

### Assignments
- `GET /api/assignments/me` - Get/create assignment (JIT generation)
- `POST /api/assignments/regenerate` - Regenerate assignment (Lecturer only)

### Chat
- `GET /api/chat/:assignment_id/messages` - Get chat history
- `POST /api/chat/:assignment_id/message` - Send message & get AI response

### Submissions
- `GET /api/submissions/:assignment_id` - Get submissions
- `POST /api/submissions` - Create submission

### Grading (Lecturer only)
- `GET /api/grading/students` - Get all students with submissions
- `POST /api/grading/grade` - Create/update grade

## 🧪 Testing

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Test Student Login
```bash
curl -X POST http://localhost:5000/api/auth/student/login \
  -H "Content-Type: application/json" \
  -d '{"nim": "12345678"}'
```

### Test Lecturer Login
```bash
curl -X POST http://localhost:5000/api/auth/lecturer/login \
  -H "Content-Type: application/json" \
  -d '{"email": "lecturer@example.com", "password": "password123"}'
```

## 🚢 Deployment

See `docs/vercel_deployment.md` for complete deployment instructions.

### Quick Deploy to Vercel

1. **Push to Git**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push
   ```

2. **Connect to Vercel**
   - Import repository in Vercel dashboard
   - Add environment variables
   - Deploy!

## 🔐 Authentication

The API uses JWT tokens for authentication. Include the token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_KEY` | Supabase anon key | Yes |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `JWT_SECRET` | Secret for JWT signing | Yes |
| `FLASK_ENV` | Environment (development/production) | No |
| `FRONTEND_URL` | Frontend URL for CORS | No |

## 🤖 LLM Integration

The platform uses Google Gemini 1.5 Flash for:
- **Scenario Generation**: Creating unique, immersive scenarios for each student
- **Stakeholder Chat**: Roleplaying as a hospital stakeholder persona

See `docs/gemini_prompts.md` for prompt templates and guidelines.

## 🐛 Troubleshooting

### "Module not found" errors
Ensure you're in the project root and virtual environment is activated:
```bash
source venv/bin/activate
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
```

### Database connection errors
- Verify Supabase credentials in `.env`
- Check that database tables are created
- Ensure Supabase project is active

### LLM errors
- Verify Gemini API key is valid
- Check API quota/limits
- Review error logs for specific issues

## 📚 Documentation

- [Product Requirements Document](docs/prd.md)
- [Implementation Plan](../.gemini/antigravity/brain/*/implementation_plan.md)
- [Database Schema](docs/db_schema.sql)
- [Gemini Prompts](docs/gemini_prompts.md)
- [Vercel Deployment](docs/vercel_deployment.md)

## 🤝 Contributing

1. Create a new branch for your feature
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

[Your License Here]
