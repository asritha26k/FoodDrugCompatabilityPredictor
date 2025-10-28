// Drug-Food Interaction Prediction App JavaScript - Enhanced Version

// Enhanced sample data from the backend (simulating the real APIs and model)
const ENHANCED_SAMPLE_DATA = {
  sampleDrugs: {
    aspirin: {
      canonicalSmiles: "CC(=O)OC1=CC=CC=C1C(=O)O",
      molecularWeight: 180.16,
      logP: 1.19,
      hba: 4,
      hbd: 1,
      tpsa: 63.6,
      rotBonds: 3,
      ringCount: 1,
      fractionCSP3: 0.1,
      balabanJ: 1.23,
      bertzCT: 456.78
    },
    warfarin: {
      canonicalSmiles: "CC(=O)CC(C1=CC=CC=C1)C2=C(C3=CC=CC=C3OC2=O)O",
      molecularWeight: 308.33,
      logP: 2.7,
      hba: 5,
      hbd: 1,
      tpsa: 63.6,
      rotBonds: 4,
      ringCount: 3,
      fractionCSP3: 0.15,
      balabanJ: 1.45,
      bertzCT: 789.12
    },
    metformin: {
      canonicalSmiles: "CN(C)C(=N)NC(=N)N",
      molecularWeight: 129.16,
      logP: -2.64,
      hba: 5,
      hbd: 4,
      tpsa: 91.2,
      rotBonds: 2,
      ringCount: 0,
      fractionCSP3: 0.5,
      balabanJ: 0.89,
      bertzCT: 234.56
    }
  },
  sampleFoods: {
    apple: {
      Fat: 0.2,
      Carbohydrates: 14.0,
      Protein: 0.3,
      Vitamin_C_mg: 4.6,
      Vitamin_D_ug: 0.0,
      Vitamin_B12_ug: 0.0,
      Vitamin_B6_mg: 0.041,
      Vitamin_A_ug: 3.0,
      Vitamin_E_mg: 0.18,
      Vitamin_K_ug: 2.2,
      Folate_ug: 3.0,
      Calcium: 6.0,
      Iron: 0.12,
      Magnesium: 5.0,
      Potassium: 107.0,
      Sodium: 1.0,
      Zinc: 0.04,
      Saturated_Fat_g: 0.067,
      Monounsaturated_Fat_g: 0.007,
      Polyunsaturated_Fat_g: 0.051,
      Cholesterol_mg: 0.0
    },
    spinach: {
      Fat: 0.4,
      Carbohydrates: 3.6,
      Protein: 2.9,
      Vitamin_C_mg: 28.1,
      Vitamin_D_ug: 0.0,
      Vitamin_B12_ug: 0.0,
      Vitamin_B6_mg: 0.195,
      Vitamin_A_ug: 469.0,
      Vitamin_E_mg: 2.03,
      Vitamin_K_ug: 482.9,
      Folate_ug: 194.0,
      Calcium: 99.0,
      Iron: 2.7,
      Magnesium: 79.0,
      Potassium: 558.0,
      Sodium: 79.0,
      Zinc: 0.53,
      Saturated_Fat_g: 0.063,
      Monounsaturated_Fat_g: 0.010,
      Polyunsaturated_Fat_g: 0.165,
      Cholesterol_mg: 0.0
    },
    milk: {
      Fat: 3.25,
      Carbohydrates: 4.8,
      Protein: 3.4,
      Vitamin_C_mg: 0.0,
      Vitamin_D_ug: 1.3,
      Vitamin_B12_ug: 0.45,
      Vitamin_B6_mg: 0.036,
      Vitamin_A_ug: 46.0,
      Vitamin_E_mg: 0.07,
      Vitamin_K_ug: 0.3,
      Folate_ug: 5.0,
      Calcium: 113.0,
      Iron: 0.03,
      Magnesium: 10.0,
      Potassium: 150.0,
      Sodium: 43.0,
      Zinc: 0.37,
      Saturated_Fat_g: 1.865,
      Monounsaturated_Fat_g: 0.812,
      Polyunsaturated_Fat_g: 0.195,
      Cholesterol_mg: 10.0
    },
    broccoli: {
      Fat: 0.37,
      Carbohydrates: 6.64,
      Protein: 2.82,
      Vitamin_C_mg: 89.2,
      Vitamin_D_ug: 0.0,
      Vitamin_B12_ug: 0.0,
      Vitamin_B6_mg: 0.175,
      Vitamin_A_ug: 31.0,
      Vitamin_E_mg: 0.78,
      Vitamin_K_ug: 101.6,
      Folate_ug: 63.0,
      Calcium: 47.0,
      Iron: 0.73,
      Magnesium: 21.0,
      Potassium: 316.0,
      Sodium: 33.0,
      Zinc: 0.41,
      Saturated_Fat_g: 0.063,
      Monounsaturated_Fat_g: 0.011,
      Polyunsaturated_Fat_g: 0.038,
      Cholesterol_mg: 0.0
    }
  },
  interactionResults: {
    aspirin_apple: {
      effect: "No Effect",
      confidence: 0.87,
      explanation: "No significant interaction expected between aspirin and apple. Apple's low vitamin K content and minimal drug-affecting compounds make this a safe combination."
    },
    warfarin_spinach: {
      effect: "Harmful",
      confidence: 0.94,
      explanation: "High vitamin K content in spinach (482.9 µg per 100g) can significantly counteract warfarin's anticoagulant effects. Monitor INR levels closely and consider dose adjustment or consistent spinach intake."
    },
    metformin_milk: {
      effect: "Possible",
      confidence: 0.72,
      explanation: "Calcium in milk (113mg per 100g) may slightly reduce metformin absorption. Consider taking metformin 2 hours before or after consuming dairy products for optimal effectiveness."
    },
    warfarin_broccoli: {
      effect: "Possible",
      confidence: 0.85,
      explanation: "Moderate vitamin K content in broccoli (101.6 µg per 100g) may affect warfarin efficacy. Maintain consistent broccoli intake and monitor INR levels."
    }
  },
  nutrientRDV: {
    Vitamin_C_mg: 90,
    Vitamin_D_ug: 20,
    Vitamin_B12_ug: 2.4,
    Vitamin_B6_mg: 1.3,
    Vitamin_A_ug: 900,
    Vitamin_E_mg: 15,
    Vitamin_K_ug: 120,
    Folate_ug: 400,
    Calcium: 1000,
    Iron: 18,
    Magnesium: 400,
    Potassium: 3500,
    Sodium: 2300,
    Zinc: 11,
    Saturated_Fat_g: 22,
    Cholesterol_mg: 300
  },
  interactionNutrients: {
    warfarin: ['Vitamin_K_ug'],
    aspirin: [],
    metformin: ['Calcium'],
    'blood thinners': ['Vitamin_K_ug'],
    'calcium channel blockers': ['Calcium'],
    'iron supplements': ['Calcium', 'Zinc']
  }
};

