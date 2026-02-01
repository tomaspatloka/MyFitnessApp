// === BODY MEASUREMENTS UI RENDERING ===

// Render body measurements section in Progress tab
function renderBodyMeasurementsSection() {
    if (typeof BodyMeasurements === 'undefined') {
        return '';
    }

    BodyMeasurements.init();

    const latest = BodyMeasurements.getLatest();
    const weight = getCurrentWeight();
    const height = AppState.userData.height;
    const gender = AppState.userData.gender || 'male';

    // Calculate all metrics
    const bmi = BodyMeasurements.calculateBMI(weight, height);
    const bmiInfo = BodyMeasurements.getBMICategory(bmi);

    const whtr = latest?.waist ? BodyMeasurements.calculateWHtR(latest.waist, height) : null;
    const whtrInfo = BodyMeasurements.getWHtRCategory(whtr);

    const whr = (latest?.waist && latest?.hips) ? BodyMeasurements.calculateWHR(latest.waist, latest.hips) : null;
    const whrInfo = BodyMeasurements.getWHRCategory(whr, gender);

    const bodyFat = (latest?.waist && latest?.neck)
        ? BodyMeasurements.calculateBodyFat(gender, latest.waist, latest.neck, latest.hips, height)
        : null;
    const bodyFatInfo = BodyMeasurements.getBodyFatCategory(bodyFat, gender);

    const leanMass = bodyFat ? BodyMeasurements.calculateLeanBodyMass(weight, bodyFat) : null;
    const fatMass = bodyFat ? BodyMeasurements.calculateFatMass(weight, bodyFat) : null;

    const changes = BodyMeasurements.getMeasurementChange();

    return `
        <!-- Body Measurements Section -->
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">
                    <span class="material-symbols-outlined">straighten</span>
                    Měření těla a kalkulačky
                </h2>
            </div>

            <!-- Gender Toggle -->
            <div style="margin-bottom: 16px;">
                <label style="font-size: 0.9rem; font-weight: 500; margin-bottom: 8px; display: block;">Pohlaví</label>
                <div class="gender-toggle">
                    <button class="gender-option ${gender === 'male' ? 'active' : ''}" onclick="updateGender('male')">
                        Muž
                    </button>
                    <button class="gender-option ${gender === 'female' ? 'active' : ''}" onclick="updateGender('female')">
                        Žena
                    </button>
                </div>
            </div>

            ${latest ? `
                <!-- Current Measurements -->
                <h3 style="font-weight: 500; margin: 24px 0 12px 0; font-size: 1.1rem;">Aktuální míry</h3>
                <div class="measurement-grid">
                    ${latest.waist ? `
                        <div class="measurement-card">
                            <div class="measurement-icon">📏</div>
                            <div class="measurement-value">${latest.waist.toFixed(1)}</div>
                            <div class="measurement-label">Pas</div>
                            ${changes?.waist ? `<span class="measurement-change ${changes.waist > 0 ? 'positive' : 'negative'}">${BodyMeasurements.formatChange(changes.waist)}</span>` : ''}
                        </div>
                    ` : ''}
                    ${latest.hips ? `
                        <div class="measurement-card">
                            <div class="measurement-icon">📐</div>
                            <div class="measurement-value">${latest.hips.toFixed(1)}</div>
                            <div class="measurement-label">Boky</div>
                            ${changes?.hips ? `<span class="measurement-change ${changes.hips > 0 ? 'positive' : 'negative'}">${BodyMeasurements.formatChange(changes.hips)}</span>` : ''}
                        </div>
                    ` : ''}
                    ${latest.neck ? `
                        <div class="measurement-card">
                            <div class="measurement-icon">🦒</div>
                            <div class="measurement-value">${latest.neck.toFixed(1)}</div>
                            <div class="measurement-label">Krk</div>
                        </div>
                    ` : ''}
                    ${latest.chest ? `
                        <div class="measurement-card">
                            <div class="measurement-icon">💪</div>
                            <div class="measurement-value">${latest.chest.toFixed(1)}</div>
                            <div class="measurement-label">Hrudník</div>
                            ${changes?.chest ? `<span class="measurement-change ${changes.chest > 0 ? 'positive' : 'negative'}">${BodyMeasurements.formatChange(changes.chest)}</span>` : ''}
                        </div>
                    ` : ''}
                    ${latest.arms ? `
                        <div class="measurement-card">
                            <div class="measurement-icon">💪</div>
                            <div class="measurement-value">${latest.arms.toFixed(1)}</div>
                            <div class="measurement-label">Paže</div>
                            ${changes?.arms ? `<span class="measurement-change ${changes.arms > 0 ? 'positive' : 'negative'}">${BodyMeasurements.formatChange(changes.arms)}</span>` : ''}
                        </div>
                    ` : ''}
                    ${latest.thighs ? `
                        <div class="measurement-card">
                            <div class="measurement-icon">🦵</div>
                            <div class="measurement-value">${latest.thighs.toFixed(1)}</div>
                            <div class="measurement-label">Stehno</div>
                            ${changes?.thighs ? `<span class="measurement-change ${changes.thighs > 0 ? 'positive' : 'negative'}">${BodyMeasurements.formatChange(changes.thighs)}</span>` : ''}
                        </div>
                    ` : ''}
                </div>
            ` : `
                <div class="info-box">
                    <div class="info-box-title">
                        <span class="material-symbols-outlined">info</span>
                        Zatím nemáte žádná měření
                    </div>
                    <div class="info-box-content">
                        Klikněte na tlačítko níže pro přidání prvního měření těla.
                    </div>
                </div>
            `}

            <button class="button filled-button full" onclick="showMeasurementsModal()" style="margin-top: 16px;">
                <span class="material-symbols-outlined">add</span>
                ${latest ? 'Přidat nové měření' : 'Přidat první měření'}
            </button>
        </div>

        <!-- Calculators -->
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">
                    <span class="material-symbols-outlined">calculate</span>
                    Zdravotní ukazatele
                </h2>
            </div>

            <!-- BMI Calculator -->
            <div class="calculator-card">
                <div class="calculator-header">
                    <div class="calculator-icon">⚖️</div>
                    <div class="calculator-title">
                        <h3>BMI (Body Mass Index)</h3>
                        <p>Index tělesné hmotnosti</p>
                    </div>
                </div>
                ${bmi ? `
                    <div class="calculator-result">
                        <div class="calculator-result-value">${bmi.toFixed(1)}</div>
                        <div class="calculator-result-label">Body Mass Index</div>
                    </div>
                    <div class="calculator-status" style="background-color: ${bmiInfo.color}20; border-color: ${bmiInfo.color};">
                        <div class="calculator-status-title" style="color: ${bmiInfo.color};">${bmiInfo.category}</div>
                        <div class="calculator-status-description">${bmiInfo.risk}</div>
                    </div>
                ` : '<p style="text-align: center; color: var(--md-sys-color-on-surface-variant); padding: 20px;">Zadejte váhu a výšku</p>'}
                <div class="info-box">
                    <div class="info-box-content">
                        BMI nerozlišuje mezi svalovou hmotou a tukem. Pro přesnější odhad použijte WHtR a Body Fat %.
                    </div>
                </div>
            </div>

            <!-- WHtR Calculator -->
            <div class="calculator-card">
                <div class="calculator-header">
                    <div class="calculator-icon">📏</div>
                    <div class="calculator-title">
                        <h3>WHtR (Waist-to-Height Ratio)</h3>
                        <p>Poměr pasu k výšce - přesnější než BMI</p>
                    </div>
                </div>
                ${whtr ? `
                    <div class="calculator-result">
                        <div class="calculator-result-value">${whtr.toFixed(3)}</div>
                        <div class="calculator-result-label">Poměr pasu k výšce</div>
                    </div>
                    <div class="calculator-status" style="background-color: ${whtrInfo.color}20; border-color: ${whtrInfo.color};">
                        <div class="calculator-status-title" style="color: ${whtrInfo.color};">${whtrInfo.category}</div>
                        <div class="calculator-status-description">${whtrInfo.risk}</div>
                    </div>
                    <div class="info-box">
                        <div class="info-box-content">
                            <strong>Ideální hodnota:</strong> < 0.5 (pas by měl být menší než polovina výšky)<br>
                            <strong>Váš pas:</strong> ${latest.waist.toFixed(1)} cm | <strong>Polovina výšky:</strong> ${(height / 2).toFixed(1)} cm
                        </div>
                    </div>
                ` : '<p style="text-align: center; color: var(--md-sys-color-on-surface-variant); padding: 20px;">Zadejte obvod pasu</p>'}
            </div>

            <!-- WHR Calculator -->
            ${latest?.waist && latest?.hips ? `
                <div class="calculator-card">
                    <div class="calculator-header">
                        <div class="calculator-icon">🍐</div>
                        <div class="calculator-title">
                            <h3>WHR (Waist-to-Hip Ratio)</h3>
                            <p>Poměr pasu k bokům - typ postavy</p>
                        </div>
                    </div>
                    <div class="calculator-result">
                        <div class="calculator-result-value">${whr.toFixed(3)}</div>
                        <div class="calculator-result-label">Poměr pasu k bokům</div>
                    </div>
                    <div class="calculator-status" style="background-color: ${whrInfo.color}20; border-color: ${whrInfo.color};">
                        <div class="calculator-status-title" style="color: ${whrInfo.color};">${whrInfo.category} - Typ: ${whrInfo.shape}</div>
                        <div class="calculator-status-description">${whrInfo.risk}</div>
                    </div>
                    <div class="body-shape-indicator">
                        <div class="body-shape-option ${whrInfo.shape === 'Hruška' ? 'active' : ''}">
                            <div class="body-shape-icon">🍐</div>
                            <div class="body-shape-label">Hruška</div>
                        </div>
                        <div class="body-shape-option ${whrInfo.shape === 'Jablko' ? 'active' : ''}">
                            <div class="body-shape-icon">🍎</div>
                            <div class="body-shape-label">Jablko</div>
                        </div>
                    </div>
                    <div class="info-box">
                        <div class="info-box-content">
                            <strong>Zdravá hodnota:</strong> Muži < 0.90, Ženy < 0.85
                        </div>
                    </div>
                </div>
            ` : ''}

            <!-- Body Fat % Calculator -->
            ${bodyFat ? `
                <div class="calculator-card">
                    <div class="calculator-header">
                        <div class="calculator-icon">🎯</div>
                        <div class="calculator-title">
                            <h3>Body Fat % (US Navy metoda)</h3>
                            <p>Procento tělesného tuku</p>
                        </div>
                    </div>
                    <div class="calculator-result">
                        <div class="calculator-result-value">${bodyFat.toFixed(1)}%</div>
                        <div class="calculator-result-label">Tělesný tuk</div>
                    </div>
                    <div class="calculator-status" style="background-color: ${bodyFatInfo.color}20; border-color: ${bodyFatInfo.color};">
                        <div class="calculator-status-title" style="color: ${bodyFatInfo.color};">${bodyFatInfo.category}</div>
                        <div class="calculator-status-description">${bodyFatInfo.description}</div>
                    </div>
                    ${leanMass && fatMass ? `
                        <div class="comparison-chart">
                            <div class="comparison-item">
                                <div class="comparison-label">Svalová hmota</div>
                                <div class="comparison-bar-container">
                                    <div class="comparison-bar-fill" style="width: ${(leanMass/weight)*100}%; background: #4CAF50;"></div>
                                </div>
                                <div class="comparison-value">${leanMass.toFixed(1)} kg</div>
                            </div>
                            <div class="comparison-item">
                                <div class="comparison-label">Tuk</div>
                                <div class="comparison-bar-container">
                                    <div class="comparison-bar-fill" style="width: ${(fatMass/weight)*100}%; background: #FF9800;"></div>
                                </div>
                                <div class="comparison-value">${fatMass.toFixed(1)} kg</div>
                            </div>
                        </div>
                    ` : ''}
                    <div class="info-box">
                        <div class="info-box-content">
                            Odhad pomocí US Navy metody (obvody). Pro přesnější měření použijte DEXA sken nebo bioimpedanci.
                        </div>
                    </div>
                </div>
            ` : ''}
        </div>

        ${renderAdvancedCalculators()}
        ${renderMeasurementCharts()}
    `;
}

