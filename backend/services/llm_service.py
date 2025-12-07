import google.generativeai as genai
import json
from backend.config import get_config
from backend.models.assignment import Scenario

config = get_config()

# Configure Gemini API
genai.configure(api_key=config.GEMINI_API_KEY)

# Initialize model
model = genai.GenerativeModel('gemini-1.5-flash')

def generate_scenario(student_nim: str, student_name: str, dataset: dict) -> Scenario:
    """
    STAGE 1: Architect LLM generates scenario + Actor system prompt (Meta-Prompt Architecture)
    
    Args:
        student_nim: Student's NIM
        student_name: Student's name
        dataset: Full dataset dict with columns, sample data, etc.
    
    Returns:
        Scenario object with persona_system_instruction for Actor LLM
    """
    
    # Prepare dataset information
    columns_str = ', '.join(dataset.get('columns_list', [])) if dataset.get('columns_list') else 'Not provided'
    sample_data_str = dataset.get('sample_data', 'No sample data provided')
    data_quality_notes = dataset.get('data_quality_notes', 'None specified')
    
    architect_prompt = f"""SYSTEM PROMPT:
You are a Senior Hospital Administrator and Educational Designer.
Your goal is to create a realistic, immersive Data Analytics assignment based on a provided dataset.

INPUT DATA:
- Dataset Name: {dataset['name']}
- Description: {dataset.get('metadata_summary', 'No description provided')}
- Columns: {columns_str}
- Sample Data:
{sample_data_str}
- Data Quality Notes: {data_quality_notes}

STUDENT INFO:
- NIM: {student_nim}
- Name: {student_name}

INSTRUCTIONS:
You must output a single valid JSON object containing the assignment details.
The assignment must simulate a "messy" real-world request that teaches data cleaning and analysis.

JSON STRUCTURE:
{{
  "scenario_title": "A catchy, specific title (e.g., 'The Tuesday Cardiology Crisis')",
  "difficulty_level": "Beginner/Intermediate/Advanced",
  "stakeholder_name": "Full name of the fictional requester (use Indonesian names)",
  "stakeholder_role": "Specific job title (e.g., Head Nurse, IT Manager, Billing Specialist)",
  "email_body": "A short, semi-formal email from the stakeholder describing a business problem they suspect exists in the data. Do NOT mention specific algorithms or technical terms. Describe the symptom (e.g., 'Why are patients waiting so long?'). Make it feel like a real email from a busy hospital staff member. Keep it under 150 words.",
  "key_objectives": ["List of 3 distinct analytical questions the student must answer using this dataset"],
  "persona_system_instruction": "A detailed system prompt that defines how the AI chatbot should behave when the student talks to this stakeholder. See critical rules below."
}}

CRITICAL RULES FOR 'persona_system_instruction':
1. This instruction will be fed into a Chat LLM later as the system message.
2. Start with: "You are [stakeholder_name], [stakeholder_role] at [hospital/institution name]."
3. Define the persona's personality (e.g., impatient, confused, detail-oriented, friendly but busy).
4. Include CONTEXT section mentioning the specific dataset columns by name.
5. Include YOUR BEHAVIOR section with:
   - Tone (e.g., direct, friendly, stressed)
   - Knowledge level (knows domain, NOT data analysis)
   - Goals (what insights they need)
6. Include RESTRICTIONS section that:
   - EXPLICITLY FORBIDS writing code (Python/SQL/R)
   - Provides a specific redirect phrase if asked for code (e.g., "I'm a doctor, not a programmer")
   - Encourages asking about data quality (e.g., "Did you check for null values?")
   - Mentions specific data quality issues from the dataset notes
7. Make the persona mention specific column names when discussing the problem.
8. The persona should know the domain (medical/hospital) but NOT know data analysis.
9. Keep the persona_system_instruction under 400 words.

EDUCATIONAL GOALS:
- The scenario should require the student to handle missing data
- The scenario should require data type conversions or cleaning
- The key_objectives should guide the student toward discovering insights
- Make it realistic - like a real stakeholder request

Generate the JSON now. Return ONLY valid JSON, no additional text."""

    try:
        response = model.generate_content(
            architect_prompt,
            generation_config={
                'temperature': 0.7,
                'response_mime_type': 'application/json'
            }
        )
        
        # Parse JSON response
        scenario_data = json.loads(response.text)
        
        # Validate and create Scenario object
        scenario = Scenario(**scenario_data)
        
        return scenario
        
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        print(f"Response text: {response.text}")
        raise ValueError("Failed to generate valid scenario JSON from Architect LLM")
    except Exception as e:
        print(f"Error generating scenario: {e}")
        raise

def chat_with_stakeholder(scenario: Scenario, chat_history: list[dict], 
                         new_message: str) -> str:
    """
    STAGE 2: Actor LLM uses the generated system prompt (Meta-Prompt Architecture)
    
    Args:
        scenario: The scenario object with persona_system_instruction
        chat_history: List of previous messages [{"sender": "student|ai", "content": "..."}]
        new_message: The student's new message
    
    Returns:
        AI response as the stakeholder
    """
    
    # Use the GENERATED system prompt from the Architect
    system_prompt = scenario.persona_system_instruction
    
    # Format chat history for context
    history_text = ""
    for msg in chat_history[-20:]:  # Last 20 messages to stay within token limits
        sender_label = "Student" if msg['sender'] == 'student' else scenario.stakeholder_name
        history_text += f"{sender_label}: {msg['content']}\n"
    
    # Combine system prompt with chat history and new message
    full_prompt = f"""{system_prompt}

CHAT HISTORY:
{history_text}

Student's new message: {new_message}

Respond as {scenario.stakeholder_name}:"""

    try:
        response = model.generate_content(
            full_prompt,
            generation_config={
                'temperature': 0.8,  # More natural conversation
            }
        )
        
        return response.text.strip()
        
    except Exception as e:
        print(f"Error in chat: {e}")
        raise
