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

# Mock Database for Jan Aushadhi Generic Medicines
GENERIC_DB = [
    {"brand": "Glycomet 500mg", "generic": "Metformin 500mg", "price": 45.0, "jan_price": 9.5, "conditions": ["Diabetes"]},
    {"brand": "Amlong 5mg", "generic": "Amlodipine 5mg", "price": 68.0, "jan_price": 12.0, "conditions": ["Hypertension", "BP"]},
    {"brand": "Telma 40", "generic": "Telmisartan 40mg", "price": 105.0, "jan_price": 22.0, "conditions": ["Hypertension", "BP"]},
    {"brand": "Ecosprin 75", "generic": "Aspirin 75mg", "price": 25.0, "jan_price": 5.0, "conditions": ["BP", "Heart"]},
    {"brand": "Caldikind", "generic": "Calcium + Vitamin D3", "price": 180.0, "jan_price": 45.0, "conditions": ["Deficiency"]},
    {"brand": "Augmentin 625", "generic": "Amoxicillin + Clavulanic Acid 625mg", "price": 210.0, "jan_price": 55.0, "conditions": ["Infection"]},
    {"brand": "Pantocid 40", "generic": "Pantoprazole 40mg", "price": 140.0, "jan_price": 32.0, "conditions": ["Acidity"]},
    {"brand": "Zyrtec", "generic": "Cetirizine 10mg", "price": 40.0, "jan_price": 8.0, "conditions": ["Allergy"]},
    {"brand": "Voveran", "generic": "Diclofenac 50mg", "price": 55.0, "jan_price": 12.0, "conditions": ["Pain"]},
    {"brand": "Dolo 650", "generic": "Paracetamol 650mg", "price": 32.0, "jan_price": 7.0, "conditions": ["Fever", "Pain"]},
    {"brand": "Combiflam", "generic": "Ibuprofen + Paracetamol", "price": 48.0, "jan_price": 11.0, "conditions": ["Pain"]},
    {"brand": "Atorva 10", "generic": "Atorvastatin 10mg", "price": 120.0, "jan_price": 28.0, "conditions": ["Cholesterol"]},
    {"brand": "Budecort", "generic": "Budesonide Inhaler", "price": 450.0, "jan_price": 110.0, "conditions": ["Asthma"]},
]

@router.post("/match", response_model=SchemesResponse)
async def match_schemes(data: SchemeMatchInput):
    """
    Match patient profile against hardcoded eligibility rules and generic medicines.
    """
    matched = []
    
    # Simple rule-based matching for Government Schemes
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

    # Find generic alternatives for confirmed conditions & demographics
    generic_alts = []
    
    # If the patient has specific conditions, find matching generic medicines
    for gen in GENERIC_DB:
        is_relevant = False
        # Check if any of the medication's treated conditions are in the patient's conditions
        if any(cond.lower() in [pc.lower() for pc in data.confirmed_conditions] for cond in gen["conditions"]):
            is_relevant = True
        
        # Also check for common synonyms or categories
        if not is_relevant:
            if "Hypertension" in data.confirmed_conditions and any(c in ["BP", "Hypertension"] for c in gen["conditions"]):
                is_relevant = True
            if "Diabetes" in data.confirmed_conditions and "Diabetes" in gen["conditions"]:
                is_relevant = True

        if is_relevant:
            savings = ((gen["price"] - gen["jan_price"]) / gen["price"]) * 100
            generic_alts.append(GenericMedicine(
                brand_name=gen["brand"],
                generic_name=gen["generic"],
                market_price=gen["price"],
                jan_aushadhi_price=gen["jan_price"],
                savings_percentage=round(savings, 2)
            ))

    # Sort generic alternatives by savings
    generic_alts.sort(key=lambda x: x.savings_percentage, reverse=True)

    return SchemesResponse(
        matched_schemes=matched,
        nearby_hospitals=hospitals,
        generic_alternatives=generic_alts
    )
