import httpx
import os
import json
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

async def call_groq(system_prompt: str, user_prompt: str, max_tokens: int = 1024, temperature: float = 0.1, json_mode: bool = True) -> str:
    """
    Single async function to call Groq API.
    json_mode: If True, uses response_format={"type": "json_object"}. 
               Note: Groq requires the word 'json' in the prompt for this to work.
    """
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Ensure 'json' is in the prompt if json_mode is active
    if json_mode and "json" not in (system_prompt + user_prompt).lower():
        user_prompt += " Respond in valid JSON format."

    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "max_tokens": max_tokens,
        "temperature": temperature
    }

    if json_mode:
        payload["response_format"] = {"type": "json_object"}
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(GROQ_URL, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
        except httpx.HTTPStatusError as e:
            error_body = e.response.text
            print(f"Groq API HTTP Error ({e.response.status_code}): {error_body}")
            return json.dumps({"error": f"Groq API Error {e.response.status_code}", "detail": error_body})
        except Exception as e:
            print(f"Groq Client Exception: {e}")
            # Return a minimal valid JSON error if possible
            return json.dumps({"error": "LLM unavailable", "exception": str(e)})
