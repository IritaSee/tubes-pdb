from flask import Blueprint, request, jsonify
from backend.routes.auth import require_auth
from backend.services.assignment_service import (
    get_or_create_assignment, delete_assignment
)
from backend.models.assignment import RegenerateAssignment
from pydantic import ValidationError

bp = Blueprint('assignments', __name__)

@bp.route('/me', methods=['GET'])
@require_auth('student')
def get_my_assignment():
    """Get or create assignment for current student (JIT generation with meta-prompt)"""
    try:
        student_nim = request.user['user_id']
        
        # Get or create assignment (JIT generation happens here)
        assignment = get_or_create_assignment(student_nim)
        
        return jsonify({
            'success': True,
            'assignment': {
                'id': assignment.id,
                'student_nim': assignment.student_nim,
                'dataset': assignment.dataset,
                'scenario': {
                    'scenario_title': assignment.scenario.scenario_title,
                    'difficulty_level': assignment.scenario.difficulty_level,
                    'stakeholder_name': assignment.scenario.stakeholder_name,
                    'stakeholder_role': assignment.scenario.stakeholder_role,
                    'email_body': assignment.scenario.email_body,
                    'key_objectives': assignment.scenario.key_objectives,
                    # NOTE: persona_system_instruction is NOT sent to frontend
                    # It's only used internally by the Actor LLM for chat
                },
                'created_at': assignment.created_at
            }
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        print(f"Error in get_my_assignment: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/regenerate', methods=['POST'])
@require_auth('lecturer')
def regenerate_assignment():
    """Regenerate assignment for a student (lecturer only)"""
    try:
        data = request.get_json()
        
        # Validate input
        regen_data = RegenerateAssignment(**data)
        
        # Delete existing assignment
        delete_assignment(regen_data.student_nim)
        
        return jsonify({
            'success': True,
            'message': f'Assignment for {regen_data.student_nim} has been deleted. A new one will be generated on next login.'
        }), 200
        
    except ValidationError as e:
        return jsonify({'error': 'Invalid input', 'details': e.errors()}), 400
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500
