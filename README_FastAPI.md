from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
import requests
import pandas as pd
import pickle
import joblib
import scipy.sparse as sp
import logging
from datetime import datetime
from pydantic import BaseModel
from typing import Dict, Any
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Food-Drug Interaction Predictor API",
    description="Production API for predicting food-drug interactions using trained Random Forest model",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for models
rf_model = None
cv = None

# API Configuration
USDA_API_KEY = "I6Pa9XmV7bzzK2hPZ3dZeGwl1dCVWjGfje3szmyn"

# Pydantic models for request/response
class PredictionRequest(BaseModel):
    drug_name: str
    food_name: str

class PredictionResponse(BaseModel):
    success: bool
    prediction: Dict[str, Any]

class ErrorResponse(BaseModel):
    error: str

class HealthResponse(BaseModel):
    status: str
    models_loaded: bool
    timestamp: str

def load_models():
    """Load the trained Random Forest model and SMILES vectorizer"""
    global rf_model, cv
    try:
        # Load Random Forest model
        with open('models/random_forest_model.pkl', 'rb') as f:
            rf_model = pickle.load(f)
        logger.info("✅ Random Forest model loaded successfully")

        # Load SMILES vectorizer
        cv = joblib.load('models/smiles_vectorizer.pkl')
        logger.info("✅ SMILES vectorizer loaded successfully")

        return True
    except Exception as e:
        logger.error(f"❌ Error loading models: {str(e)}")
        return False

def get_smiles(drug_name: str) -> str:
    """
    Exact replica of your get_smiles function
    Fetches SMILES notation for a drug from NCI Chemical Identifier Resolver
    """
    url = f"https://cactus.nci.nih.gov/chemical/structure/{drug_name}/smiles"
    try:
        resp = requests.get(url, timeout=10)
        if resp.status_code == 200:
            smiles = resp.text.strip()
            logger.info(f"✅ SMILES fetched for {drug_name}: {smiles}")
            return smiles
        else:
            raise ValueError(f"Cannot fetch SMILES for {drug_name} (HTTP {resp.status_code})")
    except requests.exceptions.RequestException as e:
        raise ValueError(f"Network error fetching SMILES for {drug_name}: {str(e)}")

def get_food_nutrients(food_name: str) -> Dict[str, float]:
    """
    Exact replica of your get_food_nutrients function
    Fetches nutritional data for a food from USDA FoodData Central API
    """
    url = f"https://api.nal.usda.gov/fdc/v1/foods/search?api_key={USDA_API_KEY}"
    payload = {"query": food_name, "pageSize": 1}

    try:
        resp = requests.post(url, json=payload, timeout=15)
        if resp.status_code == 200:
            data = resp.json()
            if "foods" in data and len(data["foods"]) > 0:
                food = data["foods"][0]

                # Initialize nutrients dictionary (exact from your code)
                nutrients = {
                    "Fat": 0,
                    "Carbohydrates": 0,
                    "Protein": 0,
                    "Vitamin_C": 0,
                    "Vitamin_D": 0,
                    "Vitamin_B12": 0,
                    "Calcium": 0,
                    "Iron": 0,
                    "Magnesium": 0,
                    "Potassium": 0
                }

                # Extract nutrients (exact logic from your code)
                for n in food.get("foodNutrients", []):
                    name = n.get("nutrientName", "")
                    value = n.get("value", 0)
                    if "Fat" in name: 
                        nutrients["Fat"] = value
                    elif "Carbohydrate" in name: 
                        nutrients["Carbohydrates"] = value
                    elif "Protein" in name: 
                        nutrients["Protein"] = value
                    elif "Vitamin C" in name: 
                        nutrients["Vitamin_C"] = value
                    elif "Vitamin D" in name: 
                        nutrients["Vitamin_D"] = value
                    elif "Vitamin B-12" in name: 
                        nutrients["Vitamin_B12"] = value
                    elif "Calcium" in name: 
                        nutrients["Calcium"] = value
                    elif "Iron" in name: 
                        nutrients["Iron"] = value
                    elif "Magnesium" in name: 
                        nutrients["Magnesium"] = value
                    elif "Potassium" in name: 
                        nutrients["Potassium"] = value

                logger.info(f"✅ Nutrients fetched for {food_name}: {nutrients}")
                return nutrients
            else:
                raise ValueError(f"No nutritional data found for {food_name}")
        else:
            raise ValueError(f"USDA API error (HTTP {resp.status_code})")
    except requests.exceptions.RequestException as e:
        raise ValueError(f"Network error fetching nutrients for {food_name}: {str(e)}")