// Application state
let currentAnalysis = null;
let detailedView = false;
let tooltip = null;

// DOM elements
const drugNameInput = document.getElementById('drugName');
const foodNameInput = document.getElementById('foodName');
const analyzeBtn = document.getElementById('analyzeBtn');
const clearBtn = document.getElementById('clearBtn');
const resultsSection = document.getElementById('resultsSection');
const toggleDetailedBtn = document.getElementById('toggleDetailedNutrients');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  setupEventListeners();
  setupCollapsibleSections();
  setupTooltips();
  setupDetailedView();
});

// Event listeners setup
function setupEventListeners() {
  analyzeBtn.addEventListener('click', handleAnalyze);
  clearBtn.addEventListener('click', handleClear);
  
  // Enable analyze button when both fields have content
  drugNameInput.addEventListener('input', validateInputs);
  foodNameInput.addEventListener('input', validateInputs);
  
  // Enter key handling
  drugNameInput.addEventListener('keypress', handleEnterKey);
  foodNameInput.addEventListener('keypress', handleEnterKey);
}

// Setup collapsible sections
function setupCollapsibleSections() {
  const collapsibleHeaders = document.querySelectorAll('.collapsible-header');
  collapsibleHeaders.forEach(header => {
    header.addEventListener('click', function() {
      const targetId = this.getAttribute('data-target');
      const content = document.getElementById(targetId);
      const isActive = this.classList.contains('active');
      
      if (isActive) {
        this.classList.remove('active');
        content.classList.remove('active');
      } else {
        this.classList.add('active');
        content.classList.add('active');
      }
    });
  });
}