// Render advanced calculators
function renderAdvancedCalculators() {
    if (typeof BodyMeasurements === 'undefined') return '';

    const weight = getCurrentWeight();
    const height = AppState.userData.height;
    const age = AppState.userData.age;
    const gender = AppState.userData.gender || 'male';
    const targetWeight = AppState.userData.targetWeight || weight;
    const activityLevel = AppState.userData.activityLevel || 'moderate';

    const bmr = BodyMeasurements.calculateBMR(weight, height, age, gender);
    const tdee = bmr ? BodyMeasurements.calculateTDEE(bmr, activityLevel) : null;
    const waterIntake = BodyMeasurements.calculateWaterIntake(weight, activityLevel);

    // Calculate caloric adjustment for goal
    const weeksToGoal = 12; // Default 12 weeks
    const caloricAdj = BodyMeasurements.calculateCaloricAdjustment(weight, targetWeight, weeksToGoal);
    const targetCalories = tdee && caloricAdj ? tdee + caloricAdj.dailyAdjustment : tdee;

    const macros = targetCalories ? BodyMeasurements.calculateMacros(targetCalories, 'weightLoss') : null;
    const activityInfo = BodyMeasurements.getActivityLevelInfo(activityLevel);

    return `
        <!-- Advanced Calculators -->
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">
                    <span class="material-symbols-outlined">local_fire_department</span>
                    Kalorické potřeby a makra
                </h2>
            </div>

            <!-- Activity Level Selector -->
            <div style="margin-bottom: 24px;">
                <label style="font-size: 0.9rem; font-weight: 500; margin-bottom: 12px; display: block;">
                    Úroveň aktivity
                </label>
                <select id="activityLevelSelect" class="text-field" onchange="updateActivityLevel(this.value)" style="width: 100%;">
                    <option value="sedentary" ${activityLevel === 'sedentary' ? 'selected' : ''}>Sedentární - Téměř žádný pohyb</option>
                    <option value="light" ${activityLevel === 'light' ? 'selected' : ''}>Lehká - Cvičení 1-3x týdně</option>
                    <option value="moderate" ${activityLevel === 'moderate' ? 'selected' : ''}>Středně aktivní - Cvičení 3-5x týdně</option>
                    <option value="active" ${activityLevel === 'active' ? 'selected' : ''}>Velmi aktivní - Cvičení 6-7x týdně</option>
                    <option value="veryActive" ${activityLevel === 'veryActive' ? 'selected' : ''}>Extra aktivní - 2x denně</option>
                </select>
            </div>

            ${bmr && tdee ? `
                <!-- BMR & TDEE -->
                <div class="calculator-card">
                    <div class="calculator-header">
                        <div class="calculator-icon">🔥</div>
                        <div class="calculator-title">
                            <h3>BMR & TDEE</h3>
                            <p>Bazální metabolismus a celkový denní výdej</p>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                        <div style="text-align: center; padding: 16px; background: var(--md-sys-color-surface-variant); border-radius: 12px;">
                            <div style="font-size: 0.85rem; margin-bottom: 4px; color: var(--md-sys-color-on-surface-variant);">BMR</div>
                            <div style="font-size: 2rem; font-weight: 700; color: var(--md-sys-color-primary);">${Math.round(bmr)}</div>
                            <div style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);">kcal/den</div>
                        </div>
                        <div style="text-align: center; padding: 16px; background: var(--md-sys-color-primary-container); border-radius: 12px;">
                            <div style="font-size: 0.85rem; margin-bottom: 4px; color: var(--md-sys-color-on-primary-container);">TDEE</div>
                            <div style="font-size: 2rem; font-weight: 700; color: var(--md-sys-color-on-primary-container);">${Math.round(tdee)}</div>
                            <div style="font-size: 0.75rem; color: var(--md-sys-color-on-primary-container);">kcal/den</div>
                        </div>
                    </div>

                    <div class="info-box">
                        <div class="info-box-content">
                            <strong>BMR:</strong> Kalorie potřebné v klidu (spánek, dýchání)<br>
                            <strong>TDEE:</strong> Celkový denní výdej s aktivitou (${activityInfo.name})
                        </div>
                    </div>
                </div>

                ${caloricAdj && targetCalories ? `
                    <!-- Caloric Goal -->
                    <div class="calculator-card">
                        <div class="calculator-header">
                            <div class="calculator-icon">${caloricAdj.isDeficit ? '📉' : '📈'}</div>
                            <div class="calculator-title">
                                <h3>Kalorický ${caloricAdj.isDeficit ? 'deficit' : 'surplus'} pro cíl</h3>
                                <p>Z ${weight.toFixed(1)} kg → ${targetWeight} kg za ${weeksToGoal} týdnů</p>
                            </div>
                        </div>

                        <div class="calculator-result">
                            <div class="calculator-result-value">${Math.round(targetCalories)}</div>
                            <div class="calculator-result-label">Cílový denní příjem kalorií</div>
                        </div>

                        <div class="calculator-status" style="background-color: ${caloricAdj.isSafe ? '#4CAF50' : '#FF9800'}20; border-color: ${caloricAdj.isSafe ? '#4CAF50' : '#FF9800'};">
                            <div class="calculator-status-title" style="color: ${caloricAdj.isSafe ? '#4CAF50' : '#FF9800'};">
                                ${caloricAdj.isDeficit ? '' : '+'} ${Math.abs(caloricAdj.dailyAdjustment)} kcal/den
                            </div>
                            <div class="calculator-status-description">
                                Týdenní změna: ${caloricAdj.weeklyWeightChange > 0 ? '+' : ''}${caloricAdj.weeklyWeightChange} kg
                                ${!caloricAdj.isSafe ? ' ⚠️ Příliš rychlá změna!' : ''}
                            </div>
                        </div>

                        ${!caloricAdj.isSafe ? `
                            <div class="info-box" style="border-color: #FF9800;">
                                <div class="info-box-title" style="color: #FF9800;">
                                    <span class="material-symbols-outlined">warning</span>
                                    Varování
                                </div>
                                <div class="info-box-content">
                                    Doporučujeme maximální deficit/surplus 1000 kcal/den pro zdravé hubnutí/nabírání.
                                </div>
                            </div>
                        ` : ''}
                    </div>
                ` : ''}

                ${macros ? `
                    <!-- Macronutrients -->
                    <div class="calculator-card">
                        <div class="calculator-header">
                            <div class="calculator-icon">🍽️</div>
                            <div class="calculator-title">
                                <h3>Makronutrienty</h3>
                                <p>Doporučené rozdělení pro hubnutí</p>
                            </div>
                        </div>

                        <div style="margin-bottom: 16px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding: 12px; background: #4CAF5020; border-radius: 8px;">
                                <div>
                                    <strong>Proteiny</strong>
                                    <div style="font-size: 0.85rem; color: var(--md-sys-color-on-surface-variant);">${macros.protein.percentage}% kalorií</div>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-size: 1.5rem; font-weight: 700; color: #4CAF50;">${macros.protein.grams}g</div>
                                    <div style="font-size: 0.75rem;">${macros.protein.calories} kcal</div>
                                </div>
                            </div>

                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding: 12px; background: #2196F320; border-radius: 8px;">
                                <div>
                                    <strong>Sacharidy</strong>
                                    <div style="font-size: 0.85rem; color: var(--md-sys-color-on-surface-variant);">${macros.carbs.percentage}% kalorií</div>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-size: 1.5rem; font-weight: 700; color: #2196F3;">${macros.carbs.grams}g</div>
                                    <div style="font-size: 0.75rem;">${macros.carbs.calories} kcal</div>
                                </div>
                            </div>

                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #FF980820; border-radius: 8px;">
                                <div>
                                    <strong>Tuky</strong>
                                    <div style="font-size: 0.85rem; color: var(--md-sys-color-on-surface-variant);">${macros.fat.percentage}% kalorií</div>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-size: 1.5rem; font-weight: 700; color: #FF9800;">${macros.fat.grams}g</div>
                                    <div style="font-size: 0.75rem;">${macros.fat.calories} kcal</div>
                                </div>
                            </div>
                        </div>

                        <div class="info-box">
                            <div class="info-box-content">
                                <strong>Protein:</strong> Sytí, zachovává svaly při hubnutí<br>
                                <strong>Sacharidy:</strong> Energie pro trénink<br>
                                <strong>Tuky:</strong> Hormony, vstřebávání vitamínů
                            </div>
                        </div>
                    </div>
                ` : ''}

                ${waterIntake ? `
                    <!-- Water Intake -->
                    <div class="calculator-card">
                        <div class="calculator-header">
                            <div class="calculator-icon">💧</div>
                            <div class="calculator-title">
                                <h3>Doporučený příjem vody</h3>
                                <p>Na základě váhy a aktivity</p>
                            </div>
                        </div>

                        <div class="calculator-result">
                            <div class="calculator-result-value">${waterIntake}</div>
                            <div class="calculator-result-label">litrů vody denně</div>
                        </div>

                        <div style="text-align: center; margin-top: 16px;">
                            <div style="display: inline-flex; gap: 8px;">
                                ${'💧'.repeat(Math.min(Math.ceil(waterIntake), 10))}
                            </div>
                        </div>

                        <div class="info-box">
                            <div class="info-box-content">
                                Dostatečná hydratace zlepšuje výkon, metabolismus a regeneraci.
                            </div>
                        </div>
                    </div>
                ` : ''}
            ` : `
                <div class="info-box">
                    <div class="info-box-title">
                        <span class="material-symbols-outlined">info</span>
                        Zadejte osobní údaje
                    </div>
                    <div class="info-box-content">
                        Pro výpočet BMR a TDEE zadejte váhu, výšku a věk v Nastavení.
                    </div>
                </div>
            `}
        </div>
    `;
}

