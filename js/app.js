"use strict";

// === APP VERSION ===
const APP_VERSION = "2.0.0";
const APP_BUILD_DATE = "2026-02-01";

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
        winterMode: true,
        cloudSync: false
    }
};

let deferredPrompt;
let timerInterval;
let timerTime = 0;

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', function () {
    initApp();

    // Check if first run (no profiles exist)
    if (typeof ProfileManager !== 'undefined' && ProfileManager.getProfiles().length === 0) {
        showFirstRunSetup();
        return; // Don't load app until profile is created
    }

    loadInitialData();
    renderDashboard();
    setupEventListeners();
});

function setupEventListeners() {
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
}

function showFirstRunSetup() {
    // Show install step first, then profile setup
    showInstallStep();
}

function showInstallStep() {
    // Check if app can be installed (PWA install prompt available)
    const canInstall = deferredPrompt !== null && deferredPrompt !== undefined;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         window.navigator.standalone === true;

    // If already installed or can't install, skip to profile setup
    if (isStandalone || !canInstall) {
        showProfileStep();
        return;
    }

    const content = `
        <div class="first-run-overlay" id="installStepOverlay" style="
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: var(--md-sys-color-background); z-index: 9999;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            padding: 24px;">

            <div style="max-width: 400px; width: 100%; text-align: center;">
                <span class="material-symbols-outlined" style="font-size: 80px; color: var(--md-sys-color-primary); margin-bottom: 24px;">
                    install_mobile
                </span>
                <h1 style="font-size: 1.5rem; margin-bottom: 12px;">Nainstalujte si aplikaci</h1>
                <p style="color: var(--md-sys-color-on-surface-variant); margin-bottom: 32px; line-height: 1.5;">
                    Pro nejlepší zážitek si nainstalujte aplikaci do telefonu.
                    Bude fungovat i offline a spustí se jako normální aplikace.
                </p>

                <div class="card" style="padding: 24px;">
                    <button class="button filled-button full" onclick="installFromFirstRun()"
                            style="padding: 16px; font-size: 1.1rem; margin-bottom: 16px;">
                        <span class="material-symbols-outlined">download</span>
                        Nainstalovat aplikaci
                    </button>

                    <button class="button text-button full" onclick="skipInstallStep()"
                            style="padding: 12px;">
                        Přeskočit a pokračovat v prohlížeči
                    </button>
                </div>

                <div style="margin-top: 32px; padding: 16px; background: var(--md-sys-color-surface-variant); border-radius: 12px;">
                    <p style="font-size: 0.8rem; color: var(--md-sys-color-on-surface-variant); margin: 0;">
                        <span class="material-symbols-outlined" style="font-size: 16px; vertical-align: text-bottom;">info</span>
                        Aplikaci můžete nainstalovat i později v Nastavení
                    </p>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', content);
}

async function installFromFirstRun() {
    if (!deferredPrompt) {
        showNotification('Instalace není dostupná');
        skipInstallStep();
        return;
    }

    try {
        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for user choice
        const { outcome } = await deferredPrompt.userChoice;
        console.log('Install outcome:', outcome);

        // Clear the deferred prompt
        deferredPrompt = null;

        if (outcome === 'accepted') {
            showNotification('Aplikace se instaluje...');
            // Wait a bit for installation
            await new Promise(resolve => setTimeout(resolve, 1500));
        }

        // Continue to profile setup
        skipInstallStep();

    } catch (error) {
        console.error('Install error:', error);
        showNotification('Instalace se nezdařila');
        skipInstallStep();
    }
}

function skipInstallStep() {
    const overlay = document.getElementById('installStepOverlay');
    if (overlay) {
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.3s';
        setTimeout(() => {
            overlay.remove();
            showProfileStep();
        }, 300);
    } else {
        showProfileStep();
    }
}

function showProfileStep() {
    const icons = typeof ProfileManager !== 'undefined' ? ProfileManager.getIcons() : ['💪'];
    const iconOptions = icons.map(icon => `
        <button type="button" class="icon-option" onclick="selectFirstRunIcon('${icon}')"
                style="font-size: 2rem; padding: 12px; border: 3px solid transparent; border-radius: 12px;
                       background: var(--md-sys-color-surface-variant); cursor: pointer; transition: all 0.2s;">
            ${icon}
        </button>
    `).join('');

    const content = `
        <div class="first-run-overlay" style="
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: var(--md-sys-color-background); z-index: 9999;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            padding: 24px; overflow-y: auto;">

            <div style="max-width: 400px; width: 100%; text-align: center;">
                <span class="material-symbols-outlined" style="font-size: 64px; color: var(--md-sys-color-primary); margin-bottom: 16px;">
                    fitness_center
                </span>
                <h1 style="font-size: 1.5rem; margin-bottom: 8px;">Vytvořte si profil</h1>
                <p style="color: var(--md-sys-color-on-surface-variant); margin-bottom: 24px;">
                    Krok 2 ze 2
                </p>

                <div class="card" style="text-align: left; padding: 24px;">
                    <div class="form-group">
                        <label class="form-label">Vaše jméno nebo přezdívka</label>
                        <input type="text" id="firstRunName" class="text-field"
                               placeholder="např. Tomáš, Táta, Sporťák..."
                               style="font-size: 1.1rem; padding: 16px;">
                    </div>

                    <div class="form-group">
                        <label class="form-label">Vyberte ikonu</label>
                        <div id="firstRunIconSelector" style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;">
                            ${iconOptions}
                        </div>
                        <input type="hidden" id="firstRunIcon" value="💪">
                    </div>

                    <button class="button filled-button full" onclick="completeFirstRunSetup()"
                            style="margin-top: 24px; padding: 16px; font-size: 1.1rem;">
                        <span class="material-symbols-outlined">arrow_forward</span>
                        Začít trénovat
                    </button>
                </div>

                <p style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant); margin-top: 24px;">
                    Později můžete přidat další profily pro členy rodiny
                </p>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', content);

    // Select first icon by default
    setTimeout(() => selectFirstRunIcon('💪'), 100);

    // Focus on name input
    setTimeout(() => {
        const input = document.getElementById('firstRunName');
        if (input) input.focus();
    }, 200);
}

