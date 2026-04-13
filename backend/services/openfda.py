import httpx
import os
from dotenv import load_dotenv

load_dotenv()

OPENFDA_BASE_URL = os.getenv("OPENFDA_BASE_URL", "https://api.fda.gov")

async def call_openfda(drug_a: str, drug_b: str) -> dict | None:
    """
    Check for drug interactions between drug_a and drug_b using OpenFDA.
    Returns raw interaction data or None if unavailable/error.
    """
    # OpenFDA doesn't have a direct "interaction" endpoint that is simple.
    # Usually, we query for labels or adverse events related to both drugs.
    # For this implementation, we will mock the interaction check or query the drug label.
    # A realistic implementation would use the 'ndc' or 'label' endpoint.
    
    url = f"{OPENFDA_BASE_URL}/drug/label.json?search=description:{drug_a}+AND+description:{drug_b}&limit=1"
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(url)
            if response.status_code == 200:
                return response.json()
            return None
        except Exception as e:
            print(f"OpenFDA Error: {e}")
            return None
