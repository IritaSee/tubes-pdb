from flask import Blueprint, request, jsonify
from backend.routes.auth import require_auth
from backend.models.dataset import DatasetCreate
from backend.utils.db import get_supabase_admin
from backend.utils.validators import URLValidator
from pydantic import ValidationError

bp = Blueprint('datasets', __name__)

@bp.route('', methods=['GET'])
@require_auth('lecturer')
def get_datasets():
    """Get all datasets (lecturer only)"""
    try:
        supabase = get_supabase_admin()
        
        result = supabase.table('datasets').select('*').order('created_at', desc=True).execute()
        
        return jsonify({
            'success': True,
            'datasets': result.data
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('', methods=['POST'])
@require_auth('lecturer')
def create_dataset():
    """Create a new dataset with enhanced metadata (meta-prompt architecture)"""
    try:
        data = request.get_json()
        
        # Validate input
        dataset_data = DatasetCreate(**data)
        URLValidator(url=dataset_data.url)
        
        supabase = get_supabase_admin()
        
        # Insert dataset with enhanced metadata
        result = supabase.table('datasets').insert({
            'name': dataset_data.name,
            'url': dataset_data.url,
            'metadata_summary': dataset_data.metadata_summary,
            'columns_list': dataset_data.columns_list,
            'sample_data': dataset_data.sample_data,
            'data_quality_notes': dataset_data.data_quality_notes
        }).execute()
        
        if not result.data:
            raise ValueError("Failed to create dataset")
        
        return jsonify({
            'success': True,
            'dataset': result.data[0]
        }), 201
        
    except ValidationError as e:
        return jsonify({'error': 'Invalid input', 'details': e.errors()}), 400
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/<dataset_id>', methods=['DELETE'])
@require_auth('lecturer')
def delete_dataset(dataset_id):
    """Delete a dataset (lecturer only)"""
    try:
        supabase = get_supabase_admin()
        
        # Delete dataset
        result = supabase.table('datasets').delete().eq('id', dataset_id).execute()
        
        return jsonify({
            'success': True,
            'message': 'Dataset deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500