function selectFirstRunIcon(icon) {
    document.getElementById('firstRunIcon').value = icon;

    // Update visual selection
    document.querySelectorAll('#firstRunIconSelector .icon-option').forEach(btn => {
        const isSelected = btn.textContent.trim() === icon;
        btn.style.borderColor = isSelected ? 'var(--md-sys-color-primary)' : 'transparent';
        btn.style.transform = isSelected ? 'scale(1.1)' : 'scale(1)';
    });
}

function completeFirstRunSetup() {
    const name = document.getElementById('firstRunName').value.trim();
    const icon = document.getElementById('firstRunIcon').value;

    if (!name) {
        showNotification('Zadejte prosím své jméno');
        document.getElementById('firstRunName').focus();
        return;
    }

    if (typeof ProfileManager === 'undefined') {
        console.error('ProfileManager not loaded');
        return;
    }

    // Create the first profile
    const profile = ProfileManager.createProfile(name, icon);
    ProfileManager.setActiveProfile(profile.id);

    // Remove the overlay
    const overlay = document.querySelector('.first-run-overlay');
    if (overlay) {
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.3s';
        setTimeout(() => overlay.remove(), 300);
    }

    // Now initialize the app properly
    loadInitialData();
    renderDashboard();
    setupEventListeners();

    // Show welcome message
    setTimeout(() => {
        showNotification(`Vítejte, ${name}! 💪`);
    }, 500);
}

