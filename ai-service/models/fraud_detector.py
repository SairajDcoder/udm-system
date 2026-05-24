"""
==========================================================================
FRAUD DETECTION MODULE — Isolation Forest Anomaly Detection
==========================================================================
This module detects fraudulent or anomalous student records by training
an Isolation Forest model on grade data features.

HOW IT WORKS:
1. We extract numerical features from each grade record:
   - internal marks, external marks, total marks
   - ratio of internal to max internal (40)
   - ratio of external to max external (60)
   - difference between internal and external (normalized)

2. The Isolation Forest algorithm learns what "normal" grade patterns
   look like. Records that deviate significantly are flagged as anomalies.

3. Each record gets an anomaly_score between -1 (very anomalous) and
   +1 (very normal). Records with score < 0 are flagged for review.

WHY ISOLATION FOREST?
- Works well with small datasets (perfect for academic project)
- No need for labeled fraud data (unsupervised learning)
- Fast training and prediction
- Easy to explain in viva/presentation
==========================================================================
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib
import os

# Constants matching the existing system
INTERNAL_MAX = 40
EXTERNAL_MAX = 60
TOTAL_MAX = 100


def extract_features(records):
    """
    Convert raw grade records into numerical features for the ML model.
    
    Each record is expected to have: internal, external, total, grade
    We create additional derived features to help the model detect anomalies.
    
    Args:
        records: list of dicts with keys: internal, external, total
    
    Returns:
        pandas DataFrame with engineered features
    """
    features = []
    
    for record in records:
        internal = float(record.get("internal", 0))
        external = float(record.get("external", 0))
        total = float(record.get("total", 0))
        
        # Feature 1-3: Raw marks
        # Feature 4: Internal marks ratio (0 to 1)
        internal_ratio = internal / INTERNAL_MAX if INTERNAL_MAX > 0 else 0
        
        # Feature 5: External marks ratio (0 to 1)
        external_ratio = external / EXTERNAL_MAX if EXTERNAL_MAX > 0 else 0
        
        # Feature 6: Internal-External balance
        # Normal students tend to have proportional internal/external marks
        # A big imbalance could indicate manipulation
        balance = abs(internal_ratio - external_ratio)
        
        # Feature 7: Total consistency check
        # Does internal + external actually equal total?
        expected_total = internal + external
        total_mismatch = abs(total - expected_total)
        
        # Feature 8: Is total within valid range?
        out_of_range = 1.0 if (total > TOTAL_MAX or total < 0 or
                                internal > INTERNAL_MAX or internal < 0 or
                                external > EXTERNAL_MAX or external < 0) else 0.0
        
        features.append({
            "internal": internal,
            "external": external,
            "total": total,
            "internal_ratio": internal_ratio,
            "external_ratio": external_ratio,
            "balance": balance,
            "total_mismatch": total_mismatch,
            "out_of_range": out_of_range,
        })
    
    return pd.DataFrame(features)


def generate_training_data(n_normal=200, n_anomalous=20):
    """
    Generate synthetic training data for the Isolation Forest model.
    
    This creates:
    - Normal records: realistic grade distributions (bell curve around 65-75)
    - Anomalous records: suspicious patterns like perfect scores, mismatched
      totals, out-of-range values
    
    In a real system, you would use actual historical grade data instead.
    
    Args:
        n_normal: number of normal records to generate
        n_anomalous: number of anomalous records to generate
    
    Returns:
        list of grade record dicts, list of labels (0=normal, 1=anomaly)
    """
    records = []
    labels = []
    
    np.random.seed(42)
    
    # ---- Generate NORMAL student records ----
    for _ in range(n_normal):
        # Normal internal marks: bell curve centered around 25/40
        internal = np.clip(np.random.normal(25, 6), 5, 38)
        internal = round(internal)
        
        # Normal external marks: bell curve centered around 38/60
        external = np.clip(np.random.normal(38, 10), 10, 57)
        external = round(external)
        
        total = internal + external
        
        records.append({
            "internal": internal,
            "external": external,
            "total": total,
        })
        labels.append(0)  # Normal
    
    # ---- Generate ANOMALOUS records ----
    for i in range(n_anomalous):
        anomaly_type = i % 5
        
        if anomaly_type == 0:
            # Type 1: Perfect scores (suspicious - very rare in reality)
            internal = 40
            external = 60
            total = 100
        
        elif anomaly_type == 1:
            # Type 2: Total doesn't match internal + external (data tampering)
            internal = round(np.random.uniform(20, 35))
            external = round(np.random.uniform(30, 50))
            total = internal + external + round(np.random.uniform(5, 15))
        
        elif anomaly_type == 2:
            # Type 3: Out of range values
            internal = round(np.random.uniform(42, 55))  # exceeds max of 40
            external = round(np.random.uniform(30, 50))
            total = internal + external
        
        elif anomaly_type == 3:
            # Type 4: Extreme imbalance (very high internal, very low external)
            internal = round(np.random.uniform(35, 40))
            external = round(np.random.uniform(0, 8))
            total = internal + external
        
        else:
            # Type 5: Very low total (possible grade suppression)
            internal = round(np.random.uniform(0, 3))
            external = round(np.random.uniform(0, 5))
            total = internal + external
        
        records.append({
            "internal": int(internal),
            "external": int(external),
            "total": int(total),
        })
        labels.append(1)  # Anomaly
    
    return records, labels


class FraudDetector:
    """
    Fraud Detection Engine using Isolation Forest.
    
    Usage:
        detector = FraudDetector()
        detector.train(training_records)
        results = detector.detect(records_to_check)
    """
    
    def __init__(self):
        self.model = IsolationForest(
            n_estimators=100,        # Number of trees in the forest
            contamination=0.1,       # Expected fraction of anomalies (10%)
            random_state=42,         # For reproducibility
            max_samples="auto",      # Use all samples
        )
        self.scaler = StandardScaler()  # Normalizes features to same scale
        self.is_trained = False
    
    def train(self, records):
        """
        Train the Isolation Forest model on grade records.
        
        Args:
            records: list of dicts with internal, external, total
        """
        df = extract_features(records)
        
        # Normalize features so no single feature dominates
        scaled_data = self.scaler.fit_transform(df)
        
        # Train the Isolation Forest
        self.model.fit(scaled_data)
        self.is_trained = True
        
        print(f"✅ Fraud Detector trained on {len(records)} records")
        print(f"   Features used: {list(df.columns)}")
    
    def detect(self, records):
        """
        Analyze records and detect anomalies.
        
        Args:
            records: list of dicts with keys: studentId, courseId, 
                     internal, external, total, grade, term, id
        
        Returns:
            list of dicts, each containing:
              - all original record fields
              - anomaly_score: float (-1 = very anomalous, +1 = very normal)
              - is_anomaly: bool (True if flagged as suspicious)
              - risk_level: "high" | "medium" | "low"
              - reasons: list of strings explaining why it was flagged
        """
        if not self.is_trained:
            raise ValueError("Model not trained yet. Call train() first.")
        
        df = extract_features(records)
        scaled_data = self.scaler.transform(df)
        
        # Get anomaly predictions (-1 = anomaly, 1 = normal)
        predictions = self.model.predict(scaled_data)
        
        # Get anomaly scores (lower = more anomalous)
        scores = self.model.decision_function(scaled_data)
        
        results = []
        for i, record in enumerate(records):
            score = float(scores[i])
            is_anomaly = int(predictions[i]) == -1
            
            # Determine risk level based on anomaly score
            if score < -0.3:
                risk_level = "high"
            elif score < -0.1:
                risk_level = "medium"
            else:
                risk_level = "low"
            
            # Generate human-readable explanations
            reasons = self._explain_anomaly(record, df.iloc[i], is_anomaly)
            
            results.append({
                **record,
                "anomaly_score": round(score, 4),
                "is_anomaly": is_anomaly,
                "risk_level": risk_level,
                "reasons": reasons,
            })
        
        return results
    
    def _explain_anomaly(self, record, features, is_anomaly):
        """
        Generate human-readable reasons for why a record was flagged.
        
        This is important for academic projects — the AI must be EXPLAINABLE.
        """
        reasons = []
        
        if not is_anomaly:
            return ["Record appears normal — no anomalies detected"]
        
        internal = float(record.get("internal", 0))
        external = float(record.get("external", 0))
        total = float(record.get("total", 0))
        
        # Check: Out of range values
        if internal > INTERNAL_MAX:
            reasons.append(f"Internal marks ({internal}) exceed maximum ({INTERNAL_MAX})")
        if internal < 0:
            reasons.append(f"Internal marks ({internal}) are negative")
        if external > EXTERNAL_MAX:
            reasons.append(f"External marks ({external}) exceed maximum ({EXTERNAL_MAX})")
        if external < 0:
            reasons.append(f"External marks ({external}) are negative")
        
        # Check: Total mismatch
        expected_total = internal + external
        if abs(total - expected_total) > 0.5:
            reasons.append(
                f"Total ({total}) doesn't match internal + external ({expected_total}) — possible tampering"
            )
        
        # Check: Perfect scores
        if internal == INTERNAL_MAX and external == EXTERNAL_MAX:
            reasons.append("Perfect score in both components — statistically rare, needs verification")
        
        # Check: Extreme imbalance
        if features["balance"] > 0.5:
            reasons.append(
                f"Unusual imbalance between internal ({internal}) and external ({external}) performance"
            )
        
        # Check: Very low total
        if total < 10 and total >= 0:
            reasons.append(f"Extremely low total marks ({total}) — potential grade suppression")
        
        # If no specific reason found, give a general one
        if not reasons:
            reasons.append("Statistical anomaly detected — grade pattern deviates significantly from normal distribution")
        
        return reasons
    
    def save(self, directory="saved_models"):
        """Save trained model and scaler to disk."""
        os.makedirs(directory, exist_ok=True)
        joblib.dump(self.model, os.path.join(directory, "fraud_detector_model.joblib"))
        joblib.dump(self.scaler, os.path.join(directory, "fraud_detector_scaler.joblib"))
        print(f"✅ Model saved to {directory}/")
    
    def load(self, directory="saved_models"):
        """Load trained model and scaler from disk."""
        model_path = os.path.join(directory, "fraud_detector_model.joblib")
        scaler_path = os.path.join(directory, "fraud_detector_scaler.joblib")
        
        if os.path.exists(model_path) and os.path.exists(scaler_path):
            self.model = joblib.load(model_path)
            self.scaler = joblib.load(scaler_path)
            self.is_trained = True
            print(f"✅ Fraud Detector loaded from {directory}/")
            return True
        return False


# ============================================================
# Quick test — run this file directly to see it work
# ============================================================
if __name__ == "__main__":
    print("=" * 60)
    print("FRAUD DETECTION MODULE — Demo")
    print("=" * 60)
    
    # Generate training data
    training_records, labels = generate_training_data()
    print(f"\nGenerated {len(training_records)} training records")
    print(f"  Normal: {labels.count(0)}, Anomalous: {labels.count(1)}")
    
    # Train the model
    detector = FraudDetector()
    detector.train(training_records)
    
    # Test with some sample records
    test_records = [
        # Normal record
        {"studentId": "STU001", "courseId": "CS401", "internal": 28, "external": 45, "total": 73, "grade": "B", "term": "Spring 2026", "id": "TEST-1"},
        # Suspicious: total doesn't match
        {"studentId": "STU002", "courseId": "CS401", "internal": 25, "external": 40, "total": 85, "grade": "A", "term": "Spring 2026", "id": "TEST-2"},
        # Suspicious: out of range
        {"studentId": "STU003", "courseId": "CS402", "internal": 45, "external": 50, "total": 95, "grade": "A+", "term": "Spring 2026", "id": "TEST-3"},
        # Suspicious: perfect score
        {"studentId": "STU004", "courseId": "MA301", "internal": 40, "external": 60, "total": 100, "grade": "A+", "term": "Autumn 2025", "id": "TEST-4"},
        # Normal record
        {"studentId": "STU005", "courseId": "MA301", "internal": 30, "external": 42, "total": 72, "grade": "B", "term": "Autumn 2025", "id": "TEST-5"},
    ]
    
    print(f"\n{'=' * 60}")
    print(f"Analyzing {len(test_records)} records...")
    print(f"{'=' * 60}")
    
    results = detector.detect(test_records)
    
    for result in results:
        status = "🚨 FLAGGED" if result["is_anomaly"] else "✅ NORMAL"
        print(f"\n{status} | {result.get('studentId', 'N/A')} | "
              f"Score: {result['anomaly_score']:.4f} | Risk: {result['risk_level']}")
        for reason in result["reasons"]:
            print(f"   → {reason}")
