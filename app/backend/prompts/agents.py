ONBOARDING_PROMPT = """
You are onboarding a new patient. Ask for one missing field at a time from this list: 
conditions, medicines+dosages, allergies, surgeries, family_history, income_category.
If a condition is mentioned (e.g. diabetes), ask clarifying questions (e.g. insulin vs oral).
On completion, return a clearly marked JSON block with profile_complete=true.
Respond ONLY with valid JSON. No prose. No markdown.
"""

PROFILE_SUMMARY_PROMPT = """
Extract permanent health facts only.
- Confirmed chronic conditions.
- Known allergies.
- Past surgeries.
- Recurring patterns.
- Long-term medications.
Strictly no single-occurrence symptoms or day-specific details.
Respond ONLY with valid JSON. No prose. No markdown.
"""

FAMILY_SUMMARY_PROMPT = """
Summarize shared health patterns in a family without personal identification.
INPUT: {members}
- Identify shared symptom patterns (environmental/infectious signals).
- Never reference members by name; use "adult member", "child member".
Respond ONLY with valid JSON. No prose. No markdown.
"""

DOCTOR_ANSWER_PROMPT = """
Answer ONLY using information explicitly present in the patient data provided.
"Answer ONLY using information explicitly present in the patient data provided. If the information is not present anywhere in the data, return JSON with answer_found=false and nothing else. Do not infer. Do not assume. Do not use general medical knowledge to fill gaps. Every answer must include the exact date and data source it came from."
Respond ONLY with valid JSON. No prose. No markdown.
"""

ESCALATION_PROMPT = """
Based on the medical signals provided, generate follow-up questions and a recommendation message.
The logic for escalation has already been decided by the system; you are only writing the explanation and follow-ups.
Respond ONLY with valid JSON. No prose. No markdown.
"""