// Setup tooltips
function setupTooltips() {
  tooltip = document.getElementById('tooltip');
  
  // Handle mouseenter/mouseleave for tooltip items
  document.addEventListener('mouseenter', function(e) {
    const item = e.target.closest('[data-tooltip]');
    if (item && tooltip) {
      showTooltip(e, item.getAttribute('data-tooltip'));
    }
  }, true);
  
  document.addEventListener('mouseleave', function(e) {
    const item = e.target.closest('[data-tooltip]');
    if (item && tooltip) {
      hideTooltip();
    }
  }, true);
  
  document.addEventListener('mousemove', function(e) {
    if (tooltip && tooltip.classList.contains('visible')) {
      updateTooltipPosition(e);
    }
  });
}

// Setup detailed view toggle
function setupDetailedView() {
  if (toggleDetailedBtn) {
    toggleDetailedBtn.addEventListener('click', function() {
      detailedView = !detailedView;
      toggleDetailedFatBreakdown();
      updateToggleButton();
    });
  }
}

// Toggle detailed fat breakdown visibility
function toggleDetailedFatBreakdown() {
  const detailedSections = document.querySelectorAll('.detailed-only');
  
  detailedSections.forEach(section => {
    if (detailedView) {
      section.classList.remove('hidden');
    } else {
      section.classList.add('hidden');
    }
  });
}

// Update toggle button text and icon
function updateToggleButton() {
  if (toggleDetailedBtn) {
    const icon = toggleDetailedBtn.querySelector('i');
    
    if (detailedView) {
      icon.className = 'fas fa-eye-slash';
      toggleDetailedBtn.innerHTML = '<i class="fas fa-eye-slash"></i> Hide Detailed View';
    } else {
      icon.className = 'fas fa-eye';
      toggleDetailedBtn.innerHTML = '<i class="fas fa-eye"></i> Show Detailed View';
    }
  }
}

// Show tooltip
function showTooltip(event, content) {
  if (!tooltip) return;
  
  tooltip.querySelector('.tooltip-content').textContent = content;
  tooltip.classList.remove('hidden');
  
  // Position tooltip first, then make it visible
  updateTooltipPosition(event);
  
  requestAnimationFrame(() => {
    tooltip.classList.add('visible');
  });
}

// Hide tooltip
function hideTooltip() {
  if (!tooltip) return;
  
  tooltip.classList.remove('visible');
  setTimeout(() => {
    tooltip.classList.add('hidden');
  }, 150);
}

// Update tooltip position
function updateTooltipPosition(event) {
  if (!tooltip) return;
  
  const tooltipRect = tooltip.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  let x = event.clientX;
  let y = event.clientY - tooltipRect.height - 10;
  
  // Ensure tooltip stays within viewport
  if (x + tooltipRect.width > viewportWidth) {
    x = viewportWidth - tooltipRect.width - 10;
  }
  if (x < 10) {
    x = 10;
  }
  if (y < 10) {
    y = event.clientY + 10;
  }
  
  tooltip.style.left = x + 'px';
  tooltip.style.top = y + 'px';
}

