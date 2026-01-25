"use strict";

// === APP STATE ===
const AppState = {
    currentWeek: 1,
    currentTab: 'dashboard',
    userData: {
        weight: 115,
        height: 191,
        age: 47,
        targetWeight: 100
    },
    completionData: {},
    weightLogs: [],
    testResults: [],
    settings: {
        notifications: false,
        darkMode: false,
        autoSave: true,
        showTips: true,
        winterMode: true
    }
};

let deferredPrompt;
let timerInterval;
let timerTime = 0;

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', function () {
    initApp();
    loadInitialData();
    renderDashboard();

    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
            const exerciseModal = document.getElementById('exerciseModal');
            if (exerciseModal && !exerciseModal.classList.contains('active')) {
                clearInterval(timerInterval);
            }
        }

        const fabContainer = document.querySelector('.fab-container');
        const fabMain = document.getElementById('fabMain');
        const fabOptions = document.getElementById('fabOptions');

        if (fabContainer && fabOptions && fabMain &&
            !fabContainer.contains(e.target) &&
            !e.target.closest('.fab-option')) {
            fabOptions.classList.remove('show');
            document.getElementById('fabIcon').textContent = 'add';
        }
    });

    if (Notification.permission === 'granted') {
        AppState.settings.notifications = true;
    }

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        const installBtn = document.getElementById('installBtn');
        if (installBtn) installBtn.style.display = 'flex';
    });

    // Ensure all modals are closed on startup
    closeAllModals();
});

function initApp() {
    const saved = localStorage.getItem('fitnessAppData');
    if (saved) {
        const parsed = JSON.parse(saved);
        Object.assign(AppState, parsed);
    } else {
        initializeDefaultData();
    }

    if (AppState.settings.darkMode) {
        document.body.classList.add('dark-mode');
    }

    const weightDateInput = document.getElementById('weightDate');
    if (weightDateInput) {
        weightDateInput.value = new Date().toISOString().split('T')[0];
    }
}

function loadInitialData() {
    if (!AppState.completionData[AppState.currentWeek]) {
        initializeWeekData(AppState.currentWeek);
    }
}

function initializeDefaultData() {
    initializeWeekData(1);

    if (!AppState.weightLogs || AppState.weightLogs.length === 0) {
        AppState.weightLogs = [
            { date: new Date().toISOString().split('T')[0], weight: 115, note: "Start programu" }
        ];
    }

    if (!AppState.testResults || AppState.testResults.length === 0) {
        AppState.testResults = [
            { date: new Date().toISOString().split('T')[0], pushups: 5, situps: 12, running: 1400, swim: 0 }
        ];
    }

    saveData();
}

function initializeWeekData(weekNumber) {
    AppState.completionData[weekNumber] = {
        monday: {
            completed: 0,
            total: 6,
            exercises: [
                { id: 1, title: "Ranní aktivace", time: "morning", done: false, details: "5-10 min dynamického rozcvičení" },
                { id: 2, title: "Dechová cvičení", time: "morning", done: false, details: "5 min pro aktivaci core" },
                { id: 3, title: "Kliky na stěně", time: "evening", done: false, details: "3 série × 12 opakování" },
                { id: 4, title: "Kliky na kolenou", time: "evening", done: false, details: "3 série × maximální počet" },
                { id: 5, title: "Prkno", time: "evening", done: false, details: "3 série × 20 sekund" },
                { id: 6, title: "Protahování", time: "evening", done: false, details: "10 minut celkového protažení" }
            ]
        },
        tuesday: {
            completed: 0,
            total: 5,
            exercises: [
                { id: 1, title: "Lehké protažení", time: "morning", done: false, details: "10-15 minut jemného protažení" },
                { id: 2, title: "Mobilita kloubů", time: "morning", done: false, details: "10 minut kroužení kloubů" },
                { id: 3, title: "Rozcvička a zahřátí", time: "evening", done: false, details: "5-10 min dynamického strečinku" },
                { id: 4, title: "Zimní chůze", time: "evening", done: false, details: "30 minut intervalové chůze (3 min + 2 min)" },
                { id: 5, title: "Záznam vzdálenosti", time: "evening", done: false, details: "Ujetá/vzdálenost v metrech" }
            ]
        },
        wednesday: {
            completed: 0,
            total: 7,
            exercises: [
                { id: 1, title: "Ranní aktivace", time: "morning", done: false, details: "10 minut dynamického rozcvičení" },
                { id: 2, title: "Core aktivace", time: "morning", done: false, details: "5 minut dechových cvičení" },
                { id: 3, title: "Dřepy s oporou", time: "evening", done: false, details: "3 série × 15 opakování" },
                { id: 4, title: "Výpady na místě", time: "evening", done: false, details: "3 série × 10 opakování na nohu" },
                { id: 5, title: "Leh-sedy na nakloněné", time: "evening", done: false, details: "3 série × 12 opakování" },
                { id: 6, title: "Boční prkno", time: "evening", done: false, details: "3 série × 25 sekund na stranu" },
                { id: 7, title: "Protahování", time: "evening", done: false, details: "8-10 minut statického protažení" }
            ]
        },
        thursday: {
            completed: 0,
            total: 3,
            exercises: [
                { id: 1, title: "Ranní volno", time: "morning", done: false, details: "Dnes ráno odpočívejte" },
                { id: 2, title: "Plavání v bazénu", time: "evening", done: false, details: "300m nebo alternativní trénink" },
                { id: 3, title: "Regenerace", time: "evening", done: false, details: "Foam rolling + 10 min protažení" }
            ]
        },
        friday: {
            completed: 0,
            total: 8,
            exercises: [
                { id: 1, title: "Ranní aktivace", time: "morning", done: false, details: "10 minut dynamického rozcvičení" },
                { id: 2, title: "Příprava na den", time: "morning", done: false, details: "5 min dechových cvičení" },
                { id: 3, title: "Rozcvička celého těla", time: "afternoon", done: false, details: "8-10 min dynamického strečinku" },
                { id: 4, title: "Kliky (jakákoli varianta)", time: "afternoon", done: false, details: "3 série × maximální počet" },
                { id: 5, title: "Dřepy (s oporou nebo bez)", time: "afternoon", done: false, details: "3 série × 12-15 opakování" },
                { id: 6, title: "Prkno varianta", time: "afternoon", done: false, details: "3 série × 30-45 sekund" },
                { id: 7, title: "Výpady v chůzi", time: "afternoon", done: false, details: "3 série × 8 výpadů na nohu" },
                { id: 8, title: "Kompletní protažení", time: "afternoon", done: false, details: "10-12 minut celkového protažení" }
            ]
        },
        saturday: {
            completed: 0,
            total: 5,
            exercises: [
                { id: 1, title: "Vytrvalostní aktivita", time: "morning", done: false, details: "45-60 minut chůze/svižné chůze" },
                { id: 2, title: "Funkční cvičení", time: "morning", done: false, details: "20-30 minut kruhového tréninku" },
                { id: 3, title: "Aktivní odpočinek", time: "afternoon", done: false, details: "Procházka s rodinou" },
                { id: 4, title: "Regenerační protažení", time: "afternoon", done: false, details: "15 minut jemného protažení" },
                { id: 5, title: "Příprava na týden", time: "afternoon", done: false, details: "Plánování a příprava" }
            ]
        },
        sunday: {
            completed: 0,
            total: 4,
            exercises: [
                { id: 1, title: "Aktivní regenerace", time: "morning", done: false, details: "Lehká procházka 20-30 minut" },
                { id: 2, title: "Kompletní protažení", time: "morning", done: false, details: "20 minut důkladného protažení" },
                { id: 3, title: "Foam rolling", time: "afternoon", done: false, details: "10-15 minut masáže partií" },
                { id: 4, title: "Příprava na pondělí", time: "afternoon", done: false, details: "Kontrola plánu, příprava" }
            ]
        }
    };
}

