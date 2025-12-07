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
        
        # Get all students with assignments
        students_result = supabase.table('students').select('*').execute()
        
        students_data = []
        
        for student in students_result.data:
            # Get assignment for this student
            assignment_result = supabase.table('assignments').select('*, datasets(*)').eq('student_nim', student['nim']).execute()
            
            if not assignment_result.data:
                # Student has no assignment yet
                students_data.append({
                    'student': student,
                    'assignment': None,
                    'submissions': [],
                    'grade': None
                })
                continue
            
            assignment = assignment_result.data[0]
            
            # Get submissions for this assignment
            submissions_result = supabase.table('submissions').select('*').eq('assignment_id', assignment['id']).order('created_at', desc=True).execute()
            
            # Get grade for this assignment
            grade_result = supabase.table('grades').select('*').eq('assignment_id', assignment['id']).execute()
            
            students_data.append({
                'student': student,
                'assignment': {
                    'id': assignment['id'],
                    'dataset': assignment['datasets'],
                    'scenario': assignment['scenario_json'],
                    'created_at': assignment['created_at']
                },
                'submissions': submissions_result.data,
                'grade': grade_result.data[0] if grade_result.data else None
            })
        
        return jsonify({
            'success': True,
            'students': students_data
        }), 200
        
    except Exception as e:
        print(f"Error in get_students_for_grading: {e}")
        return jsonify({'error': 'Internal server error'}), 500

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