function initApp() {
    // Initialize profile system first
    if (typeof ProfileManager !== 'undefined') {
        ProfileManager.init();
    } else {
        // Fallback to legacy loading
        const saved = localStorage.getItem('fitnessAppData');
        if (saved) {
            const parsed = JSON.parse(saved);
            Object.assign(AppState, parsed);
        } else {
            initializeDefaultData();
        }
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
        case 'achievements':
            renderAchievements();
            break;
        case 'workouts':
            console.log('Switching to workouts tab');
            console.log('renderWorkoutBuilder available:', typeof renderWorkoutBuilder !== 'undefined');
            console.log('WorkoutBuilderInstance:', window.WorkoutBuilderInstance);

            if (typeof renderWorkoutBuilder !== 'undefined') {
                const content = renderWorkoutBuilder();
                console.log('Rendered content length:', content.length);
                document.getElementById('mainContent').innerHTML = content;

                // Attach event listeners after DOM is ready
                setTimeout(() => {
                    const exercise1RMSelect = document.getElementById('exercise1RMSelect');
                    if (exercise1RMSelect) {
                        exercise1RMSelect.addEventListener('change', function() {
                            if (typeof show1RMChart !== 'undefined') {
                                show1RMChart(this.value);
                            }
                        });
                    }
                }, 0);
            } else {
                console.error('renderWorkoutBuilder is not defined!');
                document.getElementById('mainContent').innerHTML = '<div class="card"><p>Workout Builder se načítá...</p></div>';
            }
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
                <div class="chart-container" style="position: relative; height: 250px;">
                    <canvas id="weightChart"></canvas>
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

        ${typeof renderBodyMeasurementsSection !== 'undefined' ? renderBodyMeasurementsSection() : ''}
    `;

    document.getElementById('mainContent').innerHTML = content;

    // Render Chart.js weight chart
    if (typeof Chart !== 'undefined' && weightHistory.length > 0) {
        setTimeout(() => renderWeightChart(weightHistory), 100);
    }

    // Render measurement charts
    if (typeof renderMeasurementChartsJS !== 'undefined') {
        setTimeout(() => renderMeasurementChartsJS(), 200);
    }
}

function renderWeightChart(weightHistory) {
    const ctx = document.getElementById('weightChart');
    if (!ctx) return;

    const labels = weightHistory.map(entry => {
        const date = new Date(entry.date);
        return `${date.getDate()}.${date.getMonth() + 1}`;
    });

    const data = weightHistory.map(entry => entry.weight);

    // Destroy existing chart if it exists
    if (window.weightChartInstance) {
        window.weightChartInstance.destroy();
    }

    window.weightChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Váha (kg)',
                data: data,
                borderColor: 'rgb(26, 35, 126)',
                backgroundColor: 'rgba(26, 35, 126, 0.1)',
                tension: 0.3,
                fill: true,
                pointBackgroundColor: 'rgb(26, 35, 126)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y.toFixed(1) + ' kg';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(1) + ' kg';
                        }
                    }
                }
            }
        }
    });
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
    const activeProfile = typeof ProfileManager !== 'undefined' ? ProfileManager.getActiveProfile() : null;
    const profiles = typeof ProfileManager !== 'undefined' ? ProfileManager.getProfiles() : [];

    const content = `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">
                    <span class="material-symbols-outlined">settings</span>
                    Nastavení aplikace
                </h2>
            </div>

            <!-- Profile Section -->
            <div class="settings-group">
                <h3 style="font-size: 0.9rem; margin-bottom: 12px; color: var(--md-sys-color-primary);">
                    <span class="material-symbols-outlined" style="font-size: 18px; vertical-align: text-bottom;">person</span>
                    Profil
                </h3>
                ${activeProfile ? `
                    <div class="profile-card" style="display: flex; align-items: center; gap: 12px; padding: 16px; background: var(--md-sys-color-primary-container); border-radius: 12px; margin-bottom: 12px;">
                        <span style="font-size: 2rem;">${activeProfile.icon}</span>
                        <div style="flex: 1;">
                            <div style="font-weight: 500; font-size: 1.1rem;">${activeProfile.name}</div>
                            <div style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);">Sync ID: ${activeProfile.syncId.substring(0, 15)}...</div>
                        </div>
                        <button class="icon-button" onclick="editCurrentProfile()" title="Upravit profil">
                            <span class="material-symbols-outlined">edit</span>
                        </button>
                    </div>
                ` : ''}
                ${profiles.length > 1 ? `
                    <div class="settings-item" onclick="showProfileSwitcher()">
                        <div>
                            <div>Přepnout profil</div>
                            <div style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);">${profiles.length} profilů</div>
                        </div>
                        <span class="material-symbols-outlined">swap_horiz</span>
                    </div>
                ` : ''}
                <div class="settings-item" onclick="showAddProfileModal()">
                    <span>Přidat nový profil</span>
                    <span class="material-symbols-outlined">person_add</span>
                </div>
                ${profiles.length > 1 ? `
                    <div class="settings-item" onclick="showDeleteProfileModal()">
                        <span style="color: var(--md-sys-color-error);">Smazat profil</span>
                        <span class="material-symbols-outlined" style="color: var(--md-sys-color-error);">person_remove</span>
                    </div>
                ` : ''}
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
                <h3 style="font-size: 0.9rem; margin-bottom: 12px; color: var(--md-sys-color-primary);">
                    <span class="material-symbols-outlined" style="font-size: 18px; vertical-align: text-bottom;">cloud</span>
                    Cloudová synchronizace
                </h3>
                <div class="settings-item">
                    <div>
                        <div>Synchronizace do cloudu</div>
                        <div style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);">Záloha dat na Cloudflare</div>
                    </div>
                    <label class="switch">
                        <input type="checkbox" ${AppState.settings.cloudSync ? 'checked' : ''} onchange="toggleCloudSync(this)">
                        <span class="slider"></span>
                    </label>
                </div>
                <div id="syncStatus" style="padding: 12px; background: var(--md-sys-color-surface-variant); border-radius: 8px; margin-top: 8px; font-size: 0.8rem;">
                    ${typeof CloudSync !== 'undefined' ? `
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                            <span class="material-symbols-outlined" style="font-size: 16px; color: ${CloudSync.isOnline() ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-error)'};">
                                ${CloudSync.isOnline() ? 'cloud_done' : 'cloud_off'}
                            </span>
                            <span>${CloudSync.isOnline() ? 'Online' : 'Offline'}</span>
                        </div>
                        <div>Poslední sync: ${CloudSync.getSyncStatus().lastSyncFormatted}</div>
                    ` : '<div>Načítání...</div>'}
                </div>
                <div style="display: flex; gap: 8px; margin-top: 12px;">
                    <button class="button outlined-button" onclick="syncNow()" style="flex: 1;">
                        <span class="material-symbols-outlined">sync</span>
                        Synchronizovat
                    </button>
                    <button class="button text-button" onclick="showSyncId()" title="Zobrazit ID pro obnovu">
                        <span class="material-symbols-outlined">key</span>
                    </button>
                </div>
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
                <div class="settings-item" onclick="checkForUpdate()">
                    <div>
                        <div>Zkontrolovat aktualizace</div>
                        <div style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);">Verze: ${typeof APP_VERSION !== 'undefined' ? APP_VERSION : '1.8.0'}</div>
                    </div>
                    <span class="material-symbols-outlined">system_update</span>
                </div>
                <div class="settings-item" onclick="forceUpdate()">
                    <div>
                        <div>Vynutit aktualizaci</div>
                        <div style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);">Smaže cache a načte novou verzi</div>
                    </div>
                    <span class="material-symbols-outlined">refresh</span>
                </div>
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
                        // Check for new achievements
                        if (typeof AchievementSystem !== 'undefined') {
                            setTimeout(() => AchievementSystem.checkForNewAchievements(), 1000);
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
            // Check for new achievements
            if (typeof AchievementSystem !== 'undefined') {
                setTimeout(() => AchievementSystem.checkForNewAchievements(), 1000);
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
    // Check for new achievements
    if (typeof AchievementSystem !== 'undefined') {
        setTimeout(() => AchievementSystem.checkForNewAchievements(), 500);
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

// === CLOUD SYNC FUNCTIONS ===
function toggleCloudSync(checkbox) {
    AppState.settings.cloudSync = checkbox.checked;
    saveData();
    if (checkbox.checked) {
        showNotification('Cloudová synchronizace zapnuta');
        syncNow();
    } else {
        showNotification('Cloudová synchronizace vypnuta');
    }
}

async function syncNow() {
    if (typeof CloudSync === 'undefined') {
        showNotification('Sync modul není načten');
        return;
    }

    showNotification('Synchronizuji...');
    const result = await CloudSync.fullSync();

    if (result.success) {
        showNotification('Synchronizace dokončena');
        // Refresh settings view if on settings tab
        if (AppState.currentTab === 'settings') {
            renderSettings();
        }
    } else {
        showNotification('Chyba: ' + (result.error || 'Neznámá chyba'));
    }
}

function showSyncId() {
    if (typeof CloudSync === 'undefined') return;

    const status = CloudSync.getSyncStatus();
    const message = `Vaše ID pro obnovu dat:\n\n${status.userId}\n\nUložte si toto ID pro případnou obnovu dat na jiném zařízení.`;

    if (confirm(message + '\n\nKopírovat do schránky?')) {
        CloudSync.copyUserId().then(success => {
            if (success) {
                showNotification('ID zkopírováno');
            }
        });
    }
}

async function restoreFromCloud() {
    const userId = prompt('Zadejte vaše ID pro obnovu:');
    if (!userId) return;

    if (typeof CloudSync === 'undefined') {
        showNotification('Sync modul není načten');
        return;
    }

    if (CloudSync.setUserId(userId)) {
        showNotification('Stahuji data...');
        const result = await CloudSync.pullFromCloud();

        if (result.success && result.data) {
            CloudSync.mergeData(result.data);
            showNotification('Data obnovena');
            renderSettings();
        } else {
            showNotification('Data nenalezena');
        }
    } else {
        showNotification('Neplatné ID');
    }
}

// === APP UPDATE FUNCTIONS ===
async function checkForUpdate() {
    showNotification('Kontroluji aktualizace...');

    if (!('serviceWorker' in navigator)) {
        showNotification('Service Worker není podporován');
        return;
    }

    try {
        // First, try to get the remote version by fetching sw.js directly from server
        // We need to bypass cache completely
        const serverVersion = await getServerVersion();

        if (serverVersion && serverVersion !== APP_VERSION) {
            // New version available on server
            if (confirm(`Nová verze ${serverVersion} je dostupná (aktuální: ${APP_VERSION}). Chcete aktualizovat?`)) {
                await forceUpdate();
            }
            return;
        }

        // Also check if there's a waiting service worker
        const registration = await navigator.serviceWorker.getRegistration();

        if (registration) {
            // Force the browser to check for SW updates
            await registration.update();

            // Wait for potential update
            await new Promise(resolve => setTimeout(resolve, 1500));

            if (registration.waiting) {
                if (confirm('Je dostupná nová verze. Chcete ji nainstalovat?')) {
                    // Activate the new service worker
                    registration.waiting.postMessage({ type: 'SKIP_WAITING' });

                    // Wait and reload
                    await new Promise(resolve => setTimeout(resolve, 500));
                    window.location.href = window.location.href;
                }
                return;
            }
        }

        showNotification(`Aplikace je aktuální (v${APP_VERSION})`);

    } catch (error) {
        console.error('Update check failed:', error);
        showNotification('Nelze zkontrolovat aktualizace');
    }
}

async function getServerVersion() {
    try {
        // Fetch sw.js with cache-busting and no-store to bypass all caches
        const response = await fetch('/sw.js?v=' + Date.now() + '&nocache=' + Math.random(), {
            method: 'GET',
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache'
            }
        });

        if (!response.ok) return null;

        const text = await response.text();
        const match = text.match(/APP_VERSION\s*=\s*['"]([^'"]+)['"]/);

        return match ? match[1] : null;
    } catch (error) {
        console.error('Failed to get server version:', error);
        return null;
    }
}

async function forceUpdate() {
    showNotification('Aktualizuji aplikaci...');

    try {
        // 1. Clear all caches
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            for (const name of cacheNames) {
                await caches.delete(name);
                console.log('Deleted cache:', name);
            }
        }

        // 2. Unregister all service workers
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const reg of registrations) {
                await reg.unregister();
                console.log('Unregistered SW');
            }
        }

        // 3. Clear any stored version info
        localStorage.removeItem('appVersion');

        // 4. Wait for cleanup
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 5. Force reload - using location.href for better PWA compatibility
        // Adding a cache-busting parameter
        const url = new URL(window.location.href);
        url.searchParams.set('_refresh', Date.now());
        window.location.href = url.toString();

    } catch (error) {
        console.error('Force update failed:', error);
        showNotification('Chyba při aktualizaci - zkuste zavřít a znovu otevřít aplikaci');
    }
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