// === INSTALL APP LOGIC ===
function installApp() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the A2HS prompt');
            }
            deferredPrompt = null;
            document.getElementById('installBtn').style.display = 'none';
        });
    }
}

// === TIMER LOGIC ===
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function startTimer() {
    if (timerInterval) return;
    timerInterval = setInterval(() => {
        timerTime++;
        updateTimerDisplay();
    }, 1000);
    document.querySelector('.timer-start').style.display = 'none';
    document.querySelector('.timer-pause').style.display = 'inline-block';
}

function pauseTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    document.querySelector('.timer-start').style.display = 'inline-block';
    document.querySelector('.timer-start').textContent = 'Pokračovat';
    document.querySelector('.timer-pause').style.display = 'none';
}

function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    timerTime = 0;
    updateTimerDisplay();
    const startBtn = document.querySelector('.timer-start');
    const pauseBtn = document.querySelector('.timer-pause');
    if (startBtn) {
        startBtn.style.display = 'inline-block';
        startBtn.textContent = 'Start';
    }
    if (pauseBtn) {
        pauseBtn.style.display = 'none';
    }
}

function updateTimerDisplay() {
    const display = document.getElementById('timerDisplay');
    if (display) {
        display.textContent = formatTime(timerTime);
    }
}

// === CONFETTI LOGIC ===
function fireConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = [];
    const particleCount = 100;
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`,
            size: Math.random() * 10 + 5,
            velocity: Math.random() * 5 + 2,
            angle: Math.random() * 360
        });
    }
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p, index) => {
            p.y += p.velocity;
            p.angle += p.velocity;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle * Math.PI / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.restore();
            if (p.y > canvas.height) {
                particles.splice(index, 1);
            }
        });
        if (particles.length > 0) {
            requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    animate();
}

// === FAB FUNCTIONS ===
function toggleFab() {
    const fabOptions = document.getElementById('fabOptions');
    const fabIcon = document.getElementById('fabIcon');
    if (fabOptions.classList.contains('show')) {
        fabOptions.classList.remove('show');
        fabIcon.textContent = 'add';
    } else {
        fabOptions.classList.add('show');
        fabIcon.textContent = 'close';
    }
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });

    // Also stop timer if exercise modal was open
    clearInterval(timerInterval);
}

// === TAB NAVIGATION ===
function switchTab(tabName, evt) {
    AppState.currentTab = tabName;
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    const tabs = document.querySelectorAll('.tab');
    for (let tab of tabs) {
        if (tab.onclick && tab.onclick.toString().includes(`'${tabName}'`)) {
            tab.classList.add('active');
            break;
        }
    }
    if (evt && evt.currentTarget) {
        evt.currentTarget.classList.add('active');
    }
    renderContent(tabName);
}

function renderContent(tabName) {
    const contentEl = document.getElementById('mainContent');
    if (!contentEl) return;
    switch (tabName) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'plan':
            renderPlan();
            break;
        case 'exercises':
            renderCustomExercisesTab();
            break;
        case 'progress':
            renderProgress();
            break;
        case 'settings':
            renderSettings();
            break;
        default:
            renderDashboard();
    }
}

// === RENDER FUNCTIONS ===
function renderDashboard() {
    const today = getToday();
    const weekData = AppState.completionData[AppState.currentWeek];
    const todayData = weekData ? weekData[today.id] : null;

    if (!todayData) {
        document.getElementById('mainContent').innerHTML = `
            <div class="card">
                <h2>Chyba: Data pro dnešní den nejsou k dispozici</h2>
                <button class="button filled-button" onclick="initializeDefaultData(); renderDashboard();">Inicializovat data</button>
            </div>
        `;
        return;
    }

    const currentWeight = getCurrentWeight();
    const weightLoss = (115 - currentWeight).toFixed(1);
    const winterTips = [
        "V zimě se teple oblékejte ve vrstvách.",
        "Při chůzi na sněhu dávejte pozor na uklouznutí.",
        "Pokud je venku příliš zima, cvičte doma.",
        "Zimní období je ideální na budování síly.",
        "Nezapomeňte na dostatek vitamínu D.",
        "Pijte dostatek vody i v zimě.",
        "Před aktivitou se důkladně rozcvičte v teple."
    ];

    // Počet vlastních cviků
    const customExercisesCount = typeof ExerciseManager !== 'undefined' ? ExerciseManager.getAllCustomExercises().length : 0;

    const content = `
        <div class="card card-elevated">
            <div class="card-header">
                <h2 class="card-title">
                    <span class="material-symbols-outlined">analytics</span>
                    Dnešní přehled - ${today.name}
                </h2>
                ${AppState.settings.winterMode ? '<span style="background: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container); padding: 4px 12px; border-radius: 16px; font-size: 0.75rem; display: flex; align-items: center; gap: 4px;"><span class="material-symbols-outlined" style="font-size: 16px;">ac_unit</span> ZIMNÍ REŽIM</span>' : ''}
            </div>
            <div style="display: flex; gap: var(--spacing-sm); margin-bottom: var(--spacing-md); flex-wrap: wrap;">
                <span style="background: var(--md-sys-color-surface-variant); padding: 6px 12px; border-radius: 16px; font-size: 0.75rem;">
                    Týden ${AppState.currentWeek}/12
                </span>
                <span style="background: ${todayData.completed === todayData.total ? 'var(--md-sys-color-success-container)' : 'var(--md-sys-color-secondary-container)'}; color: ${todayData.completed === todayData.total ? 'var(--md-sys-color-on-success-container)' : 'var(--md-sys-color-on-secondary-container)'}; padding: 6px 12px; border-radius: 16px; font-size: 0.75rem;">
                    ${todayData.completed}/${todayData.total} splněno
                </span>
                ${customExercisesCount > 0 ? `
                    <span style="background: var(--md-sys-color-tertiary-container, #ffecb3); color: var(--md-sys-color-on-tertiary-container, #5d4037); padding: 6px 12px; border-radius: 16px; font-size: 0.75rem;">
                        ${customExercisesCount} vlastních cviků
                    </span>
                ` : ''}
            </div>
            
            <div class="progress-container">
                <div class="progress-label">
                    <span>Kliky za 30s</span>
                    <span>${getPushupsScore()} / 16</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(100, (getPushupsScore() / 16 * 100))}%"></div>
                </div>
            </div>
            
            <div class="progress-container">
                <div class="progress-label">
                    <span>Leh-sedy za 60s</span>
                    <span>${getSitupsScore()} / 30</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(100, (getSitupsScore() / 30 * 100))}%"></div>
                </div>
            </div>
            
            <div class="progress-container">
                <div class="progress-label">
                    <span>Chůze 12min (m)</span>
                    <span>${getRunningScore()} / 1600</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(100, (getRunningScore() / 1600 * 100))}%"></div>
                </div>
            </div>
            
            <button class="button filled-button full" onclick="startTodayWorkout()" style="margin-top: var(--spacing-lg);">
                <span class="material-symbols-outlined">flag</span>
                Začít dnešní trénink
            </button>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${currentWeight}</div>
                <div class="stat-label">Aktuální váha</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${weightLoss}</div>
                <div class="stat-label">Zhubl/a</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${getTotalWorkouts()}</div>
                <div class="stat-label">Tréninků</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${getWeekCompletion()}%</div>
                <div class="stat-label">Týden</div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">
                    <span class="material-symbols-outlined">lightbulb</span>
                    ${AppState.settings.winterMode ? 'Zimní tip' : 'Tip pro dnešek'}
                </h2>
            </div>
            <p style="color: var(--md-sys-color-on-surface-variant);">${AppState.settings.winterMode ? winterTips[Math.floor(Math.random() * winterTips.length)] : getDailyTip()}</p>
        </div>
    `;

    document.getElementById('mainContent').innerHTML = content;
}

function renderPlan() {
    const days = [
        { id: 'monday', name: 'Pondělí', icon: 'fitness_center' },
        { id: 'tuesday', name: 'Úterý', icon: 'directions_walk' },
        { id: 'wednesday', name: 'Středa', icon: 'accessibility_new' },
        { id: 'thursday', name: 'Čtvrtek', icon: 'pool' },
        { id: 'friday', name: 'Pátek', icon: 'fitness_center' },
        { id: 'saturday', name: 'Sobota', icon: 'hiking' },
        { id: 'sunday', name: 'Neděle', icon: 'self_improvement' }
    ];

    if (!AppState.completionData[AppState.currentWeek]) {
        initializeWeekData(AppState.currentWeek);
    }

    const weekData = AppState.completionData[AppState.currentWeek];

    let content = `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">
                    <span class="material-symbols-outlined">calendar_month</span>
                    Týdenní plán
                </h2>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-md);">
                <button class="button text-button" onclick="changeWeek(-1)">
                    <span class="material-symbols-outlined">arrow_back</span> Předchozí
                </button>
                <span style="font-weight: 500;">Týden ${AppState.currentWeek}/12</span>
                <button class="button text-button" onclick="changeWeek(1)">
                    Další <span class="material-symbols-outlined">arrow_forward</span>
                </button>
            </div>
            ${AppState.settings.winterMode ? '<p style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant); margin-bottom: var(--spacing-sm);"><em><span class="material-symbols-outlined" style="font-size: 14px; vertical-align: middle;">ac_unit</span> Zimní režim aktivní</em></p>' : ''}
        </div>
    `;

    days.forEach(day => {
        const dayData = weekData[day.id];
        const isToday = day.id === getToday().id;

        if (!dayData) return;

        content += `
            <div id="day-${day.id}" class="day-card" style="${isToday ? 'border: 2px solid var(--md-sys-color-primary);' : ''}">
                <div class="day-header" style="${isToday ? 'background-color: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container);' : ''}">
                    <div class="day-title">
                        <span class="material-symbols-outlined">${day.icon}</span>
                        ${day.name}
                    </div>
                    <div style="font-size: 0.85rem;">
                        ${dayData.completed}/${dayData.total} ${dayData.completed === dayData.total ? '<span class="material-symbols-outlined" style="font-size: 18px; vertical-align: text-bottom;">check_circle</span>' : ''}
                    </div>
                </div>
                <div>
                    ${renderDayExercises(day.id)}
                </div>
                <!-- Tlačítko pro přidání cviku -->
                <button class="quick-add-exercise" onclick="showQuickAddExercise('${day.id}')">
                    <span class="material-symbols-outlined">add</span>
                    Přidat cvik
                </button>
            </div>
        `;
    });

    document.getElementById('mainContent').innerHTML = content;
}

function renderDayExercises(dayId) {
    const weekData = AppState.completionData[AppState.currentWeek];
    if (!weekData || !weekData[dayId] || !weekData[dayId].exercises) return '';

    return weekData[dayId].exercises.map((exercise, index) => `
        <div class="exercise-item" onclick="toggleExercise(${exercise.id}, '${dayId}')">
            <div class="exercise-checkbox ${exercise.done ? 'checked' : ''}">
                ${exercise.done ? '<span class="material-symbols-outlined" style="font-size: 18px; color: white;">check</span>' : ''}
            </div>
            <div class="exercise-content">
                <div class="exercise-title">
                    ${exercise.title}
                    ${exercise.isCustom ? '<span class="custom-badge"><span class="material-symbols-outlined">star</span>vlastní</span>' : ''}
                    <button class="exercise-info-btn" onclick="event.stopPropagation(); showExerciseDetails('${exercise.title}')">
                        <span class="material-symbols-outlined">info</span>
                    </button>
                </div>
                <div class="exercise-details">
                    <span class="time-badge time-${exercise.time}">
                        ${exercise.time === 'morning' ? 'Ráno' : exercise.time === 'evening' ? 'Večer' : 'Odpoledne'}
                    </span>
                    <span>${exercise.details}</span>
                </div>
            </div>
            <!-- Tlačítko pro odstranění cviku -->
            <button class="icon-button-sm exercise-remove-btn" onclick="event.stopPropagation(); removeExerciseFromPlan(${index}, '${dayId}')" title="Odebrat cvik">
                <span class="material-symbols-outlined">close</span>
            </button>
        </div>
    `).join('');
}

// Funkce pro rychlé přidání cviku do dne
function showQuickAddExercise(dayId) {
    if (typeof ExerciseManager === 'undefined') {
        showNotification('Modul pro cviky není načten');
        return;
    }

    const customExercises = ExerciseManager.getAllCustomExercises();

    let content = `
        <h3 style="margin-bottom: var(--spacing-md);">Přidat cvik do ${getDayName(dayId)}</h3>
    `;

    if (customExercises.length === 0) {
        content += `
            <p style="color: var(--md-sys-color-on-surface-variant); margin-bottom: var(--spacing-md);">
                Zatím nemáte žádné vlastní cviky.
            </p>
            <button class="button filled-button full" onclick="closeModal('exerciseModal'); ExerciseManager.openEditor();">
                <span class="material-symbols-outlined">add</span>
                Vytvořit nový cvik
            </button>
        `;
    } else {
        content += `
            <p style="font-size: 0.875rem; color: var(--md-sys-color-on-surface-variant); margin-bottom: var(--spacing-md);">
                Vyberte cvik k přidání:
            </p>
            <div style="display: flex; flex-direction: column; gap: var(--spacing-sm); max-height: 300px; overflow-y: auto;">
                ${customExercises.map(ex => `
                    <button class="day-chip" style="text-align: left; padding: var(--spacing-sm) var(--spacing-md);" 
                            onclick="addCustomExerciseToDay('${ex.id}', '${dayId}'); closeModal('exerciseModal');">
                        <strong>${ex.title}</strong>
                        <br><small style="color: var(--md-sys-color-on-surface-variant);">${ex.details || ex.duration || ex.sets || ''}</small>
                    </button>
                `).join('')}
            </div>
            <div style="margin-top: var(--spacing-md); padding-top: var(--spacing-md); border-top: 1px solid var(--md-sys-color-outline-variant);">
                <button class="button text-button full" onclick="closeModal('exerciseModal'); ExerciseManager.openEditor();">
                    <span class="material-symbols-outlined">add</span>
                    Vytvořit nový cvik
                </button>
            </div>
        `;
    }

    document.getElementById('exerciseModalTitle').textContent = '';
    document.getElementById('exerciseModalContent').innerHTML = content;
    showModal('exerciseModal');
}

function getDayName(dayId) {
    const names = {
        'monday': 'Pondělí',
        'tuesday': 'Úterý',
        'wednesday': 'Středa',
        'thursday': 'Čtvrtek',
        'friday': 'Pátek',
        'saturday': 'Sobota',
        'sunday': 'Neděle'
    };
    return names[dayId] || dayId;
}

function addCustomExerciseToDay(exerciseId, dayId) {
    if (typeof ExerciseManager !== 'undefined') {
        if (ExerciseManager.addExerciseToDay(exerciseId, AppState.currentWeek, dayId)) {
            showNotification('Cvik přidán');
            renderPlan();
        }
    }
}

function removeExerciseFromPlan(exerciseIndex, dayId) {
    if (confirm('Opravdu chcete odebrat tento cvik z plánu?')) {
        if (typeof ExerciseManager !== 'undefined') {
            ExerciseManager.removeExerciseFromDay(exerciseIndex, AppState.currentWeek, dayId);
        } else {
            // Fallback pokud ExerciseManager není k dispozici
            const dayData = AppState.completionData[AppState.currentWeek][dayId];
            if (dayData && dayData.exercises[exerciseIndex]) {
                dayData.exercises.splice(exerciseIndex, 1);
                dayData.total = dayData.exercises.length;
                dayData.completed = dayData.exercises.filter(e => e.done).length;
                dayData.exercises.forEach((ex, idx) => { ex.id = idx + 1; });
                saveData();
            }
        }
        showNotification('Cvik odebrán');
        renderPlan();
    }
}

function renderProgress() {
    const currentWeight = getCurrentWeight();
    const weightLoss = (115 - currentWeight).toFixed(1);
    const weightProgress = Math.min(100, (weightLoss / 15) * 100);
    const pushupsScore = getPushupsScore();
    const situpsScore = getSitupsScore();
    const runningScore = getRunningScore();
    const weightHistory = AppState.weightLogs.slice(-10);

    const content = `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">
                    <span class="material-symbols-outlined">monitoring</span>
                    Progres hubnutí
                </h2>
            </div>
            
            <div class="progress-container">
                <div class="progress-label">
                    <span>Cíl hubnutí (115kg → 100kg)</span>
                    <span>${weightProgress.toFixed(1)}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${weightProgress}%"></div>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 4px; font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);">
                    <span>${currentWeight} kg</span>
                    <span>${weightLoss} kg shazeno</span>
                    <span>${AppState.userData.targetWeight} kg cíl</span>
                </div>
            </div>
            
            <div style="margin-top: var(--spacing-lg);">
                <h3 style="font-weight: 500; margin-bottom: var(--spacing-sm);">Historie váhy</h3>
                <div class="chart-container">
                    ${renderWeightLineChart(weightHistory)}
                </div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">
                    <span class="material-symbols-outlined">emoji_events</span>
                    Výkonnost v testech
                </h2>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--spacing-md); text-align: center;">
                <div>
                    <div style="font-size: 0.75rem;">Kliky</div>
                    <div style="font-size: 24px; font-weight: bold; color: var(--md-sys-color-primary);">${pushupsScore}</div>
                    <div style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);">cíl: 16</div>
                </div>
                <div>
                    <div style="font-size: 0.75rem;">Leh-sedy</div>
                    <div style="font-size: 24px; font-weight: bold; color: var(--md-sys-color-primary);">${situpsScore}</div>
                    <div style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);">cíl: 30</div>
                </div>
                <div>
                    <div style="font-size: 0.75rem;">${AppState.settings.winterMode ? 'Chůze' : 'Běh'}</div>
                    <div style="font-size: 24px; font-weight: bold; color: var(--md-sys-color-primary);">${runningScore}</div>
                    <div style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);">cíl: 1600</div>
                </div>
            </div>
            
            <div style="margin-top: var(--spacing-lg);">
                <h3 style="font-weight: 500; margin-bottom: var(--spacing-sm);">Přidat nový test</h3>
                <div class="form-group">
                    <label class="form-label">Kliky za 30s</label>
                    <input type="number" id="newPushups" class="text-field" placeholder="Počet">
                </div>
                <div class="form-group">
                    <label class="form-label">Leh-sedy za 60s</label>
                    <input type="number" id="newSitups" class="text-field" placeholder="Počet">
                </div>
                <div class="form-group">
                    <label class="form-label">Vzdálenost (m)</label>
                    <input type="number" id="newRunning" class="text-field" placeholder="Metrů">
                </div>
                <button class="button filled-button full" onclick="saveNewTest()">
                    <span class="material-symbols-outlined">save</span>
                    Uložit test
                </button>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">
                    <span class="material-symbols-outlined">flag</span>
                    Milníky
                </h2>
            </div>
            <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
                ${renderMilestone(weightLoss >= 5, 'looks_one', 'Zhubnout 5kg', 5 - weightLoss)}
                ${renderMilestone(weightLoss >= 10, 'looks_two', 'Zhubnout 10kg', 10 - weightLoss)}
                ${renderMilestone(pushupsScore >= 16, 'looks_3', '16 kliků za 30s', 16 - pushupsScore, 'kliků')}
            </div>
        </div>
    `;

    document.getElementById('mainContent').innerHTML = content;
}

function renderMilestone(isDone, iconName, title, remaining, unit = 'kg') {
    return `
        <div style="display: flex; align-items: center; gap: var(--spacing-sm);">
            <div style="width: 32px; height: 32px; background: ${isDone ? 'var(--md-sys-color-success)' : 'var(--md-sys-color-surface-variant)'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: ${isDone ? 'white' : 'var(--md-sys-color-on-surface-variant)'};">
                <span class="material-symbols-outlined" style="font-size: 20px;">${isDone ? 'check' : iconName}</span>
            </div>
            <div style="flex: 1;">
                <div style="font-weight: 500;">${title}</div>
                <div style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);">
                    ${isDone ? 'Splněno!' : `Zbývá ${remaining.toFixed(1)} ${unit}`}
                </div>
            </div>
        </div>
    `;
}

function renderWeightLineChart(weightHistory) {
    if (!weightHistory || weightHistory.length === 0) {
        return '<div style="text-align: center; padding: 20px; color: var(--md-sys-color-outline);">Žádná data o váze</div>';
    }
    const width = 300;
    const height = 150;
    const padding = { top: 20, right: 20, bottom: 40, left: 40 };
    const weights = weightHistory.map(w => w.weight);
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    const range = maxWeight - minWeight || 10;
    const chartMin = minWeight - (range * 0.1);
    const chartMax = maxWeight + (range * 0.1);
    let svg = `<svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" class="line-chart">`;
    for (let i = 0; i <= 4; i++) {
        const y = padding.top + (height - padding.top - padding.bottom) * (i / 4);
        svg += `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="var(--md-sys-color-outline-variant)" stroke-width="1" />`;
        const weightValue = chartMax - (chartMax - chartMin) * (i / 4);
        svg += `<text x="${padding.left - 8}" y="${y + 4}" text-anchor="end" font-size="10" fill="var(--md-sys-color-on-surface-variant)">${weightValue.toFixed(1)}</text>`;
    }
    const points = weightHistory.map((entry, index) => {
        const x = padding.left + (width - padding.left - padding.right) * (index / (weightHistory.length - 1 || 1));
        const y = padding.top + (height - padding.top - padding.bottom) * ((chartMax - entry.weight) / (chartMax - chartMin));
        return `${x},${y}`;
    }).join(' ');
    svg += `<polyline points="${points}" fill="none" stroke="var(--md-sys-color-primary)" stroke-width="2" />`;
    weightHistory.forEach((entry, index) => {
        const x = padding.left + (width - padding.left - padding.right) * (index / (weightHistory.length - 1 || 1));
        const date = new Date(entry.date);
        const label = `${date.getDate()}.${date.getMonth() + 1}`;
        if (index === 0 || index === weightHistory.length - 1 || index % 3 === 0) {
            svg += `<text x="${x}" y="${height - 10}" text-anchor="middle" font-size="10" fill="var(--md-sys-color-on-surface-variant)">${label}</text>`;
        }
    });
    svg += '</svg>';
    return svg;
}

