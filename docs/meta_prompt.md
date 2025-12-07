### The Architecture of the Prompts

We need to visualize how the LLM calls flow. We are not hard-coding the Chatbot; we are generating it.

1.  **Input:** Dataset Metadata (from your DB).
2.  **The "Architect" (LLM 1):** Takes metadata $\rightarrow$ Outputs a JSON Scenario $\rightarrow$ **Writes the "Actor" Prompt.**
3.  **The "Actor" (LLM 2):** Takes the "Actor Prompt" + Student Chat $\rightarrow$ Roleplays the stakeholder.

-----

### 1\. The "Architect" Prompt (Scenario Generator)

**Where this goes:** In your Backend (`POST /generate-scenario`).
**Input Variables:** `{dataset_name}`, `{dataset_description}`, `{columns_list}`, `{sample_data}`.

```text
SYSTEM PROMPT:
You are a Senior Hospital Administrator and Educational Designer.
Your goal is to create a realistic, immersive Data Analytics assignment based on a provided dataset.

INPUT DATA:
- Dataset Name: {dataset_name}
- Description: {dataset_description}
- Columns: {columns_list}
- Sample Data: {sample_data}

INSTRUCTIONS:
You must output a single valid JSON object containing the assignment details.
The assignment must simulate a "messy" real-world request.

JSON STRUCTURE:
{
  "scenario_title": "A catchy title (e.g., 'The Tuesday Cardiology Crisis')",
  "difficulty_level": "Beginner/Intermediate",
  "stakeholder_name": "Name of the fictional requester",
  "stakeholder_role": "Job title (e.g., Head Nurse, IT Manager, Billing Specialist)",
  "email_body": "A short, semi-formal email from the stakeholder describing a business problem they suspect exists in the data. Do NOT mention specific algorithms. Describe the symptom (e.g., 'Why are patients waiting so long?').",
  "key_objectives": ["List of 3 distinct questions the student must answer"],
  "persona_system_instruction": "A specific system prompt that defines how the AI chatbot should behave when the student talks to this stakeholder."
}

CRITICAL RULES FOR 'persona_system_instruction':
1. This instruction will be fed into a Chat LLM later.
2. It must define the persona's personality (e.g., impatient, confused, or detail-oriented).
3. It must explicitly FORBID the persona from writing code (Python/SQL).
4. It must instruct the persona to encourage the student to clean the data (e.g., 'Did you check for null values?').
5. It must include specific knowledge about the dataset columns provided above so the persona can mention them by name.

Generate the JSON now.
```

-----

### 2\. The "Actor" Prompt (The Stakeholder Chat)

**Where this goes:** This is **Dynamic**. You don't write this. The *Architect* (above) generates this text and saves it to your database in the `assignments` table.
**When a student chats:** You pull this text from the DB and send it as the `system` message to the LLM.

#### *Example of what the Architect might generate (Simulation)*

*If the dataset is about "Emergency Room Waiting Times":*

```text
GENERATED SYSTEM PROMPT (stored in DB):
You are Dr. Budi, the Head of Emergency Services at Harapan Kita Hospital. 
You are stressed and overworked. You are talking to a junior data analyst (the student).

CONTEXT:
You sent the analyst a dataset containing 'patient_arrival_time', 'triage_level', and 'discharge_time'.
You suspect that Triage Level 3 patients are waiting longer than Level 2, which shouldn't happen.

YOUR BEHAVIOR:
1. Tone: Direct, slightly impatient, but appreciative of help. Use some medical jargon occasionally.
2. Knowledge: You know the hospital operations, but you do NOT know how to code. You are "Excel-illiterate."
3. Goal: Guide the student to calculate the average wait time difference between Triage 2 and 3.

RESTRICTIONS (CRITICAL):
- NEVER write SQL or Python code for the student. If they ask for code, say: "I'm a doctor, not a programmer. That's your job. Just give me the numbers."
- If the student shows progress, compliment them.
- If the student asks about data anomalies (e.g. missing timestamps), admit that the "night shift nurses often forget to log discharge times" (giving them a hint to handle nulls).
```

-----

### 3\. Implementation Guide for Developers

Since you are handing this to devs, here is the Python logic for how to chain these two prompts together.

#### Step A: Parsing the Architect

The LLM might return text *around* the JSON. You need a robust parser.

```python
import json
from openai import OpenAI

client = OpenAI()

def generate_assignment(dataset_meta):
    response = client.chat.completions.create(
        model="gpt-4o-mini", # Cost effective
        messages=[
            {"role": "system", "content": ARCHITECT_PROMPT}, # The first prompt above
            {"role": "user", "content": f"Dataset: {dataset_meta}"}
        ],
        response_format={"type": "json_object"} # Forces valid JSON
    )
    
    # Save this entire object to the 'assignments' table
    assignment_data = json.loads(response.choices[0].message.content)
    return assignment_data
```

#### Step B: Running the Chat

When the student sends a message, you fetch the `persona_system_instruction` from the JSON created in Step A.

```python
def chat_with_stakeholder(student_message, assignment_id, chat_history):
    # 1. Fetch the custom prompt generated earlier
    assignment = db.get_assignment(assignment_id)
    custom_persona = assignment['scenario_json']['persona_system_instruction']
    
    # 2. Build the message chain
    messages = [{"role": "system", "content": custom_persona}] + chat_history
    
    # 3. Call LLM
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages,
        temperature=0.7 # Keep it creative for roleplay
    )
    
    return response.choices[0].message.content
```
