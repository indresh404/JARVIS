import numpy as np
from sklearn.linear_model import LinearRegression

def calculate_trajectory(
    risk_scores_history: list[dict],  # [{date, final_score}] oldest first
    symptom_history: list[dict],      # [{date, severity}]
) -> dict:
    """
    Pure Python. No LLM. No ML model needed.
    Calculates slope, volatility, trajectory class, and 7-day projection.

    score_slope > 0 = worsening (score going up)
    score_slope < 0 = improving (score going down)
    """
    if len(risk_scores_history) < 3:
        return {
            "score_slope": 0.0,
            "volatility": 0.0,
            "trajectory": "Stable",
            "projected_scores": [risk_scores_history[-1]["final_score"]] * 7
            if risk_scores_history else [0] * 7,
            "symptom_frequency_ratio": 1.0,
            "data_days_used": len(risk_scores_history),
        }

    scores = [r["final_score"] for r in risk_scores_history]
    days = np.arange(len(scores)).reshape(-1, 1)

    # Linear regression slope
    reg = LinearRegression().fit(days, scores)
    slope = float(reg.coef_[0])

    # Volatility
    volatility = float(np.std(scores))

    # Symptom frequency: last 7 days vs prior 7 days
    recent_symptom_days = len(set(
        s["date"] for s in symptom_history[-7:]
    ))
    prior_symptom_days = len(set(
        s["date"] for s in symptom_history[-14:-7]
    ))
    ratio = (recent_symptom_days / max(prior_symptom_days, 1))

    # Trajectory classification
    if slope > 3 and ratio > 1.2:
        trajectory = "Worsening"
    elif slope < -3 and ratio < 0.8:
        trajectory = "Improving"
    elif volatility >= 10:
        trajectory = "Unstable"
    else:
        trajectory = "Stable"

    # 7-day projection
    current = scores[-1]
    projected = [
        int(min(100, max(0, current + slope * d)))
        for d in range(1, 8)
    ]

    return {
        "score_slope": round(slope, 2),
        "volatility": round(volatility, 2),
        "trajectory": trajectory,
        "projected_scores": projected,
        "symptom_frequency_ratio": round(ratio, 2),
        "data_days_used": len(risk_scores_history),
    }
