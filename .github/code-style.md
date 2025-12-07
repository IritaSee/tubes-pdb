# Code Style Guide

## Python (Backend)

### General
- Use Python 3.9+ features
- Follow PEP 8 style guide
- Use type hints where beneficial
- Docstrings for all public functions

### Imports
```python
# Always use backend. prefix
from backend.config import get_config
from backend.models.user import User
from backend.services.llm_service import generate_scenario
```

### Flask Routes
```python
from flask import Blueprint, request, jsonify
from backend.routes.auth import require_auth

bp = Blueprint('name', __name__)

@bp.route('/endpoint', methods=['POST'])
@require_auth('student')  # or 'lecturer' or None for both
def handler():
    try:
        # Validate input with Pydantic
        data = SomeModel(**request.get_json())
        
        # Business logic
        result = some_service.do_something(data)
        
        # Return JSON
        return jsonify({'success': True, 'data': result}), 200
        
    except ValidationError as e:
        return jsonify({'error': 'Invalid input', 'details': e.errors()}), 400
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': 'Internal server error'}), 500
```

### Pydantic Models
```python
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MyModel(BaseModel):
    """Model description"""
    id: Optional[str] = None
    name: str
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
```

### Database Operations
```python
from backend.utils.db import get_supabase_admin

supabase = get_supabase_admin()

# Select
result = supabase.table('table_name').select('*').eq('column', value).execute()

# Insert
result = supabase.table('table_name').insert({'key': 'value'}).execute()

# Update
result = supabase.table('table_name').update({'key': 'value'}).eq('id', id).execute()

# Delete
result = supabase.table('table_name').delete().eq('id', id).execute()
```

## JavaScript/React (Frontend)

### General
- Use functional components with hooks
- Use arrow functions
- Destructure props
- Use const/let, never var

### Component Structure
```jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { someAPI } from '../../services/api';

const ComponentName = () => {
  // Hooks first
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Effects
  useEffect(() => {
    loadData();
  }, []);

  // Functions
  const loadData = async () => {
    try {
      const response = await someAPI.getData();
      setData(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Render
  if (loading) return <div className="spinner"></div>;

  return (
    <div className="container">
      {/* JSX */}
    </div>
  );
};

export default ComponentName;
```

### Styling
```jsx
// Use design system classes
<button className="btn btn-primary">Click</button>

// Inline styles for dynamic values
<div style={{ 
  color: 'var(--primary-600)',
  padding: 'var(--spacing-md)' 
}}>
  Content
</div>

// Use CSS variables from index.css
background: var(--bg-card);
color: var(--text-primary);
```

### API Calls
```javascript
import { authAPI, datasetAPI } from '../../services/api';

// Login
const response = await authAPI.studentLogin(nim);
const { student, token } = response.data;

// Create
const response = await datasetAPI.create(datasetData);

// Error handling
try {
  const response = await someAPI.call();
} catch (error) {
  console.error('Error:', error);
  alert(error.response?.data?.error || 'Operation failed');
}
```

## Naming Conventions

### Python
- Files: `snake_case.py`
- Classes: `PascalCase`
- Functions: `snake_case()`
- Variables: `snake_case`
- Constants: `UPPER_SNAKE_CASE`

### JavaScript
- Files: `PascalCase.jsx` (components), `camelCase.js` (utilities)
- Components: `PascalCase`
- Functions: `camelCase()`
- Variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`

## Git Commit Messages

Format: `<type>: <description>`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

Examples:
```
feat: add dataset creation with meta-prompt fields
fix: resolve import path issues in backend
docs: update README with setup instructions
refactor: simplify LLM service error handling
```

## Error Handling

### Backend
```python
# Always use try-except in routes
try:
    result = do_something()
    return jsonify({'success': True, 'data': result}), 200
except ValidationError as e:
    return jsonify({'error': 'Invalid input', 'details': e.errors()}), 400
except ValueError as e:
    return jsonify({'error': str(e)}), 400
except Exception as e:
    print(f"Error in endpoint_name: {e}")
    return jsonify({'error': 'Internal server error'}), 500
```

### Frontend
```javascript
// Always use try-catch for async operations
try {
  const response = await api.call();
  // Handle success
} catch (error) {
  console.error('Error:', error);
  setError(error.response?.data?.error || 'Operation failed');
}
```

## Testing Patterns

### Backend Testing
```python
# Manual testing with curl
curl -X POST http://localhost:5000/api/endpoint \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"key": "value"}'
```

### Frontend Testing
```javascript
// Test in browser console
localStorage.getItem('token')
localStorage.getItem('user')

// Test API directly
import { authAPI } from './services/api';
const response = await authAPI.studentLogin('12345678');
```

## Documentation

### Function Docstrings
```python
def function_name(param1: str, param2: int) -> dict:
    """
    Brief description of what the function does.
    
    Args:
        param1: Description of param1
        param2: Description of param2
    
    Returns:
        Description of return value
    
    Raises:
        ValueError: When something goes wrong
    """
    pass
```

### Component Comments
```jsx
/**
 * ComponentName - Brief description
 * 
 * Props:
 * - prop1: Description
 * - prop2: Description
 */
const ComponentName = ({ prop1, prop2 }) => {
  // Implementation
};
```

## Security Best Practices

### Backend
- Never commit `.env` file
- Use `get_supabase_admin()` for privileged operations
- Validate all inputs with Pydantic
- Hash passwords with bcrypt
- Use JWT for authentication
- Check user permissions in routes

### Frontend
- Store tokens in localStorage
- Clear tokens on logout
- Don't expose sensitive data in console
- Validate user input before sending to API
- Use HTTPS in production

## Performance

### Backend
- Use database indexes for frequent queries
- Limit chat history to last 20 messages
- Use connection pooling for database
- Cache frequently accessed data

### Frontend
- Lazy load routes if needed
- Optimize images
- Use React.memo for expensive components
- Debounce search inputs
- Minimize re-renders