function renderSettings() {
    const content = `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">
                    <span class="material-symbols-outlined">settings</span>
                    Nastavení aplikace
                </h2>
            </div>
            
            <div class="settings-group">
                <h3 style="font-size: 0.9rem; margin-bottom: 12px; color: var(--md-sys-color-primary);">Vzhled</h3>
                <div class="settings-item">
                    <div>
                        <div>Tmavý režim</div>
                        <div style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);">Tmavý vzhled pro šetření očí</div>
                    </div>
                    <label class="switch">
                        <input type="checkbox" ${AppState.settings.darkMode ? 'checked' : ''} onchange="toggleDarkMode()">
                        <span class="slider"></span>
                    </label>
                </div>
            </div>
            
            <div class="settings-group">
                <h3 style="font-size: 0.9rem; margin-bottom: 12px; color: var(--md-sys-color-primary);">Sezónní režimy</h3>
                <div class="settings-item">
                    <div>
                        <div>Zimní režim</div>
                        <div style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);">Upraví tipy a zamění běh za chůzi</div>
                    </div>
                    <label class="switch">
                        <input type="checkbox" ${AppState.settings.winterMode ? 'checked' : ''} onchange="toggleSetting('winterMode')">
                        <span class="slider"></span>
                    </label>
                </div>
            </div>
            
            <div class="settings-group">
                <h3 style="font-size: 0.9rem; margin-bottom: 12px; color: var(--md-sys-color-primary);">
                    <span class="material-symbols-outlined" style="font-size: 18px; vertical-align: text-bottom;">notifications</span>
                    Oznámení a připomínky
                </h3>
                ${typeof renderNotificationSettings === 'function' ? renderNotificationSettings() : `
                    <div class="settings-item">
                        <div>
                            <div>Notifikace</div>
                            <div style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);">Povolit připomínky</div>
                        </div>
                        <label class="switch">
                            <input type="checkbox" ${AppState.settings.notifications ? 'checked' : ''} onchange="toggleNotifications(this)">
                            <span class="slider"></span>
                        </label>
                    </div>
                `}
            </div>
            
            <div class="settings-group">
                <h3 style="font-size: 0.9rem; margin-bottom: 12px; color: var(--md-sys-color-primary);">Data</h3>
                <div class="settings-item">
                    <span>Automatické ukládání</span>
                    <label class="switch">
                        <input type="checkbox" ${AppState.settings.autoSave ? 'checked' : ''} onchange="toggleSetting('autoSave')">
                        <span class="slider"></span>
                    </label>
                </div>
                <div class="settings-item" onclick="exportData()">
                    <span>Exportovat data</span>
                    <span class="material-symbols-outlined">download</span>
                </div>
                <div class="settings-item" onclick="importData()">
                    <span>Importovat data</span>
                    <span class="material-symbols-outlined">file_upload</span>
                </div>
            </div>
            
            <div class="settings-group">
                <h3 style="font-size: 0.9rem; margin-bottom: 12px; color: var(--md-sys-color-primary);">Osobní údaje</h3>
                <div class="form-group">
                    <label class="form-label">Cílová váha (kg)</label>
                    <input type="number" id="targetWeight" class="text-field" value="${AppState.userData.targetWeight}" onchange="updateTargetWeight()">
                </div>
                <div class="form-group">
                    <label class="form-label">Výška (cm)</label>
                    <input type="number" id="height" class="text-field" value="${AppState.userData.height}" onchange="updateHeight()">
                </div>
                <div class="form-group">
                    <label class="form-label">Věk</label>
                    <input type="number" id="age" class="text-field" value="${AppState.userData.age}" onchange="updateAge()">
                </div>
            </div>
            
            <div class="settings-group">
                <h3 style="font-size: 0.9rem; margin-bottom: 12px; color: var(--md-sys-color-primary);">Aplikace</h3>
                <div class="settings-item" onclick="showAppInfo()">
                    <span>O aplikaci</span>
                    <span class="material-symbols-outlined">info</span>
                </div>
                <div class="settings-item" onclick="resetApp()">
                    <span style="color: var(--md-sys-color-error);">Resetovat aplikaci</span>
                    <span class="material-symbols-outlined" style="color: var(--md-sys-color-error);">restart_alt</span>
                </div>
            </div>
            
            <button class="button filled-button full" onclick="saveSettings()" style="margin-top: var(--spacing-lg);">
                <span class="material-symbols-outlined">save</span>
                Uložit nastavení
            </button>
        </div>
    `;

    document.getElementById('mainContent').innerHTML = content;
}