// Validate inputs and enable/disable analyze button
function validateInputs() {
  const drugName = drugNameInput.value.trim();
  const foodName = foodNameInput.value.trim();
  const isValid = drugName.length > 0 && foodName.length > 0;
  
  analyzeBtn.disabled = !isValid;
  
  // Remove any existing error classes
  drugNameInput.classList.remove('error');
  foodNameInput.classList.remove('error');
}

// Handle Enter key press
function handleEnterKey(event) {
  if (event.key === 'Enter' && !analyzeBtn.disabled) {
    handleAnalyze();
  }
}

// Handle analysis button click
async function handleAnalyze() {
  const drugName = drugNameInput.value.trim().toLowerCase();
  const foodName = foodNameInput.value.trim().toLowerCase();
  
  if (!drugName || !foodName) {
    showError('Please enter both drug name and food name.');
    return;
  }
  
  // Clear any previous errors
  clearErrors();
  
  // Set loading state
  setLoadingState(true);
  
  try {
    // Simulate API processing time
    await delay(2000);
    
    // Process the analysis
    const analysis = await performAnalysis(drugName, foodName);
    
    // Display results
    displayResults(analysis);
    
  } catch (error) {
    showError('An error occurred during analysis. Please try again.');
    console.error('Analysis error:', error);
  } finally {
    setLoadingState(false);
  }
}

// Perform the drug-food interaction analysis
async function performAnalysis(drugName, foodName) {
  // Step 1: Get drug molecular properties
  const drugProperties = await getDrugProperties(drugName);
  
  // Step 2: Get food nutritional data
  const foodNutrients = await getFoodNutrients(foodName);
  
  // Step 3: Predict interaction
  const prediction = await predictInteraction(drugName, foodName, drugProperties, foodNutrients);
  
  return {
    drugName,
    foodName,
    drugProperties,
    foodNutrients,
    prediction
  };
}

// Get drug properties
async function getDrugProperties(drugName) {
  const knownDrug = ENHANCED_SAMPLE_DATA.sampleDrugs[drugName];
  
  if (knownDrug) {
    return knownDrug;
  }
  
  return generateMockDrugProperties(drugName);
}

// Get food nutrients
async function getFoodNutrients(foodName) {
  const knownFood = ENHANCED_SAMPLE_DATA.sampleFoods[foodName];
  
  if (knownFood) {
    return knownFood;
  }
  
  return generateMockFoodNutrients(foodName);
}

// Predict interaction
async function predictInteraction(drugName, foodName, drugProperties, foodNutrients) {
  const interactionKey = `${drugName}_${foodName}`;
  const knownInteraction = ENHANCED_SAMPLE_DATA.interactionResults[interactionKey];
  
  if (knownInteraction) {
    return knownInteraction;
  }
  
  return generateMockPrediction(drugName, drugProperties, foodNutrients);
}

// Generate mock drug properties for unknown drugs
function generateMockDrugProperties(drugName) {
  const hash = simpleHash(drugName);
  
  return {
    canonicalSmiles: generateMockSMILES(drugName),
    molecularWeight: 150 + (hash % 300),
    logP: -2 + (hash % 6),
    hba: 2 + (hash % 8),
    hbd: 1 + (hash % 5),
    tpsa: 40 + (hash % 100),
    rotBonds: 1 + (hash % 10),
    ringCount: 1 + (hash % 4),
    fractionCSP3: (hash % 100) / 100,
    balabanJ: 0.5 + (hash % 200) / 100,
    bertzCT: 100 + (hash % 800)
  };
}

