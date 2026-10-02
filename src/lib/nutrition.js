// Food Database — Indian, South Indian, common hostel/gym foods
// Nutritional values per standard serving

export const FOOD_DATABASE = [
  // ── Indian Staples ──
  { id: 'white_rice', name: 'White Rice (cooked)', category: 'grains', servingSize: 150, unit: 'g', cal: 195, protein: 4, carbs: 43, fat: 0.4, fiber: 0.6 },
  { id: 'brown_rice', name: 'Brown Rice (cooked)', category: 'grains', servingSize: 150, unit: 'g', cal: 170, protein: 4, carbs: 36, fat: 1.5, fiber: 2.5 },
  { id: 'chapati', name: 'Chapati / Roti', category: 'grains', servingSize: 40, unit: 'g', cal: 120, protein: 3.5, carbs: 20, fat: 3.5, fiber: 2 },
  { id: 'paratha', name: 'Paratha (plain)', category: 'grains', servingSize: 60, unit: 'g', cal: 200, protein: 4, carbs: 28, fat: 8, fiber: 2 },
  { id: 'naan', name: 'Naan', category: 'grains', servingSize: 90, unit: 'g', cal: 260, protein: 7, carbs: 45, fat: 5, fiber: 2 },
  { id: 'poori', name: 'Poori (fried)', category: 'grains', servingSize: 30, unit: 'g', cal: 150, protein: 2, carbs: 15, fat: 9, fiber: 1 },

  // ── South Indian ──
  { id: 'idli', name: 'Idli (2 pcs)', category: 'south_indian', servingSize: 120, unit: 'g', cal: 140, protein: 4, carbs: 28, fat: 0.5, fiber: 1 },
  { id: 'dosa_plain', name: 'Plain Dosa', category: 'south_indian', servingSize: 100, unit: 'g', cal: 170, protein: 4, carbs: 28, fat: 5, fiber: 1 },
  { id: 'dosa_masala', name: 'Masala Dosa', category: 'south_indian', servingSize: 200, unit: 'g', cal: 320, protein: 6, carbs: 42, fat: 14, fiber: 3 },
  { id: 'sambar', name: 'Sambar (1 cup)', category: 'south_indian', servingSize: 200, unit: 'ml', cal: 130, protein: 6, carbs: 18, fat: 4, fiber: 4 },
  { id: 'rasam', name: 'Rasam (1 cup)', category: 'south_indian', servingSize: 200, unit: 'ml', cal: 50, protein: 2, carbs: 8, fat: 1, fiber: 1 },
  { id: 'vada', name: 'Medu Vada (2 pcs)', category: 'south_indian', servingSize: 80, unit: 'g', cal: 260, protein: 8, carbs: 22, fat: 16, fiber: 2 },
  { id: 'upma', name: 'Upma (1 cup)', category: 'south_indian', servingSize: 200, unit: 'g', cal: 220, protein: 5, carbs: 32, fat: 8, fiber: 2 },
  { id: 'pongal', name: 'Ven Pongal', category: 'south_indian', servingSize: 200, unit: 'g', cal: 250, protein: 6, carbs: 34, fat: 10, fiber: 2 },
  { id: 'uttapam', name: 'Uttapam', category: 'south_indian', servingSize: 150, unit: 'g', cal: 230, protein: 5, carbs: 34, fat: 8, fiber: 2 },
  { id: 'coconut_chutney', name: 'Coconut Chutney', category: 'south_indian', servingSize: 30, unit: 'g', cal: 50, protein: 1, carbs: 3, fat: 4, fiber: 1 },

  // ── Proteins ──
  { id: 'chicken_breast', name: 'Chicken Breast (grilled)', category: 'protein', servingSize: 150, unit: 'g', cal: 248, protein: 46, carbs: 0, fat: 5.5, fiber: 0 },
  { id: 'chicken_curry', name: 'Chicken Curry', category: 'protein', servingSize: 200, unit: 'g', cal: 320, protein: 28, carbs: 8, fat: 20, fiber: 2 },
  { id: 'egg_boiled', name: 'Boiled Egg', category: 'protein', servingSize: 50, unit: 'g', cal: 78, protein: 6, carbs: 0.6, fat: 5, fiber: 0 },
  { id: 'egg_omelette', name: 'Egg Omelette (2 eggs)', category: 'protein', servingSize: 120, unit: 'g', cal: 190, protein: 13, carbs: 1, fat: 14, fiber: 0 },
  { id: 'egg_bhurji', name: 'Egg Bhurji (scrambled)', category: 'protein', servingSize: 150, unit: 'g', cal: 220, protein: 14, carbs: 4, fat: 16, fiber: 1 },
  { id: 'paneer', name: 'Paneer (cottage cheese)', category: 'protein', servingSize: 100, unit: 'g', cal: 260, protein: 18, carbs: 2, fat: 20, fiber: 0 },
  { id: 'paneer_butter', name: 'Paneer Butter Masala', category: 'protein', servingSize: 200, unit: 'g', cal: 420, protein: 16, carbs: 14, fat: 32, fiber: 2 },
  { id: 'fish_fry', name: 'Fish Fry', category: 'protein', servingSize: 150, unit: 'g', cal: 280, protein: 30, carbs: 8, fat: 14, fiber: 0 },
  { id: 'tofu', name: 'Tofu', category: 'protein', servingSize: 100, unit: 'g', cal: 76, protein: 8, carbs: 2, fat: 4, fiber: 0.3 },
  { id: 'whey_protein', name: 'Whey Protein (1 scoop)', category: 'protein', servingSize: 30, unit: 'g', cal: 120, protein: 24, carbs: 3, fat: 1.5, fiber: 0 },
  { id: 'soya_chunks', name: 'Soya Chunks (cooked)', category: 'protein', servingSize: 100, unit: 'g', cal: 170, protein: 26, carbs: 14, fat: 0.5, fiber: 4 },

  // ── Lentils / Dal ──
  { id: 'dal_tadka', name: 'Dal Tadka', category: 'lentils', servingSize: 200, unit: 'ml', cal: 180, protein: 10, carbs: 24, fat: 5, fiber: 5 },
  { id: 'rajma', name: 'Rajma (kidney beans)', category: 'lentils', servingSize: 200, unit: 'g', cal: 230, protein: 12, carbs: 34, fat: 4, fiber: 8 },
  { id: 'chana_masala', name: 'Chana Masala', category: 'lentils', servingSize: 200, unit: 'g', cal: 240, protein: 10, carbs: 32, fat: 8, fiber: 8 },
  { id: 'moong_dal', name: 'Moong Dal', category: 'lentils', servingSize: 200, unit: 'ml', cal: 150, protein: 10, carbs: 22, fat: 2, fiber: 4 },

  // ── Dairy ──
  { id: 'curd', name: 'Curd / Yogurt', category: 'dairy', servingSize: 100, unit: 'g', cal: 60, protein: 3.5, carbs: 5, fat: 3, fiber: 0 },
  { id: 'greek_yogurt', name: 'Greek Yogurt', category: 'dairy', servingSize: 150, unit: 'g', cal: 100, protein: 17, carbs: 6, fat: 0.7, fiber: 0 },
  { id: 'milk', name: 'Milk (whole)', category: 'dairy', servingSize: 200, unit: 'ml', cal: 120, protein: 6, carbs: 10, fat: 6, fiber: 0 },
  { id: 'buttermilk', name: 'Buttermilk / Chaas', category: 'dairy', servingSize: 200, unit: 'ml', cal: 40, protein: 2, carbs: 5, fat: 1, fiber: 0 },
  { id: 'lassi', name: 'Sweet Lassi', category: 'dairy', servingSize: 250, unit: 'ml', cal: 180, protein: 5, carbs: 30, fat: 5, fiber: 0 },
  { id: 'cheese_slice', name: 'Cheese Slice', category: 'dairy', servingSize: 20, unit: 'g', cal: 60, protein: 4, carbs: 0.5, fat: 5, fiber: 0 },

  // ── Vegetables ──
  { id: 'mixed_veg', name: 'Mixed Veg Curry', category: 'vegetables', servingSize: 200, unit: 'g', cal: 160, protein: 4, carbs: 18, fat: 8, fiber: 4 },
  { id: 'palak_paneer', name: 'Palak Paneer', category: 'vegetables', servingSize: 200, unit: 'g', cal: 300, protein: 14, carbs: 10, fat: 22, fiber: 3 },
  { id: 'aloo_gobi', name: 'Aloo Gobi', category: 'vegetables', servingSize: 200, unit: 'g', cal: 180, protein: 4, carbs: 22, fat: 8, fiber: 4 },
  { id: 'bhindi', name: 'Bhindi Fry (Okra)', category: 'vegetables', servingSize: 150, unit: 'g', cal: 140, protein: 3, carbs: 14, fat: 8, fiber: 4 },
  { id: 'salad', name: 'Fresh Salad', category: 'vegetables', servingSize: 150, unit: 'g', cal: 35, protein: 2, carbs: 6, fat: 0.5, fiber: 3 },

  // ── Fruits ──
  { id: 'banana', name: 'Banana', category: 'fruits', servingSize: 120, unit: 'g', cal: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3 },
  { id: 'apple', name: 'Apple', category: 'fruits', servingSize: 180, unit: 'g', cal: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4 },
  { id: 'mango', name: 'Mango', category: 'fruits', servingSize: 150, unit: 'g', cal: 100, protein: 1.4, carbs: 25, fat: 0.6, fiber: 3 },
  { id: 'orange', name: 'Orange', category: 'fruits', servingSize: 140, unit: 'g', cal: 62, protein: 1.2, carbs: 15, fat: 0.2, fiber: 3 },
  { id: 'watermelon', name: 'Watermelon', category: 'fruits', servingSize: 200, unit: 'g', cal: 60, protein: 1.2, carbs: 15, fat: 0.3, fiber: 0.6 },

  // ── Snacks ──
  { id: 'samosa', name: 'Samosa (1 pc)', category: 'snacks', servingSize: 80, unit: 'g', cal: 250, protein: 4, carbs: 24, fat: 15, fiber: 2 },
  { id: 'peanuts', name: 'Peanuts (roasted)', category: 'snacks', servingSize: 30, unit: 'g', cal: 170, protein: 7, carbs: 5, fat: 14, fiber: 2 },
  { id: 'almonds', name: 'Almonds', category: 'snacks', servingSize: 28, unit: 'g', cal: 164, protein: 6, carbs: 6, fat: 14, fiber: 3.5 },
  { id: 'biscuits', name: 'Marie Biscuits (4 pcs)', category: 'snacks', servingSize: 28, unit: 'g', cal: 120, protein: 2, carbs: 20, fat: 3, fiber: 0.5 },
  { id: 'protein_bar', name: 'Protein Bar', category: 'snacks', servingSize: 60, unit: 'g', cal: 210, protein: 20, carbs: 22, fat: 7, fiber: 3 },

  // ── Breakfast ──
  { id: 'oats', name: 'Oats (cooked)', category: 'breakfast', servingSize: 40, unit: 'g (dry)', cal: 150, protein: 5, carbs: 27, fat: 3, fiber: 4 },
  { id: 'poha', name: 'Poha (flattened rice)', category: 'breakfast', servingSize: 200, unit: 'g', cal: 250, protein: 5, carbs: 42, fat: 7, fiber: 2 },
  { id: 'bread_toast', name: 'Bread Toast (2 slices)', category: 'breakfast', servingSize: 60, unit: 'g', cal: 160, protein: 5, carbs: 28, fat: 2, fiber: 2 },
  { id: 'cornflakes', name: 'Cornflakes + Milk', category: 'breakfast', servingSize: 40, unit: 'g (dry)', cal: 190, protein: 5, carbs: 36, fat: 3, fiber: 1 },

  // ── Beverages ──
  { id: 'tea', name: 'Tea (with milk & sugar)', category: 'beverages', servingSize: 150, unit: 'ml', cal: 50, protein: 1, carbs: 8, fat: 1.5, fiber: 0 },
  { id: 'coffee', name: 'Coffee (with milk)', category: 'beverages', servingSize: 150, unit: 'ml', cal: 45, protein: 1.5, carbs: 6, fat: 1.5, fiber: 0 },
  { id: 'black_coffee', name: 'Black Coffee', category: 'beverages', servingSize: 200, unit: 'ml', cal: 5, protein: 0.3, carbs: 0, fat: 0, fiber: 0 },
  { id: 'protein_shake', name: 'Protein Shake (whey+milk)', category: 'beverages', servingSize: 300, unit: 'ml', cal: 230, protein: 30, carbs: 15, fat: 5, fiber: 0 },
  { id: 'coconut_water', name: 'Coconut Water', category: 'beverages', servingSize: 250, unit: 'ml', cal: 45, protein: 1.7, carbs: 9, fat: 0.5, fiber: 2.6 },

  // ── Common Meals (hostel / canteen) ──
  { id: 'rice_dal', name: 'Rice + Dal', category: 'meals', servingSize: 350, unit: 'g', cal: 380, protein: 14, carbs: 66, fat: 6, fiber: 6 },
  { id: 'rice_sambar', name: 'Rice + Sambar', category: 'meals', servingSize: 350, unit: 'g', cal: 340, protein: 10, carbs: 62, fat: 5, fiber: 5 },
  { id: 'rice_chicken', name: 'Rice + Chicken Curry', category: 'meals', servingSize: 400, unit: 'g', cal: 520, protein: 32, carbs: 48, fat: 20, fiber: 3 },
  { id: 'biryani_chicken', name: 'Chicken Biryani', category: 'meals', servingSize: 300, unit: 'g', cal: 480, protein: 28, carbs: 54, fat: 16, fiber: 3 },
  { id: 'biryani_veg', name: 'Veg Biryani', category: 'meals', servingSize: 300, unit: 'g', cal: 360, protein: 8, carbs: 56, fat: 12, fiber: 4 },
  { id: 'fried_rice', name: 'Fried Rice', category: 'meals', servingSize: 250, unit: 'g', cal: 350, protein: 8, carbs: 50, fat: 12, fiber: 2 },
  { id: 'maggi', name: 'Maggi Noodles (1 pack)', category: 'meals', servingSize: 70, unit: 'g (dry)', cal: 310, protein: 7, carbs: 42, fat: 13, fiber: 2 },
];