// === UTILITY FUNCTIONS ===
function getToday() {
    const days = [
        { id: 'sunday', name: 'Neděle' },
        { id: 'monday', name: 'Pondělí' },
        { id: 'tuesday', name: 'Úterý' },
        { id: 'wednesday', name: 'Středa' },
        { id: 'thursday', name: 'Čtvrtek' },
        { id: 'friday', name: 'Pátek' },
        { id: 'saturday', name: 'Sobota' }
    ];
    return days[new Date().getDay()];
}

function getCurrentWeight() {
    if (!AppState.weightLogs || AppState.weightLogs.length === 0) {
        return AppState.userData.weight;
    }
    return AppState.weightLogs[AppState.weightLogs.length - 1].weight;
}

function getPushupsScore() {
    if (!AppState.testResults || AppState.testResults.length === 0) return 0;
    return AppState.testResults[AppState.testResults.length - 1].pushups;
}

function getSitupsScore() {
    if (!AppState.testResults || AppState.testResults.length === 0) return 0;
    return AppState.testResults[AppState.testResults.length - 1].situps;
}

function getRunningScore() {
    if (!AppState.testResults || AppState.testResults.length === 0) return 0;
    return AppState.testResults[AppState.testResults.length - 1].running;
}

function getTotalWorkouts() {
    let total = 0;
    if (!AppState.completionData) return 0;
    Object.values(AppState.completionData).forEach(week => {
        if (week) {
            Object.values(week).forEach(day => {
                if (day && day.completed) {
                    total += day.completed;
                }
            });
        }
    });
    return total;
}