// Generate mock food nutrients for unknown foods
function generateMockFoodNutrients(foodName) {
  const hash = simpleHash(foodName);
  
  return {
    Fat: (hash % 10),
    Carbohydrates: 5 + (hash % 20),
    Protein: 1 + (hash % 10),
    Vitamin_C_mg: (hash % 50),
    Vitamin_D_ug: (hash % 5),
    Vitamin_B12_ug: (hash % 3),
    Vitamin_B6_mg: 0.1 + (hash % 200) / 100,
    Vitamin_A_ug: 10 + (hash % 500),
    Vitamin_E_mg: 0.5 + (hash % 300) / 100,
    Vitamin_K_ug: 5 + (hash % 200),
    Folate_ug: 10 + (hash % 200),
    Calcium: 10 + (hash % 100),
    Iron: 0.1 + (hash % 500) / 100,
    Magnesium: 5 + (hash % 50),
    Potassium: 50 + (hash % 300),
    Sodium: 1 + (hash % 100),
    Zinc: 0.1 + (hash % 200) / 100,
    Saturated_Fat_g: (hash % 500) / 100,
    Monounsaturated_Fat_g: (hash % 300) / 100,
    Polyunsaturated_Fat_g: (hash % 200) / 100,
    Cholesterol_mg: (hash % 50)
  };
}

// Generate mock prediction
function generateMockPrediction(drugName, drugProperties, foodNutrients) {
  // Check for vitamin K interaction
  if (foodNutrients.Vitamin_K_ug > 100 && (drugName.includes('warfarin') || drugName.includes('coumadin'))) {
    return {
      effect: "Harmful",
      confidence: 0.90 + Math.random() * 0.08,
      explanation: `High vitamin K content (${foodNutrients.Vitamin_K_ug.toFixed(1)} µg per 100g) may significantly interfere with anticoagulant effectiveness. Monitor INR levels and maintain consistent intake.`
    };
  }
  
  // Check for calcium interaction
  if (foodNutrients.Calcium > 50 && (drugName.includes('metformin') || drugName.includes('antibiotic'))) {
    return {
      effect: "Possible",
      confidence: 0.65 + Math.random() * 0.15,
      explanation: `Calcium content (${foodNutrients.Calcium.toFixed(0)} mg per 100g) may affect drug absorption. Consider timing medication and food intake appropriately.`
    };
  }
  
  // Default prediction based on properties
  const riskScore = (drugProperties.hba + drugProperties.hbd + foodNutrients.Calcium / 50 + foodNutrients.Iron) / 10;
  const effects = ['No Effect', 'Possible', 'Positive', 'Harmful'];
  const explanations = [
    'Based on molecular analysis, no significant interaction is predicted between this drug and food combination.',
    'Minor interaction possible. The food may slightly affect drug absorption or metabolism.',
    'This food may enhance the therapeutic effects of the drug or improve its absorption.',
    'Significant interaction detected. This food may interfere with drug efficacy or cause adverse effects.'
  ];
  
  let effectIndex;
  if (riskScore > 2) effectIndex = 3;
  else if (riskScore > 1.5) effectIndex = 1;
  else if (riskScore > 1) effectIndex = 2;
  else effectIndex = 0;
  
  return {
    effect: effects[effectIndex],
    confidence: 0.6 + Math.random() * 0.3,
    explanation: explanations[effectIndex]
  };
}

