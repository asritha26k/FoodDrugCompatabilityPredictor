
"""
FastAPI Backend for Drug-Food Interaction Prediction System (Updated)

This backend integrates with:
1. NCI Chemical Identifier Resolver for drug canonical SMILES
2. RDKit for molecular descriptor calculation
3. USDA FoodData Central API for food nutrients
4. Pre-trained XGBoost models for interaction prediction

Updated to include additional nutrient features:
- Vitamin C (mg), Vitamin D (µg), Vitamin B12 (µg), Vitamin B6 (mg)
- Vitamin A (µg), Vitamin E (mg), Vitamin K (µg), Folate (µg)
- Saturated Fat (g), Monounsaturated Fat (g), Polyunsaturated Fat (g)
- Cholesterol (mg)

Required models: xgb_model.joblib, label_encoder.joblib, feature_order.joblib
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
load_dotenv()
import requests
import numpy as np
import pandas as pd
import joblib
import asyncio
import logging
from typing import Dict, List, Optional
import aiohttp
from urllib.parse import quote

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Drug-Food Interaction Prediction API",
    description="API for predicting drug-food interactions using molecular descriptors and comprehensive nutritional data",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Configuration
NCI_CONFIG = {
    "baseUrl": "https://cactus.nci.nih.gov/chemical/structure",
    "timeout": 5000
}

USDA_CONFIG = {
    "key": os.getenv("USDA_API_KEY"),
    "baseUrl": "https://api.nal.usda.gov/fdc/v1/",
    "searchEndpoint": "foods/search",
    "detailEndpoint": "food",
    "timeout": 8000
}

# Request/Response Models
class DrugRequest(BaseModel):
    drug_name: str

class FoodRequest(BaseModel):
    food_name: str

class InteractionRequest(BaseModel):
    drug_name: str
    food_name: str

class MolecularDescriptors(BaseModel):
    MolWt: float
    LogP: float
    HBA: int
    HBD: int
    TPSA: float
    RotBonds: int
    RingCount: int
    FractionCSP3: float
    BalabanJ: float
    BertzCT: float
    # Fingerprint features FP_0 to FP_2047 would be added here

class FoodNutrients(BaseModel):
    # Basic macronutrients
    Fat: float
    Carbohydrates: float
    Protein: float

    # Vitamins (with proper units)
    Vitamin_C_mg: float  # Vitamin C (mg)
    Vitamin_D_ug: float  # Vitamin D (µg)
    Vitamin_B12_ug: float  # Vitamin B12 (µg)
    Vitamin_B6_mg: float  # Vitamin B6 (mg)
    Vitamin_A_ug: float  # Vitamin A (µg)
    Vitamin_E_mg: float  # Vitamin E (mg)
    Vitamin_K_ug: float  # Vitamin K (µg)
    Folate_ug: float  # Folate (µg)

    # Minerals
    Calcium: float
    Iron: float
    Magnesium: float
    Potassium: float
    Sodium: float
    Zinc: float

    # Fat breakdown
    Saturated_Fat_g: float  # Saturated Fat (g)
    Monounsaturated_Fat_g: float  # Monounsaturated Fat (g)
    Polyunsaturated_Fat_g: float  # Polyunsaturated Fat (g)
    Cholesterol_mg: float  # Cholesterol (mg)

class InteractionResult(BaseModel):
    effect: str  # 'harmful', 'negative', 'no effect', 'positive', 'possible'
    confidence: float
    explanation: str
    drug_properties: MolecularDescriptors
    food_nutrients: FoodNutrients

# Global variables for loaded models
loaded_models = {}

def load_models():
    """Load the pre-trained models"""
    try:
        loaded_models['xgb_model'] = joblib.load('xgb_model.joblib')
        loaded_models['label_encoder'] = joblib.load('label_encoder.joblib')
        loaded_models['feature_order'] = joblib.load('feature_order.joblib')
        logger.info("Models loaded successfully")
        return True
    except Exception as e:
        logger.error(f"Error loading models: {e}")
        return False

# Load models on startup
@app.on_event("startup")
async def startup_event():
    """Initialize models on startup"""
    success = load_models()
    if not success:
        logger.warning("Failed to load models. Predictions will use fallback logic.")

async def get_canonical_smiles(drug_name: str) -> str:
    """Get canonical SMILES from NCI Chemical Identifier Resolver"""
    try:
        # URL encode the drug name
        encoded_name = quote(drug_name)
        url = f"{NCI_CONFIG['baseUrl']}/{encoded_name}/canonical_smiles"

        async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=5)) as session:
            async with session.get(url) as response:
                if response.status == 200:
                    smiles = await response.text()
                    return smiles.strip()
                else:
                    raise HTTPException(status_code=404, detail=f"Drug '{drug_name}' not found in NCI database")
    except asyncio.TimeoutError:
        raise HTTPException(status_code=408, detail="NCI API timeout")
    except Exception as e:
        logger.error(f"Error getting canonical SMILES for {drug_name}: {e}")
        raise HTTPException(status_code=500, detail=f"Error retrieving drug information: {str(e)}")

def calculate_molecular_descriptors(smiles: str) -> Dict:
    """Calculate molecular descriptors using RDKit"""
    try:
        from rdkit import Chem
        from rdkit.Chem import Descriptors, Crippen, Lipinski
        from rdkit.Chem.rdMolDescriptors import GetMorganFingerprint

        # Create molecule from SMILES
        mol = Chem.MolFromSmiles(smiles)
        if mol is None:
            raise ValueError("Invalid SMILES string")

        # Calculate basic descriptors
        descriptors = {
            'MolWt': Descriptors.ExactMolWt(mol),
            'LogP': Crippen.MolLogP(mol),
            'HBA': Lipinski.NumHAcceptors(mol),
            'HBD': Lipinski.NumHDonors(mol),
            'TPSA': Descriptors.TPSA(mol),
            'RotBonds': Lipinski.NumRotatableBonds(mol),
            'RingCount': Lipinski.RingCount(mol),
            'FractionCSP3': Lipinski.FractionCsp3(mol),
            'BalabanJ': Descriptors.BalabanJ(mol),
            'BertzCT': Descriptors.BertzCT(mol)
        }

        # Calculate Morgan fingerprint (FP_0 to FP_2047)
        fp = GetMorganFingerprint(mol, radius=2, nBits=2048)
        fp_array = np.zeros(2048)

        # Convert fingerprint to array
        for idx, val in fp.GetNonzeroElements().items():
            if idx < 2048:
                fp_array[idx] = val

        # Add fingerprint features
        for i in range(2048):
            descriptors[f'FP_{i}'] = fp_array[i]

        return descriptors

    except ImportError:
        # Fallback if RDKit is not available
        logger.warning("RDKit not available, using mock descriptors")
        return get_mock_molecular_descriptors()
    except Exception as e:
        logger.error(f"Error calculating molecular descriptors: {e}")
        return get_mock_molecular_descriptors()

def get_mock_molecular_descriptors() -> Dict:
    """Mock molecular descriptors for testing"""
    descriptors = {
        'MolWt': np.random.uniform(100, 500),
        'LogP': np.random.uniform(-2, 5),
        'HBA': np.random.randint(1, 10),
        'HBD': np.random.randint(0, 5),
        'TPSA': np.random.uniform(20, 140),
        'RotBonds': np.random.randint(0, 10),
        'RingCount': np.random.randint(0, 4),
        'FractionCSP3': np.random.uniform(0, 1),
        'BalabanJ': np.random.uniform(0.5, 2.5),
        'BertzCT': np.random.uniform(100, 1000)
    }

    # Add mock fingerprint features
    for i in range(2048):
        descriptors[f'FP_{i}'] = np.random.randint(0, 2)

    return descriptors

async def search_food_nutrients(food_name: str) -> Dict:
    """Search for food and get comprehensive nutritional information from USDA API"""
    try:
        # Search for food
        search_url = f"{USDA_CONFIG['baseUrl']}{USDA_CONFIG['searchEndpoint']}"
        search_params = {
            "api_key": USDA_CONFIG['key'],
            "query": food_name,
            "pageSize": 1
        }

        async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=8)) as session:
            # Search for food
            async with session.get(search_url, params=search_params) as response:
                if response.status != 200:
                    raise HTTPException(status_code=404, detail=f"Food '{food_name}' not found")

                search_data = await response.json()
                if not search_data.get('foods'):
                    raise HTTPException(status_code=404, detail=f"Food '{food_name}' not found")

                # Get first food item
                food_item = search_data['foods'][0]
                fdc_id = food_item['fdcId']

                # Get detailed nutrition information
                detail_url = f"{USDA_CONFIG['baseUrl']}{USDA_CONFIG['detailEndpoint']}/{fdc_id}"
                detail_params = {"api_key": USDA_CONFIG['key']}

                async with session.get(detail_url, params=detail_params) as detail_response:
                    if detail_response.status != 200:
                        raise HTTPException(status_code=404, detail="Food details not found")

                    detail_data = await detail_response.json()

                    # Extract nutrients
                    nutrients = extract_comprehensive_nutrients(detail_data.get('foodNutrients', []))
                    return nutrients

    except asyncio.TimeoutError:
        raise HTTPException(status_code=408, detail="USDA API timeout")
    except Exception as e:
        logger.error(f"Error getting food nutrients for {food_name}: {e}")
        # Return mock nutrients as fallback
        return get_mock_comprehensive_nutrients()

def extract_comprehensive_nutrients(food_nutrients: List) -> Dict:
    """Extract comprehensive nutrients from USDA response including all specified nutrients"""
    # Enhanced nutrient mapping with USDA nutrient IDs
    nutrient_map = {
        # Basic macronutrients
        'Fat': [1004],  # Total lipid (fat)
        'Carbohydrates': [1005],  # Carbohydrate, by difference
        'Protein': [1003],  # Protein

        # Vitamins with proper units
        'Vitamin_C_mg': [1162],  # Vitamin C, total ascorbic acid (mg)
        'Vitamin_D_ug': [1114],  # Vitamin D (D2 + D3) (µg)
        'Vitamin_B12_ug': [1178],  # Vitamin B-12 (µg)
        'Vitamin_B6_mg': [1175],  # Vitamin B-6 (mg)
        'Vitamin_A_ug': [1106, 1104],  # Vitamin A, RAE (µg) or IU converted
        'Vitamin_E_mg': [1109],  # Vitamin E (alpha-tocopherol) (mg)
        'Vitamin_K_ug': [1185],  # Vitamin K (phylloquinone) (µg)
        'Folate_ug': [1177, 1186],  # Folate, DFE or total (µg)

        # Minerals
        'Calcium': [1087],  # Calcium, Ca
        'Iron': [1089],  # Iron, Fe
        'Magnesium': [1090],  # Magnesium, Mg
        'Potassium': [1092],  # Potassium, K
        'Sodium': [1093],  # Sodium, Na
        'Zinc': [1095],  # Zinc, Zn

        # Fat breakdown
        'Saturated_Fat_g': [1258],  # Fatty acids, total saturated (g)
        'Monounsaturated_Fat_g': [1292],  # Fatty acids, total monounsaturated (g)
        'Polyunsaturated_Fat_g': [1293],  # Fatty acids, total polyunsaturated (g)
        'Cholesterol_mg': [1253],  # Cholesterol (mg)
    }

    nutrients = {}

    for nutrient_name, nutrient_ids in nutrient_map.items():
        value = 0.0
        for food_nutrient in food_nutrients:
            if food_nutrient.get('nutrient', {}).get('id') in nutrient_ids:
                amount = food_nutrient.get('amount', 0.0)
                # Handle potential None values
                if amount is not None:
                    value = amount
                break
        nutrients[nutrient_name] = value

    return nutrients

def get_mock_comprehensive_nutrients() -> Dict:
    """Mock comprehensive food nutrients for testing"""
    return {
        # Basic macronutrients
        'Fat': np.random.uniform(0, 15),
        'Carbohydrates': np.random.uniform(0, 40),
        'Protein': np.random.uniform(0, 20),

        # Vitamins with realistic ranges
        'Vitamin_C_mg': np.random.uniform(0, 200),  # 0-200 mg
        'Vitamin_D_ug': np.random.uniform(0, 25),   # 0-25 µg
        'Vitamin_B12_ug': np.random.uniform(0, 10), # 0-10 µg
        'Vitamin_B6_mg': np.random.uniform(0, 5),   # 0-5 mg
        'Vitamin_A_ug': np.random.uniform(0, 1500), # 0-1500 µg
        'Vitamin_E_mg': np.random.uniform(0, 30),   # 0-30 mg
        'Vitamin_K_ug': np.random.uniform(0, 500),  # 0-500 µg
        'Folate_ug': np.random.uniform(0, 300),     # 0-300 µg

        # Minerals
        'Calcium': np.random.uniform(0, 250),
        'Iron': np.random.uniform(0, 15),
        'Magnesium': np.random.uniform(0, 150),
        'Potassium': np.random.uniform(0, 800),
        'Sodium': np.random.uniform(0, 200),
        'Zinc': np.random.uniform(0, 8),

        # Fat breakdown
        'Saturated_Fat_g': np.random.uniform(0, 10),      # 0-10 g
        'Monounsaturated_Fat_g': np.random.uniform(0, 8), # 0-8 g
        'Polyunsaturated_Fat_g': np.random.uniform(0, 6), # 0-6 g
        'Cholesterol_mg': np.random.uniform(0, 300),      # 0-300 mg
    }

def predict_interaction(drug_descriptors: Dict, food_nutrients: Dict) -> Dict:
    """Predict drug-food interaction using loaded models"""
    try:
        # Combine features in the correct order
        if 'feature_order' in loaded_models:
            feature_order = loaded_models['feature_order']
        else:
            # Default feature order if not available
            feature_order = list(drug_descriptors.keys()) + list(food_nutrients.keys())

        # Create feature vector
        features = []
        for feature_name in feature_order:
            if feature_name in drug_descriptors:
                features.append(drug_descriptors[feature_name])
            elif feature_name in food_nutrients:
                features.append(food_nutrients[feature_name])
            else:
                features.append(0.0)  # Default value for missing features

        feature_array = np.array(features).reshape(1, -1)

        # Make prediction
        if 'xgb_model' in loaded_models and 'label_encoder' in loaded_models:
            model = loaded_models['xgb_model']
            label_encoder = loaded_models['label_encoder']

            # Get prediction probabilities
            probabilities = model.predict_proba(feature_array)[0]
            predicted_class_idx = np.argmax(probabilities)
            confidence = probabilities[predicted_class_idx]

            # Decode prediction
            predicted_effect = label_encoder.inverse_transform([predicted_class_idx])[0]

            return {
                'effect': predicted_effect,
                'confidence': float(confidence),
                'explanation': get_explanation(predicted_effect, confidence)
            }
        else:
            # Fallback prediction logic
            return get_fallback_prediction(drug_descriptors, food_nutrients)

    except Exception as e:
        logger.error(f"Error making prediction: {e}")
        return get_fallback_prediction(drug_descriptors, food_nutrients)

def get_fallback_prediction(drug_descriptors: Dict, food_nutrients: Dict) -> Dict:
    """Enhanced fallback prediction logic considering specific nutrients"""
    # Enhanced rule-based prediction considering important nutrients
    effect = 'no effect'
    confidence = 0.75

    # Check for potential vitamin K interactions (common with anticoagulants)
    if food_nutrients.get('Vitamin_K_ug', 0) > 100:  # High vitamin K
        effect = 'possible'
        confidence = 0.68

    # Check for high calcium (may affect absorption)
    if food_nutrients.get('Calcium', 0) > 150:
        effect = 'possible' if effect == 'no effect' else effect
        confidence = max(0.65, confidence)

    # Random variation for demonstration
    effects = ['no effect', 'possible', 'positive', 'harmful']
    if np.random.random() > 0.7:  # 30% chance of different prediction
        effect = np.random.choice(effects)
        confidence = np.random.uniform(0.6, 0.92)

    return {
        'effect': effect,
        'confidence': confidence,
        'explanation': get_explanation(effect, confidence)
    }

def get_explanation(effect: str, confidence: float) -> str:
    """Generate explanation for the prediction"""
    explanations = {
        'harmful': f"Significant interaction detected (confidence: {confidence:.2f}). This food may interfere with drug efficacy or cause adverse effects. Consult your healthcare provider immediately.",
        'negative': f"Minor negative interaction possible (confidence: {confidence:.2f}). The food may slightly reduce drug effectiveness or absorption.",
        'no effect': f"No significant interaction expected (confidence: {confidence:.2f}). The food is unlikely to affect drug absorption or metabolism significantly.",
        'positive': f"Beneficial interaction detected (confidence: {confidence:.2f}). This food may enhance drug absorption, stability, or therapeutic effects.",
        'possible': f"Potential interaction identified (confidence: {confidence:.2f}). Monitor for changes in drug effectiveness or side effects."
    }

    return explanations.get(effect, f"Interaction analysis completed with {confidence:.2f} confidence.")

# API Endpoints
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Drug-Food Interaction Prediction API", 
        "status": "active",
        "version": "2.0.0",
        "features": "Enhanced with comprehensive nutritional analysis"
    }

@app.post("/api/drug/canonical")
async def get_drug_canonical(request: DrugRequest):
    """Get canonical SMILES for a drug"""
    smiles = await get_canonical_smiles(request.drug_name)
    return {"drug_name": request.drug_name, "canonical_smiles": smiles}

@app.post("/api/drug/descriptors")
async def get_drug_descriptors(request: DrugRequest):
    """Get molecular descriptors for a drug"""
    # First get canonical SMILES
    smiles = await get_canonical_smiles(request.drug_name)

    # Calculate descriptors
    descriptors = calculate_molecular_descriptors(smiles)

    return {
        "drug_name": request.drug_name,
        "canonical_smiles": smiles,
        "descriptors": descriptors
    }

@app.post("/api/food/nutrients")
async def get_food_nutrients_endpoint(request: FoodRequest):
    """Get comprehensive nutritional information for a food"""
    nutrients = await search_food_nutrients(request.food_name)

    return {
        "food_name": request.food_name,
        "nutrients": nutrients
    }

@app.post("/api/predict")
async def predict_drug_food_interaction(request: InteractionRequest):
    """Predict drug-food interaction using comprehensive nutritional data"""
    try:
        # Get drug information
        smiles = await get_canonical_smiles(request.drug_name)
        drug_descriptors = calculate_molecular_descriptors(smiles)

        # Get comprehensive food nutrients
        food_nutrients = await search_food_nutrients(request.food_name)

        # Make prediction
        prediction = predict_interaction(drug_descriptors, food_nutrients)

        # Prepare response with all nutrient data
        result = InteractionResult(
            effect=prediction['effect'],
            confidence=prediction['confidence'],
            explanation=prediction['explanation'],
            drug_properties=MolecularDescriptors(
                MolWt=drug_descriptors['MolWt'],
                LogP=drug_descriptors['LogP'],
                HBA=drug_descriptors['HBA'],
                HBD=drug_descriptors['HBD'],
                TPSA=drug_descriptors['TPSA'],
                RotBonds=drug_descriptors['RotBonds'],
                RingCount=drug_descriptors['RingCount'],
                FractionCSP3=drug_descriptors['FractionCSP3'],
                BalabanJ=drug_descriptors['BalabanJ'],
                BertzCT=drug_descriptors['BertzCT']
            ),
            food_nutrients=FoodNutrients(**food_nutrients)
        )

        return result

    except Exception as e:
        logger.error(f"Error in prediction endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    models_loaded = all(key in loaded_models for key in ['xgb_model', 'label_encoder'])
    return {
        "status": "healthy",
        "models_loaded": models_loaded,
        "version": "2.0.0",
        "features": "Comprehensive nutritional analysis with vitamins, minerals, and fat breakdown"
    }

@app.get("/api/nutrients/list")
async def list_supported_nutrients():
    """List all supported nutrient features"""
    nutrients = {
        "macronutrients": ["Fat", "Carbohydrates", "Protein"],
        "vitamins": [
            "Vitamin_C_mg", "Vitamin_D_ug", "Vitamin_B12_ug", "Vitamin_B6_mg",
            "Vitamin_A_ug", "Vitamin_E_mg", "Vitamin_K_ug", "Folate_ug"
        ],
        "minerals": ["Calcium", "Iron", "Magnesium", "Potassium", "Sodium", "Zinc"],
        "fat_breakdown": [
            "Saturated_Fat_g", "Monounsaturated_Fat_g", 
            "Polyunsaturated_Fat_g", "Cholesterol_mg"
        ]
    }
    return {
        "total_nutrients": sum(len(v) for v in nutrients.values()),
        "categories": nutrients
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
