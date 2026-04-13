from ml.anomaly_detector import retrain_if_stale

def run_training(patient_id: str, metric: str, baseline_values: list[float], days_since_last_train: int) -> dict:
    """
    Wrapper to call retrain_if_stale and return status.
    Called by /ml/train-patient-model route.
    """
    trained = retrain_if_stale(patient_id, metric, baseline_values, days_since_last_train)
    
    return {
        "trained": trained,
        "model_path": f"ml/saved_models/{patient_id}_{metric}.joblib" if trained else None,
        "skipped_reason": "Insufficient data or model not stale" if not trained else None
    }
