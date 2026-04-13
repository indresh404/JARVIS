DRUG_INTERACTION_PROMPT = """
Analyze drug interaction data and provide a plain-language warning.
INPUT: {interaction_data}
Return JSON with:
- warning_text: plain-language explanation of the risk.
- severity_label: informational, caution, or critical.
- medicine_risk_score: 0-100.
- recommendation: clear instruction (e.g. "do not take without doctor guidance").

Respond ONLY with valid JSON. No prose. No markdown.
"""
