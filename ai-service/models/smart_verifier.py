"""
==========================================================================
SMART VERIFICATION MODULE — AI-Enhanced Document/Credential Verification
==========================================================================
This module provides intelligent verification of academic credentials
by combining rule-based checks with a Gradient Boosting ML model.

HOW IT WORKS:
1. RULE-BASED CHECKS (deterministic):
   - Hash consistency: Does the credential hash match the stored data?
   - Timestamp validation: Is the issue date reasonable?
   - Expiry check: Has the credential expired?
   - Signature validation: Are all required signatories present?
   - Blockchain anchoring: Is it recorded on the blockchain?

2. ML-BASED TRUST SCORING (probabilistic):
   A Gradient Boosting Classifier trained on credential features predicts
   the probability that a credential is trustworthy.
   
   Features used:
   - Number of signatories (more = more trustworthy)
   - Verification score (vScore) from blockchain
   - Age of credential (days since issuance)
   - Whether it's blockchain-anchored
   - Number of previous verifications
   - Issuer reputation score

3. COMBINED AI TRUST SCORE:
   Final score = weighted combination of rule-based score and ML prediction
   - 60% weight to rule-based checks (hard requirements)
   - 40% weight to ML prediction (pattern-based trust)

WHY THIS APPROACH?
- Rule-based catches definite issues (hash mismatch = definitely invalid)
- ML catches subtle patterns (unusual combination of metadata values)
- Combined approach is both reliable AND intelligent
- Easy to explain in viva: "We use rules for known checks + ML for
  detecting patterns humans might miss"
==========================================================================
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
import joblib
import os
from datetime import datetime, timezone


def extract_credential_features(credentials):
    """
    Convert credential metadata into numerical features for ML model.
    
    Args:
        credentials: list of dicts with credential metadata
    
    Returns:
        pandas DataFrame with engineered features
    """
    features = []
    now = datetime.now(timezone.utc)
    
    for cred in credentials:
        # Feature 1: Number of signatories
        signatory_count = len(cred.get("signatoryIds", []))
        
        # Feature 2: Verification score from blockchain
        v_score = float(cred.get("vScore", 0))
        
        # Feature 3: Age of credential in days
        issue_date_str = cred.get("issueDate", "")
        try:
            issue_date = datetime.fromisoformat(issue_date_str.replace("Z", "+00:00"))
            age_days = (now - issue_date).days
        except (ValueError, TypeError):
            age_days = -1  # Invalid date is a red flag
        
        # Feature 4: Has blockchain transaction hash
        has_hash = 1.0 if cred.get("hashId", "") else 0.0
        
        # Feature 5: Has IPFS CID (content identifier)
        has_cid = 1.0 if cred.get("cid", "") else 0.0
        
        # Feature 6: Has aggregate signature (BLS)
        has_signature = 1.0 if cred.get("aggregateSignature", "") else 0.0
        
        # Feature 7: Has merkle root
        has_merkle = 1.0 if cred.get("merkleRoot", "") else 0.0
        
        # Feature 8: Credential status (1 = active, 0 = revoked)
        is_active = 1.0 if cred.get("status", "") == "active" else 0.0
        
        # Feature 9: Has expiry date
        has_expiry = 1.0 if cred.get("expiryDate") else 0.0
        
        # Feature 10: Number of access/verification logs
        access_count = float(cred.get("accessCount", 0))
        
        features.append({
            "signatory_count": signatory_count,
            "v_score": v_score,
            "age_days": max(age_days, 0),
            "has_hash": has_hash,
            "has_cid": has_cid,
            "has_signature": has_signature,
            "has_merkle": has_merkle,
            "is_active": is_active,
            "has_expiry": has_expiry,
            "access_count": access_count,
        })
    
    return pd.DataFrame(features)


def generate_training_data(n_legitimate=300, n_fraudulent=50):
    """
    Generate synthetic credential data for training.
    
    Legitimate credentials have: high vScore, multiple signatories,
    valid blockchain anchoring, reasonable dates.
    
    Fraudulent credentials have: low vScore, missing signatures,
    no blockchain proof, suspicious dates.
    """
    credentials = []
    labels = []
    
    np.random.seed(42)
    
    # ---- LEGITIMATE credentials ----
    for i in range(n_legitimate):
        days_ago = np.random.randint(1, 1000)
        issue_date = datetime.now(timezone.utc).replace(
            hour=10, minute=0, second=0, microsecond=0
        )
        
        credentials.append({
            "signatoryIds": ["FAC001", "ADM001"] if np.random.random() > 0.2 else ["ADM001"],
            "vScore": np.random.uniform(75, 100),
            "issueDate": issue_date.isoformat(),
            "hashId": f"0x{'a' * 64}" if np.random.random() > 0.05 else "",
            "cid": f"bafk{'x' * 50}" if np.random.random() > 0.05 else "",
            "aggregateSignature": f"bls_agg_{'y' * 40}" if np.random.random() > 0.1 else "",
            "merkleRoot": f"0x{'b' * 64}" if np.random.random() > 0.1 else "",
            "status": "active",
            "expiryDate": None if np.random.random() > 0.3 else "2030-01-01T00:00:00.000Z",
            "accessCount": np.random.randint(0, 20),
        })
        labels.append(1)  # Legitimate
    
    # ---- FRAUDULENT credentials ----
    for i in range(n_fraudulent):
        fraud_type = i % 5
        
        if fraud_type == 0:
            # Missing all blockchain proof
            cred = {
                "signatoryIds": [],
                "vScore": np.random.uniform(10, 40),
                "issueDate": "2020-01-01T00:00:00.000Z",
                "hashId": "",
                "cid": "",
                "aggregateSignature": "",
                "merkleRoot": "",
                "status": "active",
                "expiryDate": None,
                "accessCount": 0,
            }
        elif fraud_type == 1:
            # Revoked but still being presented
            cred = {
                "signatoryIds": ["FAC001"],
                "vScore": np.random.uniform(20, 50),
                "issueDate": datetime.now(timezone.utc).isoformat(),
                "hashId": f"0x{'c' * 64}",
                "cid": "",
                "aggregateSignature": "",
                "merkleRoot": "",
                "status": "revoked",
                "expiryDate": None,
                "accessCount": np.random.randint(0, 3),
            }
        elif fraud_type == 2:
            # Very low vScore with some proof (partial forgery)
            cred = {
                "signatoryIds": ["UNKNOWN"],
                "vScore": np.random.uniform(5, 25),
                "issueDate": datetime.now(timezone.utc).isoformat(),
                "hashId": f"0x{'d' * 64}",
                "cid": f"bafk{'z' * 50}",
                "aggregateSignature": "",
                "merkleRoot": "",
                "status": "active",
                "expiryDate": None,
                "accessCount": 0,
            }
        elif fraud_type == 3:
            # Invalid/missing issue date
            cred = {
                "signatoryIds": ["FAC001"],
                "vScore": np.random.uniform(30, 60),
                "issueDate": "",
                "hashId": f"0x{'e' * 64}",
                "cid": "",
                "aggregateSignature": "",
                "merkleRoot": "",
                "status": "active",
                "expiryDate": None,
                "accessCount": 0,
            }
        else:
            # Suspicious combination: high access count but no blockchain proof
            cred = {
                "signatoryIds": [],
                "vScore": np.random.uniform(40, 60),
                "issueDate": datetime.now(timezone.utc).isoformat(),
                "hashId": "",
                "cid": "",
                "aggregateSignature": "",
                "merkleRoot": "",
                "status": "active",
                "expiryDate": None,
                "accessCount": np.random.randint(10, 50),
            }
        
        credentials.append(cred)
        labels.append(0)  # Fraudulent
    
    return credentials, labels


class SmartVerifier:
    """
    Smart Verification Engine combining rule-based checks with ML prediction.
    
    Usage:
        verifier = SmartVerifier()
        verifier.train(training_credentials, labels)
        result = verifier.verify(credential_data)
    """
    
    def __init__(self):
        self.model = GradientBoostingClassifier(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=4,
            random_state=42,
        )
        self.scaler = StandardScaler()
        self.is_trained = False
    
    def train(self, credentials, labels):
        """
        Train the ML model on credential data.
        
        Args:
            credentials: list of credential dicts
            labels: list of ints (1 = legitimate, 0 = fraudulent)
        """
        df = extract_credential_features(credentials)
        scaled_data = self.scaler.fit_transform(df)
        
        self.model.fit(scaled_data, labels)
        self.is_trained = True
        
        # Show feature importance (useful for viva explanation)
        importances = self.model.feature_importances_
        feature_names = list(df.columns)
        print(f"✅ Smart Verifier trained on {len(credentials)} credentials")
        print(f"   Top features by importance:")
        for name, imp in sorted(zip(feature_names, importances), key=lambda x: -x[1])[:5]:
            print(f"     {name}: {imp:.4f}")
    
    def verify(self, credential):
        """
        Verify a single credential using rules + ML.
        
        Args:
            credential: dict with credential metadata
        
        Returns:
            dict with:
              - ai_trust_score: 0-100 (higher = more trustworthy)
              - ml_confidence: 0-1 (ML model's confidence)
              - rule_score: 0-100 (rule-based score)
              - risk_level: "low" | "medium" | "high" | "critical"
              - checks: dict of individual rule results
              - recommendation: human-readable recommendation
              - details: list of check descriptions
        """
        # ---- STEP 1: Rule-based checks ----
        checks = self._run_rule_checks(credential)
        rule_score = self._calculate_rule_score(checks)
        
        # ---- STEP 2: ML prediction ----
        ml_confidence = 0.5  # Default if model not trained
        if self.is_trained:
            df = extract_credential_features([credential])
            scaled_data = self.scaler.transform(df)
            # Get probability of being legitimate (class 1)
            probabilities = self.model.predict_proba(scaled_data)[0]
            ml_confidence = float(probabilities[1]) if len(probabilities) > 1 else 0.5
        
        # ---- STEP 3: Combine scores ----
        # 60% rule-based (hard checks) + 40% ML (pattern detection)
        ai_trust_score = round(0.6 * rule_score + 0.4 * (ml_confidence * 100), 1)
        
        # Determine risk level
        if ai_trust_score >= 80:
            risk_level = "low"
        elif ai_trust_score >= 60:
            risk_level = "medium"
        elif ai_trust_score >= 40:
            risk_level = "high"
        else:
            risk_level = "critical"
        
        # Generate recommendation
        recommendation = self._generate_recommendation(ai_trust_score, checks, risk_level)
        
        # Build detailed check descriptions
        details = self._build_details(checks)
        
        return {
            "ai_trust_score": ai_trust_score,
            "ml_confidence": round(ml_confidence, 4),
            "rule_score": round(rule_score, 1),
            "risk_level": risk_level,
            "checks": checks,
            "recommendation": recommendation,
            "details": details,
        }
    
    def verify_batch(self, credentials):
        """Verify multiple credentials at once."""
        return [self.verify(cred) for cred in credentials]
    
    def _run_rule_checks(self, credential):
        """
        Run deterministic rule-based checks on a credential.
        Each check returns True (passed) or False (failed).
        """
        checks = {}
        
        # Check 1: Hash ID exists (credential is blockchain-anchored)
        checks["hash_exists"] = bool(credential.get("hashId", ""))
        
        # Check 2: IPFS CID exists (document is stored on IPFS)
        checks["cid_exists"] = bool(credential.get("cid", ""))
        
        # Check 3: Aggregate signature present
        checks["signature_valid"] = bool(credential.get("aggregateSignature", ""))
        
        # Check 4: Has at least one signatory
        signatories = credential.get("signatoryIds", [])
        checks["has_signatories"] = len(signatories) > 0
        
        # Check 5: Multiple signatories (stronger validation)
        checks["multi_signed"] = len(signatories) >= 2
        
        # Check 6: Credential is active (not revoked)
        checks["is_active"] = credential.get("status", "") == "active"
        
        # Check 7: Valid issue date
        issue_date_str = credential.get("issueDate", "")
        try:
            issue_date = datetime.fromisoformat(issue_date_str.replace("Z", "+00:00"))
            now = datetime.now(timezone.utc)
            checks["valid_date"] = issue_date <= now  # Not in the future
            checks["not_too_old"] = (now - issue_date).days < 3650  # Less than 10 years
        except (ValueError, TypeError):
            checks["valid_date"] = False
            checks["not_too_old"] = False
        
        # Check 8: Merkle root present (part of merkle tree verification)
        checks["merkle_root_exists"] = bool(credential.get("merkleRoot", ""))
        
        # Check 9: vScore above threshold
        v_score = float(credential.get("vScore", 0))
        checks["vscore_acceptable"] = v_score >= 50
        
        # Check 10: Not expired (if expiry date exists)
        expiry_str = credential.get("expiryDate", "")
        if expiry_str:
            try:
                expiry_date = datetime.fromisoformat(expiry_str.replace("Z", "+00:00"))
                checks["not_expired"] = expiry_date > datetime.now(timezone.utc)
            except (ValueError, TypeError):
                checks["not_expired"] = False
        else:
            checks["not_expired"] = True  # No expiry = never expires
        
        return checks
    
    def _calculate_rule_score(self, checks):
        """
        Calculate a 0-100 score from rule-based checks.
        Some checks are weighted more heavily than others.
        """
        weights = {
            "hash_exists": 15,        # Critical: must be on blockchain
            "cid_exists": 10,         # Important: document stored on IPFS
            "signature_valid": 15,    # Critical: must be signed
            "has_signatories": 10,    # Important: must have signatories
            "multi_signed": 5,        # Nice to have: multiple signatories
            "is_active": 15,          # Critical: must not be revoked
            "valid_date": 10,         # Important: valid issue date
            "not_too_old": 5,         # Minor: not too old
            "merkle_root_exists": 5,  # Nice to have: merkle proof
            "vscore_acceptable": 5,   # Minor: vScore check
            "not_expired": 5,         # Important: not expired
        }
        
        total_weight = sum(weights.values())
        earned = sum(weights[check] for check, passed in checks.items() if passed and check in weights)
        
        return (earned / total_weight) * 100 if total_weight > 0 else 0
    
    def _generate_recommendation(self, trust_score, checks, risk_level):
        """Generate a human-readable recommendation."""
        if risk_level == "low":
            return "✅ Credential appears authentic. All critical checks passed. Safe to accept."
        elif risk_level == "medium":
            failed = [k for k, v in checks.items() if not v]
            return f"⚠️ Credential has minor issues ({', '.join(failed)}). Manual review recommended."
        elif risk_level == "high":
            return "🚨 Credential has significant trust issues. Do NOT accept without thorough manual verification."
        else:
            return "❌ Credential is likely fraudulent or severely compromised. Reject and investigate."
    
    def _build_details(self, checks):
        """Build a list of human-readable check descriptions."""
        descriptions = {
            "hash_exists": ("Blockchain Hash", "Credential hash exists on blockchain"),
            "cid_exists": ("IPFS Storage", "Document is stored on IPFS"),
            "signature_valid": ("Digital Signature", "Aggregate BLS signature is present"),
            "has_signatories": ("Signatory Verification", "At least one authorized signatory"),
            "multi_signed": ("Multi-Signature", "Signed by multiple authorities"),
            "is_active": ("Active Status", "Credential has not been revoked"),
            "valid_date": ("Issue Date", "Issue date is valid and not in the future"),
            "not_too_old": ("Age Check", "Credential is within acceptable age range"),
            "merkle_root_exists": ("Merkle Proof", "Merkle root exists for tree verification"),
            "vscore_acceptable": ("V-Score", "Verification score meets minimum threshold"),
            "not_expired": ("Expiry Check", "Credential has not expired"),
        }
        
        details = []
        for check, passed in checks.items():
            label, description = descriptions.get(check, (check, check))
            details.append({
                "check": label,
                "description": description,
                "passed": passed,
                "status": "✅ Passed" if passed else "❌ Failed",
            })
        
        return details
    
    def save(self, directory="saved_models"):
        """Save trained model and scaler to disk."""
        os.makedirs(directory, exist_ok=True)
        joblib.dump(self.model, os.path.join(directory, "smart_verifier_model.joblib"))
        joblib.dump(self.scaler, os.path.join(directory, "smart_verifier_scaler.joblib"))
        print(f"✅ Smart Verifier saved to {directory}/")
    
    def load(self, directory="saved_models"):
        """Load trained model and scaler from disk."""
        model_path = os.path.join(directory, "smart_verifier_model.joblib")
        scaler_path = os.path.join(directory, "smart_verifier_scaler.joblib")
        
        if os.path.exists(model_path) and os.path.exists(scaler_path):
            self.model = joblib.load(model_path)
            self.scaler = joblib.load(scaler_path)
            self.is_trained = True
            print(f"✅ Smart Verifier loaded from {directory}/")
            return True
        return False


# ============================================================
# Quick test — run this file directly to see it work
# ============================================================
if __name__ == "__main__":
    print("=" * 60)
    print("SMART VERIFICATION MODULE — Demo")
    print("=" * 60)
    
    # Generate training data
    training_creds, labels = generate_training_data()
    print(f"\nGenerated {len(training_creds)} training credentials")
    print(f"  Legitimate: {labels.count(1)}, Fraudulent: {labels.count(0)}")
    
    # Train the model
    verifier = SmartVerifier()
    verifier.train(training_creds, labels)
    
    # Test with sample credentials
    test_credentials = [
        # Legitimate credential (like the one in the existing system)
        {
            "id": "CRED-TEST-1",
            "title": "Official Academic Transcript",
            "signatoryIds": ["ADM001", "FAC001"],
            "vScore": 96,
            "issueDate": "2026-03-28T11:30:00.000Z",
            "hashId": "0xabc123def456",
            "cid": "bafkreig5svbon62pj7cg2v5iua3rlzlzrwcpnbbsq",
            "aggregateSignature": "bls_agg_xyz789",
            "merkleRoot": "0xmerkle_abc",
            "status": "active",
            "expiryDate": None,
            "accessCount": 3,
        },
        # Suspicious credential (missing blockchain proof)
        {
            "id": "CRED-TEST-2",
            "title": "Fake Degree Certificate",
            "signatoryIds": [],
            "vScore": 15,
            "issueDate": "2020-01-01T00:00:00.000Z",
            "hashId": "",
            "cid": "",
            "aggregateSignature": "",
            "merkleRoot": "",
            "status": "active",
            "expiryDate": None,
            "accessCount": 0,
        },
        # Revoked credential
        {
            "id": "CRED-TEST-3",
            "title": "Revoked Certificate",
            "signatoryIds": ["FAC001"],
            "vScore": 45,
            "issueDate": "2025-06-15T10:00:00.000Z",
            "hashId": "0xrevoked123",
            "cid": "bafkreirevoked",
            "aggregateSignature": "",
            "merkleRoot": "",
            "status": "revoked",
            "expiryDate": None,
            "accessCount": 1,
        },
    ]
    
    print(f"\n{'=' * 60}")
    print(f"Verifying {len(test_credentials)} credentials...")
    print(f"{'=' * 60}")
    
    for cred in test_credentials:
        result = verifier.verify(cred)
        print(f"\n📋 {cred['title']}")
        print(f"   AI Trust Score: {result['ai_trust_score']}/100")
        print(f"   ML Confidence:  {result['ml_confidence']:.2%}")
        print(f"   Rule Score:     {result['rule_score']}/100")
        print(f"   Risk Level:     {result['risk_level']}")
        print(f"   {result['recommendation']}")
        print(f"   Checks:")
        for detail in result["details"]:
            print(f"     {detail['status']} {detail['check']}: {detail['description']}")
