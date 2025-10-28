#!/bin/bash
# Setup script for Drug-Food Interaction Prediction System

echo "Setting up Drug-Food Interaction Prediction System..."

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

echo "Setup complete!"
echo ""
echo "To run the backend:"
echo "1. Activate virtual environment: source venv/bin/activate"
echo "2. Run server: uvicorn main:app --reload"
echo "3. Open browser to http://localhost:8000/docs for API documentation"
echo ""
echo "Note: You need the trained model files:"
echo "- xgb_model.joblib"
echo "- label_encoder.joblib" 
echo "- feature_order.joblib"