// Render measurement charts
function renderMeasurementCharts() {
    if (typeof BodyMeasurements === 'undefined') return '';

    const measurements = BodyMeasurements.getAll();
    if (measurements.length < 2) return '';

    return `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">
                    <span class="material-symbols-outlined">show_chart</span>
                    Grafy vývoje měření
                </h2>
            </div>

            <!-- Waist Chart -->
            ${measurements.some(m => m.waist) ? `
                <h3 style="font-weight: 500; margin: 16px 0 12px 0; font-size: 1rem;">Obvod pasu</h3>
                <div style="position: relative; height: 200px; margin-bottom: 24px;">
                    <canvas id="waistChart"></canvas>
                </div>
            ` : ''}

            <!-- Body Fat Chart -->
            ${measurements.some(m => m.waist && m.neck) ? `
                <h3 style="font-weight: 500; margin: 16px 0 12px 0; font-size: 1rem;">Procento tělesného tuku</h3>
                <div style="position: relative; height: 200px; margin-bottom: 24px;">
                    <canvas id="bodyFatChart"></canvas>
                </div>
            ` : ''}

            <div class="info-box">
                <div class="info-box-content">
                    Grafy se zobrazí po přidání alespoň 2 měření.
                </div>
            </div>
        </div>
    `;
}

