# Drug-Food Interaction Prediction API Documentation

## Overview
This API provides endpoints for predicting drug-food interactions using machine learning models trained on molecular descriptors and nutritional data.

## Base URL
```
http://localhost:8000
```

## Authentication
No authentication required for this demo API.

## Endpoints

### 1. Health Check
**GET** `/api/health`

Returns the health status of the API and whether models are loaded.

**Response:**
```json
{
  "status": "healthy",
  "models_loaded": true,
  "version": "1.0.0"
}
```

### 2. Get Drug Canonical SMILES
**POST** `/api/drug/canonical`

Get canonical SMILES representation for a drug from NCI Chemical Identifier Resolver.

**Request Body:**
```json
{
  "drug_name": "aspirin"
}
```

**Response:**
```json
{
  "drug_name": "aspirin",
  "canonical_smiles": "CC(=O)OC1=CC=CC=C1C(=O)O"
}
```

### 3. Get Drug Molecular Descriptors
**POST** `/api/drug/descriptors`

Calculate molecular descriptors for a drug using RDKit.

**Request Body:**
```json
{
  "drug_name": "aspirin"
}
```

**Response:**
```json
{
  "drug_name": "aspirin",
  "canonical_smiles": "CC(=O)OC1=CC=CC=C1C(=O)O",
  "descriptors": {
    "MolWt": 180.16,
    "LogP": 1.19,
    "HBA": 4,
    "HBD": 1,
    "TPSA": 63.6,
    "RotBonds": 3,
    "RingCount": 1,
    "FractionCSP3": 0.1,
    "BalabanJ": 1.23,
    "BertzCT": 456.78,
    "FP_0": 0,
    "FP_1": 1,
    ...
  }
}
```

### 4. Get Food Nutrients
**POST** `/api/food/nutrients`

Get nutritional information for a food from USDA FoodData Central API.

**Request Body:**
```json
{
  "food_name": "apple"
}
```

**Response:**
```json
{
  "food_name": "apple",
  "nutrients": {
    "Fat": 0.2,
    "Carbohydrates": 14.0,
    "Protein": 0.3,
    "Vitamin_C": 4.6,
    "Vitamin_D": 0.0,
    "Vitamin_B12": 0.0,
    "Calcium": 6.0,
    "Iron": 0.12,
    "Magnesium": 5.0,
    "Potassium": 107.0,
    "Sodium": 1.0,
    "Zinc": 0.04
  }
}
```

### 5. Predict Drug-Food Interaction
**POST** `/api/predict`

Predict the interaction between a drug and food using trained XGBoost models.

**Request Body:**
```json
{
  "drug_name": "warfarin",
  "food_name": "spinach"
}
```

**Response:**
```json
{
  "effect": "harmful",
  "confidence": 0.94,
  "explanation": "High vitamin K content in spinach can counteract warfarin's anticoagulant effects. Monitor INR levels closely and consider dose adjustment.",
  "drug_properties": {
    "MolWt": 308.33,
    "LogP": 2.7,
    "HBA": 5,
    "HBD": 1,
    "TPSA": 63.6,
    "RotBonds": 4,
    "RingCount": 3,
    "FractionCSP3": 0.15,
    "BalabanJ": 1.45,
    "BertzCT": 789.12
  },
  "food_nutrients": {
    "Fat": 0.4,
    "Carbohydrates": 3.6,
    "Protein": 2.9,
    "Vitamin_C": 28.1,
    "Vitamin_D": 0.0,
    "Vitamin_B12": 0.0,
    "Calcium": 99.0,
    "Iron": 2.7,
    "Magnesium": 79.0,
    "Potassium": 558.0,
    "Sodium": 79.0,
    "Zinc": 0.53
  }
}
```

## Effect Classifications
- **harmful**: Significant negative interaction that may cause adverse effects
- **negative**: Minor negative interaction that may reduce drug effectiveness  
- **no effect**: No significant interaction expected
- **positive**: Beneficial interaction that may enhance drug effects
- **possible**: Potential interaction requiring monitoring

## Error Responses
All endpoints may return the following error responses:

### 404 Not Found
```json
{
  "detail": "Drug 'unknown_drug' not found in NCI database"
}
```

### 408 Request Timeout
```json
{
  "detail": "NCI API timeout"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Error retrieving drug information: <error_message>"
}
```

## Rate Limits
- NCI API: No specific limits documented
- USDA API: 1,000 requests per hour per IP address

## Data Sources
1. **NCI Chemical Identifier Resolver**: https://cactus.nci.nih.gov/chemical/structure
2. **USDA FoodData Central**: https://fdc.nal.usda.gov/
3. **RDKit**: Molecular descriptor calculations
4. **XGBoost**: Machine learning predictions

## Model Information
The prediction models were trained on a dataset of 23,950 drug-food interaction pairs with:
- **Features**: 2,082 total (molecular descriptors + nutritional data)
- **Classes**: 5 interaction types (harmful, negative, no effect, positive, possible)
- **Accuracy**: 88.3% on test set
- **Algorithm**: XGBoost Classifier

## Usage Examples

### Python Example
```python
import requests

# Predict interaction
response = requests.post(
    "http://localhost:8000/api/predict",
    json={"drug_name": "aspirin", "food_name": "apple"}
)
result = response.json()
print(f"Effect: {result['effect']}")
print(f"Confidence: {result['confidence']:.2f}")
```

### JavaScript Example
```javascript
// Predict interaction
fetch('http://localhost:8000/api/predict', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        drug_name: 'aspirin',
        food_name: 'apple'
    })
})
.then(response => response.json())
.then(data => {
    console.log(`Effect: ${data.effect}`);
    console.log(`Confidence: ${data.confidence.toFixed(2)}`);
});
```

## Support
For issues or questions, please refer to the API documentation at `/docs` when the server is running.
