from fastapi import APIRouter
from schemas.models import SchemeMatchInput, SchemesResponse, Scheme, Hospital

router = APIRouter(prefix="/schemes", tags=["schemes"])

# Hardcoded eligibility rules for Indian government schemes
SCHEMES_DB = [
    Scheme(
        scheme_name="Ayushman Bharat PMJAY",
        conditions_covered=["Secondary and tertiary care hospitalization"],
        eligibility_summary="Families in SECC 2011 database, low income",
        coverage_amount="INR 5 Lakh per family per year",
        documents_needed=["Aadhaar Card", "Ration Card", "PMJAY ID"],
        treatment_types=["Surgical", "Medical", "Day care treatments"]
    ),
    Scheme(
        scheme_name="State NCD Programme",
        conditions_covered=["Diabetes", "Hypertension", "Cardiovascular diseases", "Cancer"],
        eligibility_summary="Focus on screening and early management of NCDs",
        coverage_amount="Free medicines and diagnostics at public facilities",
        documents_needed=["Aadhaar Card", "Diagnosis report"],
        treatment_types=["Outpatient care", "Diagnostic tests", "Basic medications"]
    ),
    Scheme(
        scheme_name="Rashtriya Swasthya Bima Yojana (RSBY)",
        conditions_covered=["Unorganized sector workers"],
        eligibility_summary="Below Poverty Line (BPL) families",
        coverage_amount="INR 30,000 per family per year",
        documents_needed=["RSBY Smart Card"],
        treatment_types=["Hospitalization costs"]
    )
]

HOSPITALS_DB = {
    "Maharashtra": [
        Hospital(name="Sion Hospital", address="Sion, Mumbai", distance_km=2.5, contact="022-24076381"),
        Hospital(name="KEM Hospital", address="Parel, Mumbai", distance_km=4.2, contact="022-24107000"),
        Hospital(name="SevenHills Hospital", address="Andheri, Mumbai", distance_km=6.8, contact="022-67676767")
    ],
    "Delhi": [
        Hospital(name="AIIMS", address="Ansari Nagar, Delhi", distance_km=1.2, contact="011-26588500"),
        Hospital(name="Safdarjung Hospital", address="Ansari Nagar East, Delhi", distance_km=1.5, contact="011-26707100")
    ]
}

@router.post("/match", response_model=SchemesResponse)
async def match_schemes(data: SchemeMatchInput):
    """
    Match patient profile against hardcoded eligibility rules.
    """
    matched = []
    
    # Simple rule-based matching
    for scheme in SCHEMES_DB:
        # Match by conditions
        if any(cond in scheme.conditions_covered for cond in data.confirmed_conditions):
            matched.append(scheme)
        # Ayushman Bharat match for high risk or specific conditions
        elif scheme.scheme_name == "Ayushman Bharat PMJAY" and (data.current_risk_level in ["Elevated", "High"] or data.income_category == "Low"):
            matched.append(scheme)
        # NCD programme for everyone with confirmed NCDs or high age
        elif scheme.scheme_name == "State NCD Programme" and (data.age > 40 or data.confirmed_conditions):
            matched.append(scheme)

    # Dedup
    matched = list({s.scheme_name: s for s in matched}.values())

    # Filter hospitals by state
    hospitals = HOSPITALS_DB.get(data.state, [])[:3]

    return SchemesResponse(
        matched_schemes=matched,
        nearby_hospitals=hospitals
    )