// Render charts using Chart.js
function renderMeasurementChartsJS() {
    if (typeof Chart === 'undefined' || typeof BodyMeasurements === 'undefined') return;

    const measurements = BodyMeasurements.getAll();
    if (measurements.length < 2) return;

    // Waist chart
    const waistData = measurements.filter(m => m.waist);
    if (waistData.length >= 2) {
        setTimeout(() => {
            const ctx = document.getElementById('waistChart');
            if (!ctx) return;

            if (window.waistChartInstance) {
                window.waistChartInstance.destroy();
            }

            window.waistChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: waistData.map(m => {
                        const d = new Date(m.date);
                        return `${d.getDate()}.${d.getMonth() + 1}`;
                    }),
                    datasets: [{
                        label: 'Obvod pasu (cm)',
                        data: waistData.map(m => m.waist),
                        borderColor: '#FF9800',
                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                        tension: 0.3,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            ticks: {
                                callback: v => v.toFixed(1) + ' cm'
                            }
                        }
                    }
                }
            });
        }, 100);
    }

    // Body fat chart
    const height = AppState.userData.height;
    const gender = AppState.userData.gender || 'male';
    const bodyFatData = measurements
        .filter(m => m.waist && m.neck && m.weight)
        .map(m => ({
            date: m.date,
            bodyFat: BodyMeasurements.calculateBodyFat(gender, m.waist, m.neck, m.hips, height)
        }))
        .filter(m => m.bodyFat);

    if (bodyFatData.length >= 2) {
        setTimeout(() => {
            const ctx = document.getElementById('bodyFatChart');
            if (!ctx) return;

            if (window.bodyFatChartInstance) {
                window.bodyFatChartInstance.destroy();
            }

            window.bodyFatChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: bodyFatData.map(m => {
                        const d = new Date(m.date);
                        return `${d.getDate()}.${d.getMonth() + 1}`;
                    }),
                    datasets: [{
                        label: 'Tělesný tuk (%)',
                        data: bodyFatData.map(m => m.bodyFat),
                        borderColor: '#4CAF50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        tension: 0.3,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            ticks: {
                                callback: v => v.toFixed(1) + '%'
                            }
                        }
                    }
                }
            });
        }, 150);
    }
}