function getWeekCompletion() {
    const weekData = AppState.completionData[AppState.currentWeek];
    if (!weekData) return 0;
    let totalCompleted = 0;
    let totalExercises = 0;
    Object.values(weekData).forEach(day => {
        if (day) {
            totalCompleted += day.completed || 0;
            totalExercises += day.total || 0;
        }
    });
    return totalExercises > 0 ? Math.round((totalCompleted / totalExercises) * 100) : 0;
}

function getDailyTip() {
    const tips = [
        "Dnes se soustřeď na techniku cviků, ne na rychlost.",
        "Pij dostatek vody - alespoň 3 litry během dne.",
        "Po tréninku nezapomeň na kvalitní protažení.",
        "Dnes si dej lehčí večeři s dostatkem bílkovin.",
        "Nezapomeň zaznamenat dnešní váhu pro sledování progresu.",
        "Dýchej správně při cvicích - výdech při námaze.",
        "Spánek je důležitý - dnes si dej alespoň 7 hodin."
    ];
    return tips[Math.floor(Math.random() * tips.length)];
}

// === ACTION FUNCTIONS ===
function showExerciseDetails(exerciseTitle) {
    const description = window.ExerciseDescriptions ? window.ExerciseDescriptions[exerciseTitle] : null;
    if (!description) {
        showNotification('Popis cviku není k dispozici');
        return;
    }
    document.getElementById('exerciseModalTitle').textContent = description.title;
    let content = `
        <p style="margin-bottom: var(--spacing-md);">${description.description}</p>
        <div class="timer-container">
            <div style="font-size: 0.9rem; font-weight: 500; margin-bottom: 4px;">⏱️ Stopky</div>
            <div id="timerDisplay" class="timer-display">00:00</div>
            <div class="timer-controls">
                <button class="button filled-button timer-start" onclick="startTimer()">Start</button>
                <button class="button filled-button timer-pause" onclick="pauseTimer()" style="display: none; background-color: #ff9800;">Pauza</button>
                <button class="button text-button timer-reset" onclick="resetTimer()">Reset</button>
            </div>
        </div>
        <div class="exercise-description" style="margin-top: 24px;">
            <div class="description-section">
                <h4>Postup:</h4>
                <ul>
                    ${description.steps.map(step => `<li>${step}</li>`).join('')}
                </ul>
            </div>
            <div class="description-section">
                <h4>Tipy:</h4>
                <ul>
                    ${description.tips.map(tip => `<li>${tip}</li>`).join('')}
                </ul>
            </div>
            <div class="description-section">
                <h4>Délka / Série:</h4>
                <p>${description.sets || description.duration}</p>
            </div>
        </div>
    `;
    document.getElementById('exerciseModalContent').innerHTML = content;
    resetTimer();
    showModal('exerciseModal');
}