// === PROFILE MANAGEMENT FUNCTIONS ===
function showProfileSwitcher() {
    if (typeof ProfileManager === 'undefined') return;

    const profiles = ProfileManager.getProfiles();
    const activeId = ProfileManager.getActiveProfileId();

    const profileList = profiles.map(p => `
        <div class="settings-item ${p.id === activeId ? 'active-profile' : ''}"
             onclick="switchToProfile('${p.id}')"
             style="${p.id === activeId ? 'background: var(--md-sys-color-primary-container);' : ''}">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 1.5rem;">${p.icon}</span>
                <div>
                    <div>${p.name}</div>
                    ${p.id === activeId ? '<div style="font-size: 0.7rem; color: var(--md-sys-color-primary);">Aktivní</div>' : ''}
                </div>
            </div>
            ${p.id === activeId ? '<span class="material-symbols-outlined" style="color: var(--md-sys-color-primary);">check_circle</span>' : ''}
        </div>
    `).join('');

    showCustomModal('Vyberte profil', profileList);
}

function switchToProfile(profileId) {
    if (typeof ProfileManager === 'undefined') return;

    ProfileManager.switchProfile(profileId);
    closeCustomModal();
    showNotification('Profil přepnut');

    // Reload current view
    if (AppState.currentTab === 'settings') {
        renderSettings();
    } else {
        renderDashboard();
    }
}