// Show measurements modal
function showMeasurementsModal() {
    const dateInput = document.getElementById('measurementDate');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }

    // Pre-fill with latest values if available
    const latest = BodyMeasurements.getLatest();
    if (latest) {
        const fields = ['waist', 'hips', 'neck', 'chest', 'arms', 'thighs'];
        fields.forEach(field => {
            const input = document.getElementById(`measurement${field.charAt(0).toUpperCase() + field.slice(1)}`);
            if (input && latest[field]) {
                input.value = latest[field];
            }
        });
    }

    showModal('measurementsModal');
}

// Save body measurement
function saveBodyMeasurement() {
    const date = document.getElementById('measurementDate').value;
    const waist = document.getElementById('measurementWaist').value;
    const hips = document.getElementById('measurementHips').value;
    const neck = document.getElementById('measurementNeck').value;
    const chest = document.getElementById('measurementChest').value;
    const arms = document.getElementById('measurementArms').value;
    const thighs = document.getElementById('measurementThighs').value;

    if (!date) {
        showNotification('Zadejte datum měření');
        return;
    }

    if (!waist && !hips && !neck && !chest && !arms && !thighs) {
        showNotification('Zadejte alespoň jedno měření');
        return;
    }

    BodyMeasurements.addMeasurement({
        date,
        waist,
        hips,
        neck,
        chest,
        arms,
        thighs,
        weight: getCurrentWeight()
    });

    closeModal('measurementsModal');
    showNotification('Měření uloženo! 📏');

    // Refresh progress tab
    if (AppState.currentTab === 'progress') {
        renderProgress();
    }
}

// Update gender
function updateGender(gender) {
    AppState.userData.gender = gender;
    saveData();
    if (AppState.currentTab === 'progress') {
        renderProgress();
    }
}

// Update activity level
function updateActivityLevel(level) {
    AppState.userData.activityLevel = level;
    saveData();
    if (AppState.currentTab === 'progress') {
        renderProgress();
    }
}

// Export functions
window.renderBodyMeasurementsSection = renderBodyMeasurementsSection;
window.renderAdvancedCalculators = renderAdvancedCalculators;
window.renderMeasurementCharts = renderMeasurementCharts;
window.renderMeasurementChartsJS = renderMeasurementChartsJS;
window.showMeasurementsModal = showMeasurementsModal;
window.saveBodyMeasurement = saveBodyMeasurement;
window.updateGender = updateGender;
window.updateActivityLevel = updateActivityLevel;
