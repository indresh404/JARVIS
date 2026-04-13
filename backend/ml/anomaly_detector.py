import numpy as np
from sklearn.ensemble import IsolationForest
import joblib
import os

MODEL_DIR = "ml/saved_models"
os.makedirs(MODEL_DIR, exist_ok=True)

def train_model(patient_id: str, metric: str, baseline_values: list[float]) -> str:
    """
    Train an Isolation Forest on 14-day baseline readings.
    Unsupervised — no labels needed.
    Learns what 'normal' looks like for this specific patient and metric.
    contamination=0.05 means it expects ~5% of readings to be anomalies.
    Minimum 7 data points required to train. Returns model path.
    """
    if len(baseline_values) < 7:
        return None

    X = np.array(baseline_values).reshape(-1, 1)
    model = IsolationForest(
        n_estimators=100,
        contamination=0.05,
        random_state=42
    )
    model.fit(X)
    path = f"{MODEL_DIR}/{patient_id}_{metric}.joblib"
    joblib.dump(model, path)
    return path

def predict_anomaly(patient_id: str, metric: str,
                    current_values: list[float],
                    baseline_14day: list[float]) -> dict:
    """
    Hybrid detection: Isolation Forest + statistical fallback.
    Both are run. Result is the union — anomaly if either fires.
    Returns detection_source so caller knows which method triggered.

    Isolation Forest: -1 = anomaly, 1 = normal.
    score_samples(): more negative = more anomalous (range ~-0.7 to -0.1).
    confidence normalized to 0–1 from raw score magnitude.
    """
    path = f"{MODEL_DIR}/{patient_id}_{metric}.joblib"

    # --- Statistical check (always runs) ---
    mean_b = float(np.mean(baseline_14day))
    std_b = float(np.std(baseline_14day))
    stat_anomaly = all(v > mean_b + 1.5 * std_b for v in current_values) if std_b > 0 else False
    stat_deviation = (
        (current_values[-1] - mean_b) / std_b if std_b > 0 else 0.0
    )

    # --- ML check (runs only if model exists) ---
    if not os.path.exists(path):
        return {
            "anomaly_detected": stat_anomaly,
            "ml_anomaly": False,
            "stat_anomaly": stat_anomaly,
            "anomaly_score": round(stat_deviation, 4),
            "ml_confidence": 0.0,
            "days_elevated": sum(
                1 for v in current_values if v > mean_b + 1.5 * std_b
            ) if std_b > 0 else 0,
            "detection_source": "statistical_fallback" if stat_anomaly else "none",
            "mean_baseline": round(mean_b, 2),
            "std_baseline": round(std_b, 2),
        }

    model = joblib.load(path)
    X = np.array([[current_values[-1]]])
    prediction = model.predict(X)[0]
    raw_score = model.score_samples(X)[0]
    ml_confidence = min(1.0, max(0.0, abs(raw_score) * 2))
    ml_anomaly = prediction == -1 and ml_confidence > 0.6

    # Final decision: stat OR high-confidence ML
    anomaly_detected = stat_anomaly or ml_anomaly

    source = "isolation_forest" if ml_anomaly else (
        "statistical_fallback" if stat_anomaly else "none"
    )

    return {
        "anomaly_detected": anomaly_detected,
        "ml_anomaly": ml_anomaly,
        "stat_anomaly": stat_anomaly,
        "anomaly_score": round(float(raw_score), 4),
        "ml_confidence": round(ml_confidence, 2),
        "days_elevated": sum(
            1 for v in current_values if v > mean_b + 1.5 * std_b
        ) if std_b > 0 else 0,
        "detection_source": source,
        "mean_baseline": round(mean_b, 2),
        "std_baseline": round(std_b, 2),
    }

def retrain_if_stale(patient_id: str, metric: str,
                     baseline_values: list[float],
                     days_since_train: int) -> bool:
    """
    Retrain if model is 7+ days old or does not exist.
    Returns True if retrained, False if skipped.
    """
    path = f"{MODEL_DIR}/{patient_id}_{metric}.joblib"
    if days_since_train >= 7 or not os.path.exists(path):
        result = train_model(patient_id, metric, baseline_values)
        return result is not None
    return False