function showAddProfileModal() {
    const icons = typeof ProfileManager !== 'undefined' ? ProfileManager.getIcons() : ['💪'];
    const iconOptions = icons.map(icon => `
        <button type="button" class="icon-option" onclick="selectProfileIcon('${icon}')" style="font-size: 1.5rem; padding: 8px; border: 2px solid transparent; border-radius: 8px; background: var(--md-sys-color-surface-variant); cursor: pointer;">
            ${icon}
        </button>
    `).join('');

    const content = `
        <div class="form-group">
            <label class="form-label">Jméno profilu</label>
            <input type="text" id="newProfileName" class="text-field" placeholder="např. Táta, Máma, Honza...">
        </div>
        <div class="form-group">
            <label class="form-label">Ikona</label>
            <div id="iconSelector" style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${iconOptions}
            </div>
            <input type="hidden" id="selectedProfileIcon" value="💪">
        </div>
        <div style="display: flex; gap: 8px; margin-top: 16px;">
            <button class="button text-button" onclick="closeCustomModal()" style="flex: 1;">Zrušit</button>
            <button class="button filled-button" onclick="createNewProfile()" style="flex: 1;">Vytvořit</button>
        </div>
    `;

    showCustomModal('Nový profil', content);

    // Select first icon by default
    setTimeout(() => selectProfileIcon('💪'), 100);
}

