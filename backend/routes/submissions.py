from flask import Blueprint, request, jsonify
from backend.routes.auth import require_auth
from backend.models.submission import SubmissionCreate
from backend.utils.db import get_supabase_admin
from backend.utils.validators import URLValidator
from backend.services.assignment_service import get_assignment_by_id
from pydantic import ValidationError

bp = Blueprint('submissions', __name__)

@bp.route('/<assignment_id>', methods=['GET'])
@require_auth()
def get_submissions(assignment_id):
    """Get submissions for an assignment (student or lecturer)"""
    try:
        supabase = get_supabase_admin()
        
        # If student, verify assignment belongs to them
        if request.user['user_type'] == 'student':
            assignment = get_assignment_by_id(assignment_id)
            if assignment['student_nim'] != request.user['user_id']:
                return jsonify({'error': 'Unauthorized'}), 403
        
        # Get submissions
        result = supabase.table('submissions').select('*').eq('assignment_id', assignment_id).order('created_at', desc=True).execute()
        
        return jsonify({
            'success': True,
            'submissions': result.data
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('', methods=['POST'])
@require_auth('student')
def create_submission():
    """Create a new submission (student only)"""
    try:
        student_nim = request.user['user_id']
        data = request.get_json()
        
        # Validate input
        submission_data = SubmissionCreate(**data)
        URLValidator(url=submission_data.link_url)
        
        supabase = get_supabase_admin()
        
        # Verify assignment belongs to student
        assignment = get_assignment_by_id(submission_data.assignment_id)
        if assignment['student_nim'] != student_nim:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Create submission
        result = supabase.table('submissions').insert({
            'assignment_id': submission_data.assignment_id,
            'link_url': submission_data.link_url,
            'submission_type': submission_data.submission_type
        }).execute()
        
        if not result.data:
            raise ValueError("Failed to create submission")
        
        return jsonify({
            'success': True,
            'submission': result.data[0]
        }), 201
        
    except ValidationError as e:
        return jsonify({'error': 'Invalid input', 'details': e.errors()}), 400
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500