function toggleExercise(exerciseId, dayId) {
    const weekData = AppState.completionData[AppState.currentWeek];
    if (!weekData || !weekData[dayId] || !weekData[dayId].exercises) return;
    const exercise = weekData[dayId].exercises.find(e => e.id === exerciseId);
    if (exercise) {
        const wasDone = exercise.done;
        exercise.done = !exercise.done;
        weekData[dayId].completed = weekData[dayId].exercises.filter(e => e.done).length;
        saveData();
        showNotification(`Cvičení ${exercise.done ? 'splněno' : 'nesplněno'}`);
        const exerciseElement = document.querySelector(`[onclick="toggleExercise(${exerciseId}, '${dayId}')"]`);
        if (exerciseElement) {
            const checkbox = exerciseElement.querySelector('.exercise-checkbox');
            if (checkbox) {
                checkbox.classList.toggle('checked', exercise.done);
                checkbox.innerHTML = exercise.done ? '<span class="material-symbols-outlined" style="font-size: 18px; color: white;">check</span>' : '';
            }
            const dayHeader = exerciseElement.closest('.day-card');
            if (dayHeader) {
                const counter = dayHeader.querySelector('.day-header div:last-child');
                if (counter) {
                    counter.innerHTML = `${weekData[dayId].completed}/${weekData[dayId].total} ${weekData[dayId].completed === weekData[dayId].total ? '<span class="material-symbols-outlined" style="font-size: 18px; vertical-align: text-bottom;">check_circle</span>' : ''}`;
                    if (weekData[dayId].completed === weekData[dayId].total && !wasDone) {
                        fireConfetti();
                        showNotification('Skvělá práce! Den splněn! 🎉');
                        if (typeof NotificationSystem !== 'undefined') {
                            NotificationSystem.notifyDayComplete();
                        }
                    }
                }
            }
        }
    }
}