def predict_effect(drug_name: str, food_name: str) -> Dict[str, Any]:
    """
    Exact replica of your predict_effect function
    Makes prediction using loaded Random Forest model
    """
    try:
        # Fetch SMILES and nutrients
        smiles = get_smiles(drug_name)
        nutrients = get_food_nutrients(food_name)

        # SMILES features (using your trained vectorizer)
        smiles_features = cv.transform([smiles])

        # Numeric features (converting to DataFrame as in your code)
        numeric_features = pd.DataFrame([nutrients])

        # Combine features (exact as your code)
        X_new = sp.hstack([smiles_features, numeric_features])

        # Predict using your trained Random Forest
        pred_label_index = rf_model.predict(X_new)[0]

        # Get prediction probability for confidence
        pred_proba = rf_model.predict_proba(X_new)[0]
        confidence = max(pred_proba)

        # Map back to effect string (exact mapping from your code)
        mapping = {0:'no effect', 1:'positive', 2:'possible', 3:'negative', 4:'harmful'}
        effect = mapping.get(pred_label_index, "Unknown")

        result = {
            'effect': effect,
            'prediction_index': int(pred_label_index),
            'confidence': float(confidence),
            'smiles': smiles,
            'nutrients': nutrients,
            'drug_name': drug_name,
            'food_name': food_name,
            'timestamp': datetime.now().isoformat()
        }

        logger.info(f"✅ Prediction complete: {drug_name} + {food_name} = {effect} (confidence: {confidence:.3f})")
        return result

    except Exception as e:
        error_msg = str(e)
        logger.error(f"❌ Prediction error for {drug_name} + {food_name}: {error_msg}")
        raise ValueError(error_msg)

# API Routes
@app.get("/", response_class=HTMLResponse)
async def read_index():
    """Serve the main application page"""
    with open("static/index.html") as f:
        return HTMLResponse(content=f.read(), status_code=200)

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    model_status = rf_model is not None and cv is not None
    return HealthResponse(
        status='healthy' if model_status else 'unhealthy',
        models_loaded=model_status,
        timestamp=datetime.now().isoformat()
    )

@app.post("/predict", response_model=PredictionResponse)
async def predict_interaction(request: PredictionRequest):
    """
    Main prediction endpoint
    Expects JSON with drug_name and food_name
    """
    try:
        # Check if models are loaded
        if rf_model is None or cv is None:
            raise HTTPException(status_code=500, detail="Models not loaded properly")

        drug_name = request.drug_name.strip()
        food_name = request.food_name.strip()

        if not drug_name or not food_name:
            raise HTTPException(status_code=400, detail="Both drug_name and food_name are required")

        # Make prediction using your exact function
        result = predict_effect(drug_name, food_name)

        return PredictionResponse(success=True, prediction=result)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in prediction: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/get_smiles/{drug_name}")
async def get_drug_smiles(drug_name: str):
    """Endpoint to get SMILES for a drug"""
    try:
        smiles = get_smiles(drug_name)
        return {
            'success': True,
            'drug_name': drug_name,
            'smiles': smiles
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/get_nutrients/{food_name}")
async def get_food_nutrition(food_name: str):
    """Endpoint to get nutrients for a food"""
    try:
        nutrients = get_food_nutrients(food_name)
        return {
            'success': True,
            'food_name': food_name,
            'nutrients': nutrients
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Startup event
@app.on_event("startup")
async def startup_event():
    """Load models on startup"""
    if not load_models():
        logger.error("❌ Failed to load models on startup")

if __name__ == "__main__":
    # Load models
    if load_models():
        logger.info("🚀 Starting FastAPI server with loaded models...")
        uvicorn.run(app, host="0.0.0.0", port=8000)
    else:
        logger.error("❌ Failed to load models. Please check model files.")
        print("Error: Could not load model files. Please ensure:")
        print("1. random_forest_model.pkl exists in ./models/ directory")
        print("2. smiles_vectorizer.pkl exists in ./models/ directory")