// Display analysis results
function displayResults(analysis) {
  currentAnalysis = analysis;
  
  // Update main result
  updateMainResult(analysis.prediction);
  
  // Update interaction warnings
  updateInteractionWarnings(analysis.drugName, analysis.foodNutrients);
  
  // Update drug properties
  updateDrugProperties(analysis.drugProperties);
  
  // Update food nutrients
  updateFoodNutrients(analysis.foodNutrients);
  
  // Show fat breakdown by default after results are displayed
  showFatBreakdownByDefault();
  
  // Show results section with animation
  resultsSection.classList.remove('hidden');
  setTimeout(() => {
    resultsSection.classList.add('visible');
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

// Show fat breakdown section by default
function showFatBreakdownByDefault() {
  const detailedSections = document.querySelectorAll('.detailed-only');
  detailedSections.forEach(section => {
    section.classList.remove('hidden');
  });
  detailedView = true;
  updateToggleButton();
}

// Update main result display
function updateMainResult(prediction) {
  const resultIcon = document.getElementById('resultIcon');
  const effectResult = document.getElementById('effectResult');
  const confidenceBar = document.getElementById('confidenceBar');
  const confidenceText = document.getElementById('confidenceText');
  const explanationText = document.getElementById('explanationText');
  
  const effect = prediction.effect.toLowerCase().replace(' ', '-');
  
  // Update icon and styling
  resultIcon.className = `fas result-icon ${effect}`;
  switch (effect) {
    case 'no-effect':
      resultIcon.classList.add('fa-check-circle');
      break;
    case 'possible':
      resultIcon.classList.add('fa-exclamation-triangle');
      break;
    case 'positive':
      resultIcon.classList.add('fa-thumbs-up');
      break;
    case 'harmful':
      resultIcon.classList.add('fa-times-circle');
      break;
  }
  
  // Update effect text
  effectResult.textContent = prediction.effect;
  effectResult.className = `effect-value ${effect}`;
  
  // Update confidence
  const confidencePercent = Math.round(prediction.confidence * 100);
  confidenceBar.style.width = `${confidencePercent}%`;
  confidenceText.textContent = `${confidencePercent}%`;
  
  // Update explanation
  explanationText.textContent = prediction.explanation;
}

// Update interaction warnings
function updateInteractionWarnings(drugName, foodNutrients) {
  const warningsSection = document.getElementById('interactionWarnings');
  const warningContent = document.getElementById('warningContent');
  
  let warnings = [];
  
  // Check for specific nutrient interactions
  const interactionNutrients = ENHANCED_SAMPLE_DATA.interactionNutrients[drugName] || [];
  
  interactionNutrients.forEach(nutrient => {
    if (foodNutrients[nutrient] && foodNutrients[nutrient] > 0) {
      const rdv = ENHANCED_SAMPLE_DATA.nutrientRDV[nutrient];
      const value = foodNutrients[nutrient];
      const unit = getNutrientUnit(nutrient);
      
      if (nutrient === 'Vitamin_K_ug' && value > 50) {
        warnings.push(`High Vitamin K content (${value.toFixed(1)} ${unit}) may affect anticoagulant medications.`);
      } else if (nutrient === 'Calcium' && value > 50) {
        warnings.push(`Calcium content (${value.toFixed(0)} ${unit}) may interfere with medication absorption.`);
      }
    }
  });
  
  if (warnings.length > 0) {
    warningContent.innerHTML = warnings.map(warning => `<p>• ${warning}</p>`).join('');
    warningsSection.classList.remove('hidden');
  } else {
    warningsSection.classList.add('hidden');
  }
}

// Get nutrient unit
function getNutrientUnit(nutrient) {
  const units = {
    'Vitamin_C_mg': 'mg',
    'Vitamin_D_ug': 'µg',
    'Vitamin_B12_ug': 'µg',
    'Vitamin_B6_mg': 'mg',
    'Vitamin_A_ug': 'µg',
    'Vitamin_E_mg': 'mg',
    'Vitamin_K_ug': 'µg',
    'Folate_ug': 'µg',
    'Calcium': 'mg',
    'Iron': 'mg',
    'Magnesium': 'mg',
    'Potassium': 'mg',
    'Sodium': 'mg',
    'Zinc': 'mg',
    'Saturated_Fat_g': 'g',
    'Monounsaturated_Fat_g': 'g',
    'Polyunsaturated_Fat_g': 'g',
    'Cholesterol_mg': 'mg'
  };
  return units[nutrient] || 'g';
}

// Update drug properties display
function updateDrugProperties(properties) {
  document.getElementById('molWeight').textContent = `${properties.molecularWeight.toFixed(2)} g/mol`;
  document.getElementById('logP').textContent = properties.logP.toFixed(2);
  document.getElementById('hba').textContent = properties.hba;
  document.getElementById('hbd').textContent = properties.hbd;
  document.getElementById('tpsa').textContent = `${properties.tpsa.toFixed(1)} Ų`;
  document.getElementById('rotBonds').textContent = properties.rotBonds;
  document.getElementById('canonicalSmiles').textContent = properties.canonicalSmiles;
}

// Update food nutrients display
function updateFoodNutrients(nutrients) {
  // Macronutrients
  document.getElementById('carbs').textContent = `${nutrients.Carbohydrates.toFixed(1)} g`;
  document.getElementById('protein').textContent = `${nutrients.Protein.toFixed(1)} g`;
  document.getElementById('fat').textContent = `${nutrients.Fat.toFixed(1)} g`;
  
  // Vitamins
  updateNutrientWithProgress('vitC', nutrients.Vitamin_C_mg, 'mg', 'vitCProgress');
  updateNutrientWithProgress('vitD', nutrients.Vitamin_D_ug, 'µg', 'vitDProgress');
  updateNutrientWithProgress('vitB12', nutrients.Vitamin_B12_ug, 'µg', 'vitB12Progress');
  updateNutrientWithProgress('vitB6', nutrients.Vitamin_B6_mg, 'mg', 'vitB6Progress');
  updateNutrientWithProgress('vitA', nutrients.Vitamin_A_ug, 'µg', 'vitAProgress');
  updateNutrientWithProgress('vitE', nutrients.Vitamin_E_mg, 'mg', 'vitEProgress');
  updateNutrientWithProgress('vitK', nutrients.Vitamin_K_ug, 'µg', 'vitKProgress');
  updateNutrientWithProgress('folate', nutrients.Folate_ug, 'µg', 'folateProgress');
  
  // Minerals
  updateNutrientWithProgress('calcium', nutrients.Calcium, 'mg', 'calciumProgress');
  updateNutrientWithProgress('iron', nutrients.Iron, 'mg', 'ironProgress');
  updateNutrientWithProgress('magnesium', nutrients.Magnesium, 'mg', 'magnesiumProgress');
  updateNutrientWithProgress('potassium', nutrients.Potassium, 'mg', 'potassiumProgress');
  updateNutrientWithProgress('sodium', nutrients.Sodium, 'mg', 'sodiumProgress');
  updateNutrientWithProgress('zinc', nutrients.Zinc, 'mg', 'zincProgress');
  
  // Fats
  document.getElementById('satFat').textContent = `${nutrients.Saturated_Fat_g.toFixed(2)} g`;
  document.getElementById('monoFat').textContent = `${nutrients.Monounsaturated_Fat_g.toFixed(2)} g`;
  document.getElementById('polyFat').textContent = `${nutrients.Polyunsaturated_Fat_g.toFixed(2)} g`;
  document.getElementById('cholesterol').textContent = `${nutrients.Cholesterol_mg.toFixed(1)} mg`;
}

// Update nutrient with progress bar
function updateNutrientWithProgress(elementId, value, unit, progressId) {
  const element = document.getElementById(elementId);
  const progressBar = document.getElementById(progressId);
  
  if (element) {
    element.textContent = `${value.toFixed(value < 1 ? 2 : 1)} ${unit}`;
  }
  
  if (progressBar) {
    const nutrientKey = getNutrientKey(elementId);
    const rdv = ENHANCED_SAMPLE_DATA.nutrientRDV[nutrientKey];
    
    if (rdv) {
      const percentage = Math.min((value / rdv) * 100, 100);
      progressBar.style.width = `${percentage}%`;
      
      // Color coding
      progressBar.className = 'progress-bar';
      if (percentage > 150) {
        progressBar.classList.add('very-high');
      } else if (percentage > 100) {
        progressBar.classList.add('high');
      }
    }
  }
}

// Get nutrient key from element ID
function getNutrientKey(elementId) {
  const mapping = {
    'vitC': 'Vitamin_C_mg',
    'vitD': 'Vitamin_D_ug',
    'vitB12': 'Vitamin_B12_ug',
    'vitB6': 'Vitamin_B6_mg',
    'vitA': 'Vitamin_A_ug',
    'vitE': 'Vitamin_E_mg',
    'vitK': 'Vitamin_K_ug',
    'folate': 'Folate_ug',
    'calcium': 'Calcium',
    'iron': 'Iron',
    'magnesium': 'Magnesium',
    'potassium': 'Potassium',
    'sodium': 'Sodium',
    'zinc': 'Zinc'
  };
  return mapping[elementId];
}

// Set loading state
function setLoadingState(isLoading) {
  if (isLoading) {
    analyzeBtn.classList.add('loading');
    analyzeBtn.disabled = true;
    document.querySelector('.btn-loader').classList.remove('hidden');
  } else {
    analyzeBtn.classList.remove('loading');
    analyzeBtn.disabled = false;
    document.querySelector('.btn-loader').classList.add('hidden');
  }
}

// Handle clear button
function handleClear() {
  // Clear inputs
  drugNameInput.value = '';
  foodNameInput.value = '';
  
  // Hide results
  resultsSection.classList.remove('visible');
  setTimeout(() => {
    resultsSection.classList.add('hidden');
  }, 300);
  
  // Reset collapsible sections
  const collapsibleHeaders = document.querySelectorAll('.collapsible-header');
  const collapsibleContents = document.querySelectorAll('.collapsible-content');
  
  collapsibleHeaders.forEach(header => header.classList.remove('active'));
  collapsibleContents.forEach(content => content.classList.remove('active'));
  
  // Reset detailed view
  detailedView = false;
  const detailedSections = document.querySelectorAll('.detailed-only');
  detailedSections.forEach(section => section.classList.add('hidden'));
  updateToggleButton();
  
  // Clear current analysis
  currentAnalysis = null;
  
  // Focus on first input
  drugNameInput.focus();
  
  // Validate inputs
  validateInputs();
}

// Utility functions
function showError(message) {
  clearErrors();
  
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.innerHTML = `
    <i class="fas fa-exclamation-circle"></i>
    <span>${message}</span>
  `;
  
  const inputSection = document.querySelector('.input-section');
  inputSection.parentNode.insertBefore(errorDiv, inputSection.nextSibling);
  
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.parentNode.removeChild(errorDiv);
    }
  }, 5000);
}