function markAllToday() {
    const today = getToday();
    const weekData = AppState.completionData[AppState.currentWeek];
    if (weekData && weekData[today.id] && weekData[today.id].exercises) {
        let allDone = true;
        weekData[today.id].exercises.forEach(exercise => {
            if (!exercise.done) allDone = false;
            exercise.done = true;
        });
        if (allDone) {
            weekData[today.id].exercises.forEach(exercise => {
                exercise.done = false;
            });
            weekData[today.id].completed = 0;
            showNotification('Všechna cvičení odznačena');
        } else {
            weekData[today.id].completed = weekData[today.id].exercises.length;
            showNotification('Všechna dnešní cvičení označena! 🎉');
            fireConfetti();
            if (typeof NotificationSystem !== 'undefined') {
                NotificationSystem.notifyDayComplete();
            }
        }
        saveData();
        if (AppState.currentTab === 'dashboard') renderDashboard();
        if (AppState.currentTab === 'plan') renderPlan();
    }
}

function changeWeek(delta) {
    const newWeek = AppState.currentWeek + delta;
    if (newWeek >= 1 && newWeek <= 12) {
        AppState.currentWeek = newWeek;
        if (!AppState.completionData[AppState.currentWeek]) {
            initializeWeekData(AppState.currentWeek);
        }
        saveData();
        renderContent(AppState.currentTab);
        showNotification(`Týden ${AppState.currentWeek}`);
    }
}

