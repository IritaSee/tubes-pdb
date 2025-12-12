from flask import Blueprint, request, jsonify
from backend.routes.auth import require_auth
from backend.models.grade import GradeCreate
from backend.utils.db import get_supabase_admin
from backend.utils.validators import validate_score
from pydantic import ValidationError

bp = Blueprint('grading', __name__)

@bp.route('/students', methods=['GET'])
@require_auth('lecturer')
def get_students_for_grading():
    """Get all students with their assignments, submissions, and grades (lecturer only)"""
    try:
        supabase = get_supabase_admin()
        
        # Pagination parameters
        page = request.args.get('page', type=int)
        limit = request.args.get('limit', type=int)

        query = supabase.table('students').select('*', count='exact')
        
        if page and limit:
            start = (page - 1) * limit
            end = start + limit - 1
            query = query.range(start, end)
        
        # Get students (paginated or all)
        students_result = query.execute()
        
        students_data = [_enrich_student_data(supabase, student) for student in students_result.data]
        
        return jsonify({
            'success': True,
            'students': students_data,
            'total': students_result.count,
            'page': page,
            'limit': limit
        }), 200
        
    except Exception as e:
        print(f"Error in get_students_for_grading: {e}")
        return jsonify({'error': 'Internal server error'}), 500

def _enrich_student_data(supabase, student):
    """Helper to fetch assignment and grade data for a student"""
    # Get assignment for this student
    assignment_result = supabase.table('assignments').select('*, datasets(*)').eq('student_nim', student['nim']).execute()
    
    if not assignment_result.data:
        # Student has no assignment yet
        return {
            'student': student,
            'assignment': None,
            'submissions': [],
            'grade': None
        }
    
    assignment = assignment_result.data[0]
    
    # Get submissions for this assignment
    submissions_result = supabase.table('submissions').select('*').eq('assignment_id', assignment['id']).order('created_at', desc=True).execute()
    
    # Get grade for this assignment
    grade_result = supabase.table('grades').select('*').eq('assignment_id', assignment['id']).execute()
    
    return {
        'student': student,
        'assignment': {
            'id': assignment['id'],
            'dataset': assignment['datasets'],
            'scenario': assignment['scenario_json'],
            'created_at': assignment['created_at']
        },
        'submissions': submissions_result.data,
        'grade': grade_result.data[0] if grade_result.data else None
    }

@bp.route('/grade', methods=['POST'])
@require_auth('lecturer')
def create_or_update_grade():
    """Create or update a grade (lecturer only)"""
    try:
        data = request.get_json()
        
        # Validate input
        grade_data = GradeCreate(**data)
        validate_score(grade_data.score)
        
        supabase = get_supabase_admin()
        
        # Upsert grade (insert or update if exists)
        result = supabase.table('grades').upsert({
            'assignment_id': grade_data.assignment_id,
            'score': grade_data.score,
            'feedback': grade_data.feedback
        }).execute()
        
        if not result.data:
            raise ValueError("Failed to save grade")
        
        return jsonify({
            'success': True,
            'grade': result.data[0]
        }), 200
        
    except ValidationError as e:
        return jsonify({'error': 'Invalid input', 'details': e.errors()}), 400
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/search/<query>', methods=['GET'])
@require_auth('lecturer')
def search_students(query):
    try:
        supabase = get_supabase_admin()
        
        # Search students
        if query.isdigit():
            result = supabase.table('students').select('*').ilike('nim', f'%{query}%').execute()
        else:
            result = supabase.table('students').select('*').ilike('name', f'%{query}%').execute()

        students_data = [_enrich_student_data(supabase, student) for student in result.data]

        return jsonify({
            'success': True,
            'students': students_data
        }), 200
        
    except Exception as e:
        print(f"Error in search_students: {e}")
        return jsonify({'error': 'Internal server error'}), 500