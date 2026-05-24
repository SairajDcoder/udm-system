"""
==========================================================================
FLASK AI MICROSERVICE — UniChain UDM System
==========================================================================
This Flask application serves as the AI backend for the University Data
Management System. It provides two REST API endpoints:

  POST /api/fraud-detection   → Detect anomalous grade records
  POST /api/smart-verify      → AI-enhanced credential verification
  GET  /api/health            → Health check

The service loads pre-trained ML models from the saved_models/ directory.
If models are not found, it trains them on-the-fly with synthetic data.

HOW TO RUN:
  cd ai-service
  pip install -r requirements.txt
  python train_models.py          # Train models first (one-time)
  python app.py                   # Start the Flask server

The service runs on http://localhost:5001
The Next.js app proxies requests to this service.
==========================================================================
"""

import os
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS

# Add current directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from models.fraud_detector import FraudDetector, generate_training_data as gen_fraud_data
from models.smart_verifier import SmartVerifier, generate_training_data as gen_verify_data

# ============================================================
# Initialize Flask App
# ============================================================
app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from Next.js

# Model directory
MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "saved_models")

# ============================================================
# Load or Train Models at Startup
# ============================================================
print("\n🔄 Loading AI models...")

fraud_detector = FraudDetector()
smart_verifier = SmartVerifier()

# Try to load pre-trained models; if not found, train on the fly
if not fraud_detector.load(MODELS_DIR):
    print("⚠️  Fraud Detector model not found. Training with synthetic data...")
    records, _ = gen_fraud_data()
    fraud_detector.train(records)
    fraud_detector.save(MODELS_DIR)

if not smart_verifier.load(MODELS_DIR):
    print("⚠️  Smart Verifier model not found. Training with synthetic data...")
    creds, labels = gen_verify_data()
    smart_verifier.train(creds, labels)
    smart_verifier.save(MODELS_DIR)

print("✅ All AI models loaded and ready!\n")


# ============================================================
# API Endpoints
# ============================================================

@app.route("/api/health", methods=["GET"])
def health_check():
    """
    Health check endpoint.
    Returns the status of both AI models.
    """
    return jsonify({
        "status": "healthy",
        "service": "UniChain AI Service",
        "models": {
            "fraud_detector": {
                "loaded": fraud_detector.is_trained,
                "type": "Isolation Forest (Anomaly Detection)",
            },
            "smart_verifier": {
                "loaded": smart_verifier.is_trained,
                "type": "Gradient Boosting + Rule-Based Verification",
            },
        },
    })


@app.route("/api/fraud-detection", methods=["POST"])
def detect_fraud():
    """
    Fraud Detection Endpoint.
    
    Expects JSON body:
    {
        "records": [
            {
                "id": "GRADE-1",
                "studentId": "STU001",
                "courseId": "CS401",
                "internal": 35,
                "external": 52,
                "total": 87,
                "grade": "A",
                "term": "Spring 2026"
            },
            ...
        ]
    }
    
    Returns:
    {
        "success": true,
        "total_records": 5,
        "anomalies_found": 2,
        "results": [
            {
                ...original record fields...,
                "anomaly_score": -0.234,
                "is_anomaly": true,
                "risk_level": "high",
                "reasons": ["Total doesn't match internal + external"]
            },
            ...
        ],
        "summary": {
            "total_analyzed": 5,
            "normal_count": 3,
            "anomaly_count": 2,
            "high_risk_count": 1,
            "medium_risk_count": 1,
            "low_risk_count": 3
        }
    }
    """
    try:
        data = request.get_json()
        
        if not data or "records" not in data:
            return jsonify({
                "success": False,
                "error": "Request body must contain 'records' array"
            }), 400
        
        records = data["records"]
        
        if not isinstance(records, list) or len(records) == 0:
            return jsonify({
                "success": False,
                "error": "'records' must be a non-empty array"
            }), 400
        
        # Run fraud detection
        results = fraud_detector.detect(records)
        
        # Build summary statistics
        anomaly_count = sum(1 for r in results if r["is_anomaly"])
        summary = {
            "total_analyzed": len(results),
            "normal_count": len(results) - anomaly_count,
            "anomaly_count": anomaly_count,
            "high_risk_count": sum(1 for r in results if r["risk_level"] == "high"),
            "medium_risk_count": sum(1 for r in results if r["risk_level"] == "medium"),
            "low_risk_count": sum(1 for r in results if r["risk_level"] == "low"),
        }
        
        return jsonify({
            "success": True,
            "total_records": len(records),
            "anomalies_found": anomaly_count,
            "results": results,
            "summary": summary,
        })
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Fraud detection failed: {str(e)}"
        }), 500


@app.route("/api/smart-verify", methods=["POST"])
def smart_verify():
    """
    Smart Verification Endpoint.
    
    Expects JSON body:
    {
        "credential": {
            "id": "CRED-1",
            "title": "Official Academic Transcript",
            "signatoryIds": ["ADM001", "FAC001"],
            "vScore": 96,
            "issueDate": "2026-03-28T11:30:00.000Z",
            "hashId": "0xabc123",
            "cid": "bafkreig5svbon62",
            "aggregateSignature": "bls_agg_xyz",
            "merkleRoot": "0xmerkle_abc",
            "status": "active",
            "expiryDate": null,
            "accessCount": 3
        }
    }
    
    Returns:
    {
        "success": true,
        "verification": {
            "ai_trust_score": 92.5,
            "ml_confidence": 0.95,
            "rule_score": 90.0,
            "risk_level": "low",
            "checks": { ... },
            "recommendation": "Credential appears authentic...",
            "details": [ ... ]
        }
    }
    """
    try:
        data = request.get_json()
        
        if not data or "credential" not in data:
            return jsonify({
                "success": False,
                "error": "Request body must contain 'credential' object"
            }), 400
        
        credential = data["credential"]
        
        # Run smart verification
        result = smart_verifier.verify(credential)
        
        return jsonify({
            "success": True,
            "verification": result,
        })
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Smart verification failed: {str(e)}"
        }), 500


@app.route("/api/smart-verify/batch", methods=["POST"])
def smart_verify_batch():
    """
    Batch Smart Verification — verify multiple credentials at once.
    
    Expects JSON body:
    {
        "credentials": [ ...array of credential objects... ]
    }
    """
    try:
        data = request.get_json()
        
        if not data or "credentials" not in data:
            return jsonify({
                "success": False,
                "error": "Request body must contain 'credentials' array"
            }), 400
        
        credentials = data["credentials"]
        results = smart_verifier.verify_batch(credentials)
        
        return jsonify({
            "success": True,
            "total": len(results),
            "verifications": results,
        })
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Batch verification failed: {str(e)}"
        }), 500


# ============================================================
# Start the Server
# ============================================================
if __name__ == "__main__":
    print("=" * 60)
    print("🚀 UniChain AI Service starting on http://localhost:5001")
    print("=" * 60)
    print("\nAvailable endpoints:")
    print("  GET  /api/health           → Health check")
    print("  POST /api/fraud-detection  → Detect anomalous grade records")
    print("  POST /api/smart-verify     → AI-enhanced credential verification")
    print("  POST /api/smart-verify/batch → Batch credential verification")
    print()
    
    app.run(
        host="0.0.0.0",
        port=5001,
        debug=True,
    )