function selectProfileIcon(icon) {
    document.getElementById('selectedProfileIcon').value = icon;

    // Update visual selection
    document.querySelectorAll('.icon-option').forEach(btn => {
        btn.style.borderColor = btn.textContent.trim() === icon ? 'var(--md-sys-color-primary)' : 'transparent';
    });
}

function createNewProfile() {
    const name = document.getElementById('newProfileName').value.trim();
    const icon = document.getElementById('selectedProfileIcon').value;

    if (!name) {
        showNotification('Zadejte jméno profilu');
        return;
    }

    if (typeof ProfileManager === 'undefined') return;

    const profile = ProfileManager.createProfile(name, icon);
    closeCustomModal();
    showNotification(`Profil "${name}" vytvořen`);

    // Ask if user wants to switch
    if (confirm(`Chcete se přepnout na nový profil "${name}"?`)) {
        ProfileManager.switchProfile(profile.id);
        renderSettings();
    }
}

function editCurrentProfile() {
    if (typeof ProfileManager === 'undefined') return;

    const profile = ProfileManager.getActiveProfile();
    if (!profile) return;

    const icons = ProfileManager.getIcons();
    const iconOptions = icons.map(icon => `
        <button type="button" class="icon-option" onclick="selectProfileIcon('${icon}')" style="font-size: 1.5rem; padding: 8px; border: 2px solid ${icon === profile.icon ? 'var(--md-sys-color-primary)' : 'transparent'}; border-radius: 8px; background: var(--md-sys-color-surface-variant); cursor: pointer;">
            ${icon}
        </button>
    `).join('');

    const content = `
        <div class="form-group">
            <label class="form-label">Jméno profilu</label>
            <input type="text" id="editProfileName" class="text-field" value="${profile.name}">
        </div>
        <div class="form-group">
            <label class="form-label">Ikona</label>
            <div id="iconSelector" style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${iconOptions}
            </div>
            <input type="hidden" id="selectedProfileIcon" value="${profile.icon}">
        </div>
        <div class="form-group" style="margin-top: 16px; padding: 12px; background: var(--md-sys-color-surface-variant); border-radius: 8px;">
            <label class="form-label">Sync ID (pro obnovu dat)</label>
            <div style="display: flex; gap: 8px; align-items: center;">
                <code style="flex: 1; font-size: 0.75rem; word-break: break-all;">${profile.syncId}</code>
                <button class="icon-button" onclick="copySyncId('${profile.syncId}')" title="Kopírovat">
                    <span class="material-symbols-outlined">content_copy</span>
                </button>
            </div>
        </div>
        <div style="display: flex; gap: 8px; margin-top: 16px;">
            <button class="button text-button" onclick="closeCustomModal()" style="flex: 1;">Zrušit</button>
            <button class="button filled-button" onclick="saveProfileEdit('${profile.id}')" style="flex: 1;">Uložit</button>
        </div>
    `;

    showCustomModal('Upravit profil', content);
}

