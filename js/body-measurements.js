// === BODY MEASUREMENTS & CALCULATORS ===

const BodyMeasurements = {
    // Initialize measurement data structure
    init() {
        if (!AppState.bodyMeasurements) {
            AppState.bodyMeasurements = [];
        }
        if (!AppState.userData.gender) {
            AppState.userData.gender = 'male'; // default
        }
    },

    // Add new measurement entry
    addMeasurement(data) {
        if (!AppState.bodyMeasurements) {
            AppState.bodyMeasurements = [];
        }

        const measurement = {
            date: data.date || new Date().toISOString().split('T')[0],
            waist: parseFloat(data.waist) || null,
            hips: parseFloat(data.hips) || null,
            neck: parseFloat(data.neck) || null,
            chest: parseFloat(data.chest) || null,
            arms: parseFloat(data.arms) || null,
            thighs: parseFloat(data.thighs) || null,
            weight: parseFloat(data.weight) || getCurrentWeight()
        };

        AppState.bodyMeasurements.push(measurement);

        // Keep only last 50 measurements
        if (AppState.bodyMeasurements.length > 50) {
            AppState.bodyMeasurements = AppState.bodyMeasurements.slice(-50);
        }

        saveData();
        return measurement;
    },

    // Get latest measurement
    getLatest() {
        if (!AppState.bodyMeasurements || AppState.bodyMeasurements.length === 0) {
            return null;
        }
        return AppState.bodyMeasurements[AppState.bodyMeasurements.length - 1];
    },

    // Get all measurements
    getAll() {
        return AppState.bodyMeasurements || [];
    },

    // Calculate BMI
    calculateBMI(weight, height) {
        if (!weight || !height) return null;
        const heightM = height / 100;
        return weight / (heightM * heightM);
    },

    // Get BMI category
    getBMICategory(bmi) {
        if (!bmi) return { category: 'Neznámé', color: 'gray', risk: 'Zadejte údaje' };

        if (bmi < 18.5) return {
            category: 'Podváha',
            color: '#2196F3',
            risk: 'Možné zdravotní riziko'
        };
        if (bmi < 25) return {
            category: 'Normální váha',
            color: '#4CAF50',
            risk: 'Zdravá váha'
        };
        if (bmi < 30) return {
            category: 'Nadváha',
            color: '#FF9800',
            risk: 'Zvýšené zdravotní riziko'
        };
        if (bmi < 35) return {
            category: 'Obezita I. stupně',
            color: '#F44336',
            risk: 'Vysoké zdravotní riziko'
        };
        if (bmi < 40) return {
            category: 'Obezita II. stupně',
            color: '#D32F2F',
            risk: 'Velmi vysoké riziko'
        };
        return {
            category: 'Obezita III. stupně',
            color: '#B71C1C',
            risk: 'Extrémně vysoké riziko'
        };
    },

    // Calculate Waist-to-Height Ratio (WHtR)
    calculateWHtR(waist, height) {
        if (!waist || !height) return null;
        return waist / height;
    },

    // Get WHtR category
    getWHtRCategory(whtr) {
        if (!whtr) return { category: 'Neznámé', color: 'gray', risk: 'Zadejte údaje' };

        // Universal for both genders
        if (whtr < 0.4) return {
            category: 'Velmi štíhlý',
            color: '#2196F3',
            risk: 'Možná podváha'
        };
        if (whtr < 0.5) return {
            category: 'Zdravý',
            color: '#4CAF50',
            risk: 'Nízké riziko'
        };
        if (whtr < 0.6) return {
            category: 'Zvýšené riziko',
            color: '#FF9800',
            risk: 'Zvýšené kardiovaskulární riziko'
        };
        return {
            category: 'Vysoké riziko',
            color: '#F44336',
            risk: 'Vysoké kardiovaskulární riziko'
        };
    },

    // Calculate Waist-to-Hip Ratio (WHR)
    calculateWHR(waist, hips) {
        if (!waist || !hips) return null;
        return waist / hips;
    },

    // Get WHR category
    getWHRCategory(whr, gender) {
        if (!whr) return { category: 'Neznámé', color: 'gray', risk: 'Zadejte údaje', shape: '' };

        const isMale = gender === 'male';

        if (isMale) {
            if (whr < 0.9) return {
                category: 'Nízké riziko',
                color: '#4CAF50',
                risk: 'Zdravý poměr',
                shape: 'Hruška'
            };
            if (whr < 1.0) return {
                category: 'Mírné riziko',
                color: '#FF9800',
                risk: 'Zvýšené riziko',
                shape: 'Jablko'
            };
            return {
                category: 'Vysoké riziko',
                color: '#F44336',
                risk: 'Vysoké kardiovaskulární riziko',
                shape: 'Jablko'
            };
        } else {
            if (whr < 0.8) return {
                category: 'Nízké riziko',
                color: '#4CAF50',
                risk: 'Zdravý poměr',
                shape: 'Hruška'
            };
            if (whr < 0.85) return {
                category: 'Mírné riziko',
                color: '#FF9800',
                risk: 'Zvýšené riziko',
                shape: 'Jablko'
            };
            return {
                category: 'Vysoké riziko',
                color: '#F44336',
                risk: 'Vysoké kardiovaskulární riziko',
                shape: 'Jablko'
            };
        }
    },

    // Calculate Body Fat Percentage (US Navy Method)
    calculateBodyFat(gender, waist, neck, hips, height) {
        if (!waist || !neck || !height) return null;

        const isMale = gender === 'male';

        if (isMale) {
            // Male formula: 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450
            const log10WaistNeck = Math.log10(waist - neck);
            const log10Height = Math.log10(height);
            return 495 / (1.0324 - 0.19077 * log10WaistNeck + 0.15456 * log10Height) - 450;
        } else {
            // Female formula: 495 / (1.29579 - 0.35004 * log10(waist + hips - neck) + 0.22100 * log10(height)) - 450
            if (!hips) return null;
            const log10WaistHipsNeck = Math.log10(waist + hips - neck);
            const log10Height = Math.log10(height);
            return 495 / (1.29579 - 0.35004 * log10WaistHipsNeck + 0.22100 * log10Height) - 450;
        }
    },

    // Get Body Fat category
    getBodyFatCategory(bodyFat, gender) {
        if (!bodyFat) return { category: 'Neznámé', color: 'gray', description: 'Zadejte údaje' };

        const isMale = gender === 'male';

        if (isMale) {
            if (bodyFat < 6) return {
                category: 'Extrémně nízký',
                color: '#2196F3',
                description: 'Esenciální tuk - nebezpečně nízký'
            };
            if (bodyFat < 14) return {
                category: 'Sportovec',
                color: '#00BCD4',
                description: 'Atletická postava'
            };
            if (bodyFat < 18) return {
                category: 'Fitness',
                color: '#4CAF50',
                description: 'Zdravá sportovní postava'
            };
            if (bodyFat < 25) return {
                category: 'Průměrný',
                color: '#8BC34A',
                description: 'Průměrná postava'
            };
            if (bodyFat < 30) return {
                category: 'Nadprůměrný',
                color: '#FF9800',
                description: 'Lehká nadváha'
            };
            return {
                category: 'Obezita',
                color: '#F44336',
                description: 'Vysoké procento tuku'
            };
        } else {
            if (bodyFat < 14) return {
                category: 'Extrémně nízký',
                color: '#2196F3',
                description: 'Esenciální tuk - nebezpečně nízký'
            };
            if (bodyFat < 21) return {
                category: 'Sportovec',
                color: '#00BCD4',
                description: 'Atletická postava'
            };
            if (bodyFat < 25) return {
                category: 'Fitness',
                color: '#4CAF50',
                description: 'Zdravá sportovní postava'
            };
            if (bodyFat < 32) return {
                category: 'Průměrná',
                color: '#8BC34A',
                description: 'Průměrná postava'
            };
            if (bodyFat < 38) return {
                category: 'Nadprůměrná',
                color: '#FF9800',
                description: 'Lehká nadváha'
            };
            return {
                category: 'Obezita',
                color: '#F44336',
                description: 'Vysoké procento tuku'
            };
        }
    },

    // Calculate Lean Body Mass
    calculateLeanBodyMass(weight, bodyFatPercent) {
        if (!weight || !bodyFatPercent) return null;
        return weight * (1 - bodyFatPercent / 100);
    },

    // Calculate Fat Mass
    calculateFatMass(weight, bodyFatPercent) {
        if (!weight || !bodyFatPercent) return null;
        return weight * (bodyFatPercent / 100);
    },

    // Calculate Ideal Weight (Multiple methods)
    calculateIdealWeight(height, gender) {
        if (!height) return null;

        const heightM = height / 100;
        const isMale = gender === 'male';

        // Robinson Formula (1983)
        const robinson = isMale
            ? 52 + 1.9 * ((height - 152.4) / 2.54)
            : 49 + 1.7 * ((height - 152.4) / 2.54);

        // Miller Formula (1983)
        const miller = isMale
            ? 56.2 + 1.41 * ((height - 152.4) / 2.54)
            : 53.1 + 1.36 * ((height - 152.4) / 2.54);

        // Devine Formula (1974)
        const devine = isMale
            ? 50 + 2.3 * ((height - 152.4) / 2.54)
            : 45.5 + 2.3 * ((height - 152.4) / 2.54);

        // Hamwi Formula (1964)
        const hamwi = isMale
            ? 48 + 2.7 * ((height - 152.4) / 2.54)
            : 45.5 + 2.2 * ((height - 152.4) / 2.54);

        // BMI based (21.5-22.5 for optimal health)
        const bmiLow = 21.5 * heightM * heightM;
        const bmiHigh = 22.5 * heightM * heightM;

        return {
            robinson: Math.round(robinson * 10) / 10,
            miller: Math.round(miller * 10) / 10,
            devine: Math.round(devine * 10) / 10,
            hamwi: Math.round(hamwi * 10) / 10,
            bmiRange: {
                low: Math.round(bmiLow * 10) / 10,
                high: Math.round(bmiHigh * 10) / 10
            },
            average: Math.round(((robinson + miller + devine + hamwi) / 4) * 10) / 10
        };
    },

    // Get measurement change (latest vs first)
    getMeasurementChange() {
        const measurements = this.getAll();
        if (measurements.length < 2) return null;

        const first = measurements[0];
        const latest = measurements[measurements.length - 1];

        return {
            waist: latest.waist && first.waist ? latest.waist - first.waist : null,
            hips: latest.hips && first.hips ? latest.hips - first.hips : null,
            chest: latest.chest && first.chest ? latest.chest - first.chest : null,
            arms: latest.arms && first.arms ? latest.arms - first.arms : null,
            thighs: latest.thighs && first.thighs ? latest.thighs - first.thighs : null
        };
    },

    // Format change with + or -
    formatChange(value) {
        if (!value) return '';
        const prefix = value > 0 ? '+' : '';
        return `${prefix}${value.toFixed(1)} cm`;
    },

    // === ADVANCED CALCULATORS ===

    // Calculate BMR (Basal Metabolic Rate) - Mifflin-St Jeor Equation
    calculateBMR(weight, height, age, gender) {
        if (!weight || !height || !age) return null;

        const isMale = gender === 'male';

        // Mifflin-St Jeor: (10 × weight in kg) + (6.25 × height in cm) − (5 × age in years) + s
        // where s is +5 for males and -161 for females
        return (10 * weight) + (6.25 * height) - (5 * age) + (isMale ? 5 : -161);
    },

    // Calculate TDEE (Total Daily Energy Expenditure)
    calculateTDEE(bmr, activityLevel) {
        if (!bmr || !activityLevel) return null;

        const multipliers = {
            sedentary: 1.2,        // Sedentární (téměř žádný pohyb)
            light: 1.375,          // Lehká aktivita (cvičení 1-3x týdně)
            moderate: 1.55,        // Středně aktivní (cvičení 3-5x týdně)
            active: 1.725,         // Velmi aktivní (cvičení 6-7x týdně)
            veryActive: 1.9        // Extra aktivní (2x denně, těžká práce)
        };

        return bmr * (multipliers[activityLevel] || 1.2);
    },

    // Get activity level info
    getActivityLevelInfo(level) {
        const levels = {
            sedentary: {
                name: 'Sedentární',
                description: 'Téměř žádný pohyb, sedavá práce',
                multiplier: 1.2
            },
            light: {
                name: 'Lehká aktivita',
                description: 'Cvičení 1-3x týdně',
                multiplier: 1.375
            },
            moderate: {
                name: 'Středně aktivní',
                description: 'Cvičení 3-5x týdně',
                multiplier: 1.55
            },
            active: {
                name: 'Velmi aktivní',
                description: 'Cvičení 6-7x týdně',
                multiplier: 1.725
            },
            veryActive: {
                name: 'Extra aktivní',
                description: '2x denně, těžká fyzická práce',
                multiplier: 1.9
            }
        };

        return levels[level] || levels.sedentary;
    },

    // Calculate caloric deficit/surplus for weight goal
    calculateCaloricAdjustment(currentWeight, targetWeight, weeksToGoal) {
        if (!currentWeight || !targetWeight || !weeksToGoal) return null;

        const weightDiff = targetWeight - currentWeight;
        const totalCalories = weightDiff * 7700; // 1kg fat = ~7700 kcal
        const dailyAdjustment = totalCalories / (weeksToGoal * 7);

        return {
            weightDiff: weightDiff,
            dailyAdjustment: Math.round(dailyAdjustment),
            weeklyWeightChange: Math.round((weightDiff / weeksToGoal) * 10) / 10,
            isDeficit: dailyAdjustment < 0,
            isSafe: Math.abs(dailyAdjustment) <= 1000 // Max 1000 kcal deficit/surplus
        };
    },

    // Calculate macronutrients
    calculateMacros(calories, goal) {
        if (!calories) return null;

        // Different macro ratios for different goals
        const ratios = {
            weightLoss: { protein: 0.30, carbs: 0.35, fat: 0.35 },      // Vyšší protein pro hubnutí
            maintenance: { protein: 0.25, carbs: 0.45, fat: 0.30 },     // Vyvážená strava
            muscleGain: { protein: 0.30, carbs: 0.50, fat: 0.20 }       // Více sacharidů pro růst
        };

        const ratio = ratios[goal] || ratios.maintenance;

        return {
            protein: {
                calories: Math.round(calories * ratio.protein),
                grams: Math.round((calories * ratio.protein) / 4),  // 1g protein = 4 kcal
                percentage: ratio.protein * 100
            },
            carbs: {
                calories: Math.round(calories * ratio.carbs),
                grams: Math.round((calories * ratio.carbs) / 4),    // 1g carbs = 4 kcal
                percentage: ratio.carbs * 100
            },
            fat: {
                calories: Math.round(calories * ratio.fat),
                grams: Math.round((calories * ratio.fat) / 9),      // 1g fat = 9 kcal
                percentage: ratio.fat * 100
            }
        };
    },

    // Calculate recommended water intake (liters per day)
    calculateWaterIntake(weight, activityLevel) {
        if (!weight) return null;

        // Base: 30-35ml per kg of body weight
        let baseWater = weight * 0.033; // 33ml per kg (middle ground)

        // Adjust for activity
        const activityMultipliers = {
            sedentary: 1.0,
            light: 1.1,
            moderate: 1.2,
            active: 1.3,
            veryActive: 1.4
        };

        const multiplier = activityMultipliers[activityLevel] || 1.0;
        return Math.round(baseWater * multiplier * 10) / 10;
    },

    // Get measurement history for charts
    getMeasurementHistory(field, limit = 10) {
        const measurements = this.getAll();
        if (!measurements || measurements.length === 0) return [];

        return measurements
            .slice(-limit)
            .filter(m => m[field] != null)
            .map(m => ({
                date: m.date,
                value: m[field]
            }));
    }
};

// Export for use in other files
window.BodyMeasurements = BodyMeasurements;
