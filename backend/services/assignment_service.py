import random
import json
from backend.utils.db import get_supabase_admin
from backend.services.llm_service import generate_scenario
from backend.models.assignment import Scenario, AssignmentWithDataset

def get_or_create_assignment(student_nim: str) -> AssignmentWithDataset:
    """
    Get existing assignment or create new one (Just-in-Time generation)
    
    Args:
        student_nim: Student's NIM
    
    Returns:
        Assignment with dataset and scenario details
    """
    supabase = get_supabase_admin()
    
    # Check if assignment already exists
    result = supabase.table('assignments').select('*, datasets(*)').eq('student_nim', student_nim).execute()
    
    if result.data:
        # Assignment exists, return it
        assignment = result.data[0]
        
        # Parse scenario JSON
        scenario_data = assignment['scenario_json']
        scenario = Scenario(**scenario_data)
        
        return AssignmentWithDataset(
            id=assignment['id'],
            student_nim=assignment['student_nim'],
            dataset=assignment['datasets'],
            scenario=scenario,
            created_at=assignment['created_at']
        )
    
    # No assignment exists, create new one
    return _create_new_assignment(student_nim)

def _create_new_assignment(student_nim: str) -> AssignmentWithDataset:
    """
    Create a new assignment with JIT scenario generation (Meta-Prompt Architecture)
    
    Args:
        student_nim: Student's NIM
    
    Returns:
        Newly created assignment
    """
    supabase = get_supabase_admin()
    
    # Get student details
    student_result = supabase.table('students').select('*').eq('nim', student_nim).execute()
    if not student_result.data:
        raise ValueError("Student not found")
    student = student_result.data[0]
    
    # Get random dataset
    dataset = _select_random_dataset()
    
    # Generate scenario using Architect LLM (Meta-Prompt Architecture)
    # Pass the FULL dataset object with all metadata
    scenario = generate_scenario(
        student_nim=student['nim'],
        student_name=student['name'],
        dataset=dataset  # Full dataset dict with columns_list, sample_data, etc.
    )
    
    # Convert scenario to dict for JSON storage
    scenario_dict = {
        'scenario_title': scenario.scenario_title,
        'difficulty_level': scenario.difficulty_level,
        'stakeholder_name': scenario.stakeholder_name,
        'stakeholder_role': scenario.stakeholder_role,
        'email_body': scenario.email_body,
        'key_objectives': scenario.key_objectives,
        'persona_system_instruction': scenario.persona_system_instruction
    }
    
    # Save assignment to database
    assignment_result = supabase.table('assignments').insert({
        'student_nim': student_nim,
        'dataset_id': dataset['id'],
        'scenario_json': scenario_dict
    }).execute()
    
    if not assignment_result.data:
        raise ValueError("Failed to create assignment")
    
    assignment = assignment_result.data[0]
    
    return AssignmentWithDataset(
        id=assignment['id'],
        student_nim=assignment['student_nim'],
        dataset=dataset,
        scenario=scenario,
        created_at=assignment['created_at']
    )

def _select_random_dataset() -> dict:
    """
    Select a random dataset from available datasets
    
    Returns:
        Dataset dict
    
    Raises:
        ValueError: If no datasets available
    """
    supabase = get_supabase_admin()
    
    # Get all datasets
    result = supabase.table('datasets').select('*').execute()
    
    if not result.data:
        raise ValueError("No datasets available. Please ask your lecturer to add datasets.")
    
    # Select random dataset
    dataset = random.choice(result.data)
    return dataset

def delete_assignment(student_nim: str) -> bool:
    """
    Delete an assignment (for regeneration)
    
    Args:
        student_nim: Student's NIM
    
    Returns:
        True if deleted successfully
    """
    supabase = get_supabase_admin()
    
    # Delete assignment (cascade will delete related chat messages, submissions, grades)
    result = supabase.table('assignments').delete().eq('student_nim', student_nim).execute()
    
    return True

def get_assignment_by_id(assignment_id: str) -> dict:
    """
    Get assignment by ID
    
    Args:
        assignment_id: Assignment UUID
    
    Returns:
        Assignment dict with dataset
    """
    supabase = get_supabase_admin()
    
    result = supabase.table('assignments').select('*, datasets(*)').eq('id', assignment_id).execute()
    
    if not result.data:
        raise ValueError("Assignment not found")
    
    return result.data[0]