function saveProfileEdit(profileId) {
    const name = document.getElementById('editProfileName').value.trim();
    const icon = document.getElementById('selectedProfileIcon').value;

    if (!name) {
        showNotification('Zadejte jméno profilu');
        return;
    }

    if (typeof ProfileManager === 'undefined') return;

    ProfileManager.renameProfile(profileId, name, icon);
    closeCustomModal();
    showNotification('Profil upraven');
    renderSettings();
}

function copySyncId(syncId) {
    navigator.clipboard.writeText(syncId).then(() => {
        showNotification('Sync ID zkopírováno');
    }).catch(() => {
        showNotification('Kopírování selhalo');
    });
}

function showDeleteProfileModal() {
    if (typeof ProfileManager === 'undefined') return;

    const profiles = ProfileManager.getProfiles();
    const activeId = ProfileManager.getActiveProfileId();

    // Can't delete if only one profile
    if (profiles.length <= 1) {
        showNotification('Nelze smazat jediný profil');
        return;
    }

    const profileList = profiles.filter(p => p.id !== activeId).map(p => `
        <div class="settings-item" onclick="confirmDeleteProfile('${p.id}', '${p.name}')">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 1.5rem;">${p.icon}</span>
                <div>${p.name}</div>
            </div>
            <span class="material-symbols-outlined" style="color: var(--md-sys-color-error);">delete</span>
        </div>
    `).join('');

    const content = `
        <p style="margin-bottom: 12px; color: var(--md-sys-color-on-surface-variant);">Vyberte profil ke smazání (aktivní profil nelze smazat):</p>
        ${profileList}
        <button class="button text-button full" onclick="closeCustomModal()" style="margin-top: 16px;">Zrušit</button>
    `;

    showCustomModal('Smazat profil', content);
}

function confirmDeleteProfile(profileId, profileName) {
    if (confirm(`Opravdu chcete smazat profil "${profileName}"? Tato akce je nevratná a smaže všechna data profilu.`)) {
        if (typeof ProfileManager === 'undefined') return;

        ProfileManager.deleteProfile(profileId);
        closeCustomModal();
        showNotification(`Profil "${profileName}" smazán`);
        renderSettings();
    }
}