// Search function with fuzzy matching
export function searchFoods(query) {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  return FOOD_DATABASE.filter(food =>
    food.name.toLowerCase().includes(q) ||
    food.category.toLowerCase().includes(q) ||
    food.id.includes(q)
  ).slice(0, 15);
}

// Scale nutrition by quantity
export function scaleNutrition(food, grams) {
  const ratio = grams / food.servingSize;
  return {
    ...food,
    actualGrams: grams,
    cal: Math.round(food.cal * ratio),
    protein: Math.round(food.protein * ratio * 10) / 10,
    carbs: Math.round(food.carbs * ratio * 10) / 10,
    fat: Math.round(food.fat * ratio * 10) / 10,
    fiber: Math.round(food.fiber * ratio * 10) / 10
  };
}

// Get categories
export function getFoodCategories() {
  const cats = new Set(FOOD_DATABASE.map(f => f.category));
  return [...cats];
}

// Get foods by category
export function getFoodsByCategory(category) {
  return FOOD_DATABASE.filter(f => f.category === category);
}

// BMR / TDEE Calculation (Mifflin-St Jeor)
export function calculateBMR(weight, height, age, sex) {
  if (sex === 'female') {
    return Math.round((10 * weight) + (6.25 * height) - (5 * age) - 161);
  }
  return Math.round((10 * weight) + (6.25 * height) - (5 * age) + 5);
}

export function calculateTDEE(bmr, activityLevel) {
  return Math.round(bmr * activityLevel);
}

export function calculateTargets(tdee, goal, weight) {
  let targetCalories = tdee;
  let proteinRatio = 1.8;

  if (goal === 'lose') {
    targetCalories = Math.max(1200, tdee - 500);
    proteinRatio = 2.2;
  } else if (goal === 'gain') {
    targetCalories = tdee + 400;
    proteinRatio = 2.0;
  }

  return {
    calories: targetCalories,
    protein: Math.round(weight * proteinRatio),
    carbs: Math.round((targetCalories * 0.45) / 4),
    fat: Math.round((targetCalories * 0.25) / 9),
    water: 8
  };
}

export function getBMICategory(bmi) {
  if (bmi < 18.5) return { label: 'Underweight', color: '#06b6d4' };
  if (bmi < 25.0) return { label: 'Normal', color: '#10b981' };
  if (bmi < 30.0) return { label: 'Overweight', color: '#f59e0b' };
  return { label: 'Obese', color: '#ef4444' };
}