function clearErrors() {
  const errorMessages = document.querySelectorAll('.error-message');
  errorMessages.forEach(error => {
    if (error.parentNode) {
      error.parentNode.removeChild(error);
    }
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function generateMockSMILES(drugName) {
  const templates = [
    "CCN(CC)CCOC(=O)C1=CC=CC=C1",
    "CC(C)CC1=CC=C(C=C1)C(C)C(=O)O",
    "CN1C=NC2=C1C(=O)N(C(=O)N2C)C",
    "CC(=O)OC1=CC=CC=C1C(=O)O"
  ];
  
  const hash = simpleHash(drugName);
  return templates[hash % templates.length];
}

// Enhanced input suggestions
drugNameInput.addEventListener('focus', function() {
  if (!this.value) {
    this.placeholder = 'Try: aspirin, warfarin, metformin...';
  }
});

foodNameInput.addEventListener('focus', function() {
  if (!this.value) {
    this.placeholder = 'Try: apple, spinach, milk, broccoli...';
  }
});

drugNameInput.addEventListener('blur', function() {
  if (!this.value) {
    this.placeholder = 'Enter drug name (e.g., aspirin)';
  }
});

foodNameInput.addEventListener('blur', function() {
  if (!this.value) {
    this.placeholder = 'Enter food name (e.g., apple)';
  }
});

// Initialize validation state
validateInputs();