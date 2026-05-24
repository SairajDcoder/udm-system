"""
==========================================================================
MODEL TRAINING SCRIPT
==========================================================================
Run this script once to train and save both AI models:
  1. Fraud Detector (Isolation Forest)
  2. Smart Verifier (Gradient Boosting)

Usage:
  cd ai-service
  python train_models.py

The trained models will be saved in the 'saved_models/' directory
as .joblib files, which the Flask app loads at startup.
==========================================================================
"""

import os
import sys

# Add parent directory to path so we can import models
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from models.fraud_detector import FraudDetector, generate_training_data as gen_fraud_data
from models.smart_verifier import SmartVerifier, generate_training_data as gen_verify_data


def main():
    save_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "saved_models")
    
    print("=" * 60)
    print("TRAINING AI MODELS FOR UNICHAIN UDM SYSTEM")
    print("=" * 60)
    
    # ---- Train Fraud Detector ----
    print("\n📊 Step 1: Training Fraud Detector...")
    print("-" * 40)
    
    fraud_records, fraud_labels = gen_fraud_data(n_normal=200, n_anomalous=20)
    
    detector = FraudDetector()
    detector.train(fraud_records)
    detector.save(save_dir)
    
    # Quick validation
    results = detector.detect(fraud_records[:5])
    print(f"\n   Validation: {sum(1 for r in results if not r['is_anomaly'])}/5 normal records correctly classified")
    
    # ---- Train Smart Verifier ----
    print("\n🛡️  Step 2: Training Smart Verifier...")
    print("-" * 40)
    
    verify_creds, verify_labels = gen_verify_data(n_legitimate=300, n_fraudulent=50)
    
    verifier = SmartVerifier()
    verifier.train(verify_creds, verify_labels)
    verifier.save(save_dir)
    
    # Quick validation
    test_result = verifier.verify(verify_creds[0])
    print(f"\n   Validation: First credential trust score = {test_result['ai_trust_score']}")
    
    # ---- Summary ----
    print(f"\n{'=' * 60}")
    print("✅ ALL MODELS TRAINED AND SAVED SUCCESSFULLY!")
    print(f"{'=' * 60}")
    print(f"\nSaved models in: {save_dir}/")
    
    for filename in os.listdir(save_dir):
        filepath = os.path.join(save_dir, filename)
        size_kb = os.path.getsize(filepath) / 1024
        print(f"  📁 {filename} ({size_kb:.1f} KB)")
    
    print(f"\n🚀 You can now start the Flask AI service:")
    print(f"   cd ai-service")
    print(f"   python app.py")


if __name__ == "__main__":
    main()