function quickAddWeight() {
    document.getElementById('weightDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('weightValue').value = getCurrentWeight();
    showModal('weightModal');
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        if (modalId === 'exerciseModal') {
            pauseTimer();
        }
    }
}

function saveWeight() {
    const date = document.getElementById('weightDate').value;
    const weight = parseFloat(document.getElementById('weightValue').value);
    if (!date || !weight || weight < 40 || weight > 200) {
        showNotification('Zadejte platnou váhu (40-200 kg)');
        return;
    }
    if (!AppState.weightLogs) {
        AppState.weightLogs = [];
    }
    AppState.weightLogs.push({ date, weight, note: "Rychlý záznam" });
    if (AppState.weightLogs.length > 20) {
        AppState.weightLogs = AppState.weightLogs.slice(-20);
    }
    AppState.userData.weight = weight;
    saveData();
    closeModal('weightModal');
    showNotification(`Váha ${weight}kg uložena`);
    if (typeof NotificationSystem !== 'undefined') {
        NotificationSystem.notifyWeightLogged(weight);
    }
    if (AppState.currentTab === 'progress' || AppState.currentTab === 'dashboard') {
        renderContent(AppState.currentTab);
    }
}

function saveNewTest() {
    const pushups = parseInt(document.getElementById('newPushups').value) || 0;
    const situps = parseInt(document.getElementById('newSitups').value) || 0;
    const running = parseInt(document.getElementById('newRunning').value) || 0;
    if (!AppState.testResults) {
        AppState.testResults = [];
    }
    AppState.testResults.push({
        date: new Date().toISOString().split('T')[0],
        pushups,
        situps,
        running
    });
    saveData();
    showNotification('Testy uloženy!');
    document.getElementById('newPushups').value = '';
    document.getElementById('newSitups').value = '';
    document.getElementById('newRunning').value = '';
    if (AppState.currentTab === 'progress') {
        renderProgress();
    }
}

// === SETTINGS FUNCTIONS ===
function toggleSetting(setting) {
    if (AppState.settings && AppState.settings[setting] !== undefined) {
        AppState.settings[setting] = !AppState.settings[setting];
        saveData();
        if (setting === 'winterMode') {
            renderContent(AppState.currentTab);
        }
    }
}

function toggleNotifications(checkbox) {
    if (checkbox.checked) {
        if (!("Notification" in window)) {
            showNotification("Nepodporováno");
            checkbox.checked = false;
            return;
        }
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                AppState.settings.notifications = true;
                saveData();
                showNotification("Notifikace povoleny");
                renderSettings();
            } else {
                AppState.settings.notifications = false;
                checkbox.checked = false;
                showNotification("Notifikace zamítnuty");
            }
        });
    } else {
        AppState.settings.notifications = false;
        saveData();
        showNotification("Notifikace vypnuty");
        renderSettings();
    }
}

function sendTestNotification() {
    if (Notification.permission === "granted") {
        new Notification("Tréninkový Tracker", {
            body: "Testovací notifikace funguje! 💪",
            icon: "/icons/icon-128.png",
            vibrate: [200, 100, 200]
        });
    } else {
        showNotification("Nemám povolení");
    }
}

function toggleDarkMode() {
    AppState.settings.darkMode = !AppState.settings.darkMode;
    if (AppState.settings.darkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    saveData();
    showNotification(`Tmavý režim ${AppState.settings.darkMode ? 'zapnut' : 'vypnut'}`);
}

function updateTargetWeight() {
    const value = parseInt(document.getElementById('targetWeight').value);
    if (!isNaN(value)) {
        AppState.userData.targetWeight = value;
    }
}

function updateHeight() {
    const value = parseInt(document.getElementById('height').value);
    if (!isNaN(value)) {
        AppState.userData.height = value;
    }
}

function updateAge() {
    const value = parseInt(document.getElementById('age').value);
    if (!isNaN(value)) {
        AppState.userData.age = value;
    }
}

function saveSettings() {
    saveData();
    showNotification('Nastavení uloženo');
}

function exportData() {
    const dataStr = JSON.stringify(AppState, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'fitness-data-' + new Date().toISOString().split('T')[0] + '.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    showNotification('Data exportována');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function (event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const importedData = JSON.parse(e.target.result);
                Object.assign(AppState, importedData);
                if (AppState.settings.darkMode) {
                    document.body.classList.add('dark-mode');
                } else {
                    document.body.classList.remove('dark-mode');
                }
                saveData();
                showNotification('Data importována');
                renderContent(AppState.currentTab);
            } catch (error) {
                showNotification('Chyba při importu');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function showAppInfo() {
    showNotification('Tréninkový Tracker v2.0 | MD3 + Notifikace + Vlastní cviky');
}

function resetApp() {
    if (confirm('Opravdu chcete resetovat celou aplikaci?')) {
        localStorage.removeItem('fitnessAppData');
        localStorage.removeItem('notificationSettings');
        localStorage.removeItem('customExercises');
        location.reload();
    }
}

function syncData() {
    saveData();
    showNotification('Data synchronizována');
}

function startTodayWorkout() {
    showNotification('Jdeme na to!');
    switchTab('plan');
    setTimeout(() => {
        const today = getToday();
        const todayCard = document.getElementById(`day-${today.id}`);
        if (todayCard) {
            todayCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            todayCard.style.transition = 'transform 0.3s';
            todayCard.style.transform = 'scale(1.02)';
            setTimeout(() => {
                todayCard.style.transform = 'scale(1)';
            }, 500);
        }
    }, 100);
}

// === HELPER FUNCTIONS ===
function showNotification(message) {
    const notification = document.getElementById('notification');
    const messageEl = document.getElementById('notificationMessage');
    if (!notification || !messageEl) return;
    messageEl.textContent = message;
    notification.style.display = 'flex';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

function saveData() {
    try {
        localStorage.setItem('fitnessAppData', JSON.stringify(AppState));
    } catch (e) {
        console.error('Chyba při ukládání dat:', e);
    }
}