// Custom modal helpers
function showCustomModal(title, content) {
    // Remove existing modal if any
    closeCustomModal();

    const modal = document.createElement('div');
    modal.id = 'customModal';
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <h3 style="margin-bottom: 16px;">${title}</h3>
            ${content}
        </div>
    `;
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeCustomModal();
    });
    document.body.appendChild(modal);
}

function closeCustomModal() {
    const modal = document.getElementById('customModal');
    if (modal) modal.remove();
}

// === ACHIEVEMENTS TAB ===
function renderAchievements() {
    if (typeof AchievementSystem === 'undefined') {
        document.getElementById('mainContent').innerHTML = `
            <div class="card">
                <h2>Systém achievementů se načítá...</h2>
            </div>
        `;
        return;
    }

    // Initialize and check for new achievements
    AchievementSystem.init();
    const newAchievements = AchievementSystem.checkForNewAchievements();

    // Get player stats
    const level = AchievementSystem.getPlayerLevel();
    const points = AchievementSystem.getTotalPoints();
    const progress = AchievementSystem.getProgressToNextLevel();
    const stats = AchievementSystem.getPlayerStats();
    const streak = stats.currentStreak;

    const content = `
        <div class="achievements-header">
            <h2>Achievementy a odznaky</h2>
            <p>Sbírej achievementy a dostávej body za své úspěchy</p>
        </div>

        <!-- Player Stats Card -->
        <div class="player-stats-card">
            <div class="player-level">
                <div class="player-level-icon">${level.icon}</div>
                <div class="player-level-info">
                    <h2>${level.name}</h2>
                    <p>Level ${level.level} • ${points} bodů</p>
                </div>
            </div>

            ${progress.progress < 100 ? `
                <div class="level-progress">
                    <div class="level-progress-label">
                        <span>Progres k dalšímu levelu</span>
                        <span>${progress.current} / ${progress.needed} bodů</span>
                    </div>
                    <div class="level-progress-bar">
                        <div class="level-progress-fill" style="width: ${progress.progress}%"></div>
                    </div>
                </div>
            ` : '<p style="text-align: center; margin-top: 12px; opacity: 0.9;">🎉 Dosáhl jsi maximálního levelu!</p>'}
        </div>

        <!-- Streak Card -->
        <div class="streak-card ${streak > 0 ? 'active' : ''}">
            <div class="streak-icon">${streak > 0 ? '🔥' : '💤'}</div>
            <div class="streak-number">${streak}</div>
            <div class="streak-label">
                ${streak > 0 ? (streak === 1 ? 'den v řadě' : streak < 5 ? 'dny v řadě' : 'dní v řadě') : 'Začni cvičit'}
            </div>
        </div>

        <!-- Quick Stats -->
        <div class="quick-stats-grid">
            <div class="stat-card-small">
                <div class="stat-icon">💪</div>
                <div class="stat-value">${stats.totalWorkouts}</div>
                <div class="stat-label">Tréninků</div>
            </div>
            <div class="stat-card-small">
                <div class="stat-icon">✨</div>
                <div class="stat-value">${stats.perfectWeeks}</div>
                <div class="stat-label">Perfektní týdny</div>
            </div>
            <div class="stat-card-small">
                <div class="stat-icon">📉</div>
                <div class="stat-value">${stats.weightLost.toFixed(1)}</div>
                <div class="stat-label">Kg shozeno</div>
            </div>
            <div class="stat-card-small">
                <div class="stat-icon">🌅</div>
                <div class="stat-value">${stats.morningWorkouts}</div>
                <div class="stat-label">Ranních tréninků</div>
            </div>
        </div>

        <!-- Achievements List -->
        ${AchievementSystem.renderAchievementsList()}
    `;

    document.getElementById('mainContent').innerHTML = content;
}

// === HELPER FUNCTIONS ===
function showNotification(message) {
    const notification = document.getElementById('notification');
    const messageEl = document.getElementById('notificationMessage');
    if (!notification || !messageEl) return;
    messageEl.textContent = message;
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function saveData() {
    try {
        // Save to profile-specific key if profile system is available
        if (typeof ProfileManager !== 'undefined') {
            const activeId = ProfileManager.getActiveProfileId();
            if (activeId) {
                localStorage.setItem(`fitnessAppData_${activeId}`, JSON.stringify(AppState));
                return;
            }
        }
        // Fallback to global key (legacy or no profile)
        localStorage.setItem('fitnessAppData', JSON.stringify(AppState));
    } catch (e) {
        console.error('Chyba při ukládání dat:', e);
    }
}
