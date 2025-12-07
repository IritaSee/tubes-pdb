# Quick Reference for GitHub Copilot

## Common Tasks

### Add a New API Endpoint

1. **Create route in `backend/routes/`**
```python
from flask import Blueprint, request, jsonify
from backend.routes.auth import require_auth

bp = Blueprint('myroute', __name__)

@bp.route('/endpoint', methods=['POST'])
@require_auth('student')  # or 'lecturer'
def my_endpoint():
    try:
        data = request.get_json()
        # Your logic here
        return jsonify({'success': True}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

2. **Register blueprint in `backend/app.py`**
```python
from backend.routes import myroute
app.register_blueprint(myroute.bp, url_prefix='/api/myroute')
```

3. **Add to frontend API service `frontend/src/services/api.js`**
```javascript
export const myAPI = {
  doSomething: (data) => api.post('/myroute/endpoint', data),
};
```

### Add a New Database Table

1. **Add SQL to `docs/db_schema.sql`**
```sql
CREATE TABLE IF NOT EXISTS my_table (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

2. **Create Pydantic model in `backend/models/`**
```python
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MyModel(BaseModel):
    id: Optional[str] = None
    name: str
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
```

3. **Run SQL in Supabase SQL Editor**

### Add a New Frontend Page

1. **Create component in `frontend/src/pages/`**
```jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const MyPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  return (
    <div className="container">
      <h1>My Page</h1>
      {/* Content */}
    </div>
  );
};

export default MyPage;
```

2. **Add route in `frontend/src/App.jsx`**
```jsx
import MyPage from './pages/MyPage';

// In Routes:
<Route path="/my-page" element={<MyPage />} />
```

## Frequently Used Code Snippets

### Supabase Query
```python
from backend.utils.db import get_supabase_admin

supabase = get_supabase_admin()

# Select with filter
result = supabase.table('table_name')\
    .select('*')\
    .eq('column', value)\
    .order('created_at', desc=True)\
    .execute()

# Insert
result = supabase.table('table_name')\
    .insert({'key': 'value'})\
    .execute()

# Update
result = supabase.table('table_name')\
    .update({'key': 'new_value'})\
    .eq('id', id)\
    .execute()
```

### API Call (Frontend)
```javascript
import { someAPI } from '../../services/api';

const loadData = async () => {
  try {
    setLoading(true);
    const response = await someAPI.getData();
    setData(response.data);
  } catch (error) {
    console.error('Error:', error);
    setError(error.response?.data?.error || 'Failed to load');
  } finally {
    setLoading(false);
  }
};
```

### Form Handling (Frontend)
```jsx
const [formData, setFormData] = useState({ name: '', email: '' });

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await someAPI.create(formData);
    alert('Success!');
    setFormData({ name: '', email: '' });
  } catch (error) {
    alert('Failed: ' + error.response?.data?.error);
  }
};

return (
  <form onSubmit={handleSubmit}>
    <input
      className="form-input"
      value={formData.name}
      onChange={(e) => setFormData({...formData, name: e.target.value})}
    />
    <button type="submit" className="btn btn-primary">Submit</button>
  </form>
);
```

## Important File Locations

### Backend
- **Routes**: `backend/routes/*.py`
- **Services**: `backend/services/*.py`
- **Models**: `backend/models/*.py`
- **Config**: `backend/config.py`
- **Database**: `backend/utils/db.py`

### Frontend
- **Pages**: `frontend/src/pages/`
- **Components**: `frontend/src/components/` (if created)
- **API Client**: `frontend/src/services/api.js`
- **Auth Context**: `frontend/src/context/AuthContext.jsx`
- **Styles**: `frontend/src/index.css`

### Documentation
- **PRD**: `docs/prd.md`
- **Meta-Prompt**: `docs/meta_prompt.md`
- **Examples**: `docs/example_dataset.md`
- **Schema**: `docs/db_schema.sql`

## Environment Variables

```bash
# Required
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
GEMINI_API_KEY=AIza...
JWT_SECRET=generated-secret

# Optional
FRONTEND_URL=http://localhost:5173
FLASK_ENV=development
```

## Common Commands

```bash
# Backend
python backend/app.py                    # Start backend
curl http://localhost:5000/api/health   # Test backend

# Frontend
cd frontend && npm run dev              # Start frontend
npm run build                           # Build for production

# Database
# Run SQL in Supabase SQL Editor

# Git
git checkout -b feature/name            # New branch
git commit -m "feat: description"       # Commit
git push origin feature/name            # Push
```

## Design System Classes

```jsx
{/* Buttons */}
<button className="btn btn-primary">Primary</button>
<button className="btn btn-secondary">Secondary</button>
<button className="btn btn-success">Success</button>
<button className="btn btn-lg">Large</button>

{/* Cards */}
<div className="card">Card content</div>

{/* Forms */}
<input className="form-input" />
<textarea className="form-textarea" />
<select className="form-select" />

{/* Badges */}
<span className="badge badge-primary">Badge</span>

{/* Layout */}
<div className="container">Centered content</div>
<div className="grid grid-2">Two columns</div>
<div className="flex justify-between">Flex layout</div>

{/* Spacing */}
<div className="mt-lg mb-xl">Margins</div>
<div className="gap-md">Gap</div>
```

## Debugging Tips

### Backend
```python
# Add print statements
print(f"Debug: {variable}")

# Check request data
print(f"Request data: {request.get_json()}")

# Check database result
print(f"DB result: {result.data}")
```

### Frontend
```javascript
// Console log
console.log('Debug:', variable);

// Check state
console.log('State:', { data, loading, error });

// Check API response
console.log('Response:', response.data);

// Check localStorage
console.log('Token:', localStorage.getItem('token'));
```

## Meta-Prompt Architecture

### Architect Prompt Location
`backend/services/llm_service.py` → `generate_scenario()`

### Actor Prompt
Generated by Architect, stored in `assignments.scenario_json.persona_system_instruction`

### Key Fields
- `columns_list`: Dataset columns
- `sample_data`: CSV sample
- `data_quality_notes`: Known issues
- `persona_system_instruction`: Actor's system prompt

## Testing Checklist

- [ ] Backend starts without errors
- [ ] Frontend builds successfully
- [ ] Can register lecturer
- [ ] Can upload student roster
- [ ] Can create dataset
- [ ] Student can login
- [ ] Scenario generates correctly
- [ ] Chat works (AI responds)
- [ ] Can submit work
- [ ] Can grade students
- [ ] All API endpoints return proper errors

## Resources

- [Full Documentation](.github/copilot-instructions.md)
- [Code Style](.github/code-style.md)
- [Contributing](.github/CONTRIBUTING.md)
- [README](../README.md)
