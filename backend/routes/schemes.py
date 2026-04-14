from fastapi import APIRouter
from typing import Dict, Any

router = APIRouter(prefix="/schemes", tags=["schemes"])

@router.post("/match")
async def match_schemes(data: Dict[str, Any]):
    # Return mock data for testing
    # Using the exact minimal structure requested for demo reliability
    return {
        "generic_alternatives": [
            {
                "brand_name": "Glycomet",
                "generic_name": "Metformin", 
                "price": 52,
                "savings": 98
            }
        ],
        "eligible_schemes": [
            {
                "scheme_name": "PM-JAY",
                "coverage": "₹5,00,000"
            }
        ],
        "summary": {
            "monthly_savings": 150,
            "annual_savings": 1800
        }
    }
