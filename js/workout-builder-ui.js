// === WORKOUT BUILDER UI ===
// UI komponenty pro tvorbu a spouštění tréninků

// === MAIN WORKOUT BUILDER VIEW ===
function renderWorkoutBuilder() {
    const wb = window.WorkoutBuilderInstance;

    // Ensure instance is initialized
    if (!wb) {
        console.error('WorkoutBuilderInstance not initialized');
        return '<div class="card"><p>Chyba: Workout Builder se nenačetl správně</p></div>';
    }

    const customWorkouts = wb.customWorkouts || [];
    const templates = wb.templates || [];

    return `
        <div class="workout-builder-container">
            <!-- Header with tabs -->
            <div class="workout-tabs">
                <button class="workout-tab active" onclick="switchWorkoutTab('my-workouts')">
                    <span class="material-symbols-outlined">fitness_center</span>
                    Moje tréninky
                </button>
                <button class="workout-tab" onclick="switchWorkoutTab('templates')">
                    <span class="material-symbols-outlined">library_books</span>
                    Šablony
                </button>
                <button class="workout-tab" onclick="switchWorkoutTab('history')">
                    <span class="material-symbols-outlined">history</span>
                    Historie
                </button>
                <button class="workout-tab" onclick="switchWorkoutTab('progress')">
                    <span class="material-symbols-outlined">trending_up</span>
                    Pokrok
                </button>
                <button class="workout-tab" onclick="switchWorkoutTab('timers')">
                    <span class="material-symbols-outlined">timer</span>
                    Timery
                </button>
            </div>

            <!-- My Workouts Tab -->
            <div id="my-workouts-tab" class="workout-tab-content active">
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">
                            <span class="material-symbols-outlined">fitness_center</span>
                            Vlastní tréninky
                        </h2>
                        <button class="button filled-button" onclick="showCreateWorkoutModal()">
                            <span class="material-symbols-outlined">add</span>
                            Nový trénink
                        </button>
                    </div>

                    ${customWorkouts.length === 0 ? `
                        <div class="empty-state">
                            <span class="material-symbols-outlined" style="font-size: 64px; opacity: 0.3;">fitness_center</span>
                            <p>Zatím nemáte žádné vlastní tréninky</p>
                            <p style="font-size: 0.875rem; opacity: 0.7;">Vytvořte si vlastní nebo použijte šablonu</p>
                        </div>
                    ` : `
                        <div class="workouts-grid">
                            ${customWorkouts.map(workout => renderWorkoutCard(workout)).join('')}
                        </div>
                    `}
                </div>
            </div>

            <!-- Templates Tab -->
            <div id="templates-tab" class="workout-tab-content">
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">
                            <span class="material-symbols-outlined">library_books</span>
                            Šablony tréninků
                        </h2>
                    </div>

                    ${templates.map(template => renderTemplateCard(template)).join('')}
                </div>
            </div>

            <!-- History Tab -->
            <div id="history-tab" class="workout-tab-content">
                ${renderWorkoutHistoryTab()}
            </div>

            <!-- Progress Tab -->
            <div id="progress-tab" class="workout-tab-content">
                ${render1RMProgressTab()}
            </div>

            <!-- Timers Tab -->
            <div id="timers-tab" class="workout-tab-content">
                ${renderTimersTab()}
            </div>
        </div>
    `;
}

function renderWorkoutCard(workout) {
    const stats = window.WorkoutBuilderInstance.getWorkoutStats(workout.id);
    const exerciseCount = workout.exercises.length;

    return `
        <div class="workout-card" data-workout-id="${workout.id}">
            <div class="workout-card-header">
                <h3>${workout.name}</h3>
                <div class="workout-card-actions">
                    <button class="icon-button" onclick="editWorkout('${workout.id}')" title="Upravit">
                        <span class="material-symbols-outlined">edit</span>
                    </button>
                    <button class="icon-button" onclick="deleteWorkoutConfirm('${workout.id}')" title="Smazat">
                        <span class="material-symbols-outlined">delete</span>
                    </button>
                </div>
            </div>

            <div class="workout-card-info">
                <span><span class="material-symbols-outlined">format_list_numbered</span> ${exerciseCount} cviků</span>
                ${stats ? `<span><span class="material-symbols-outlined">check_circle</span> ${stats.totalSessions}× dokončeno</span>` : ''}
            </div>

            ${workout.exercises.slice(0, 3).map(ex => `
                <div class="workout-exercise-preview">
                    <span>${ex.name}</span>
                    <span class="workout-exercise-sets">${ex.sets}× ${ex.reps}</span>
                </div>
            `).join('')}
            ${exerciseCount > 3 ? `<div class="workout-more">+${exerciseCount - 3} dalších cviků</div>` : ''}

            <button class="button filled-button full" onclick="startWorkoutSession('${workout.id}')">
                <span class="material-symbols-outlined">play_arrow</span>
                Začít trénink
            </button>
        </div>
    `;
}

function renderTemplateCard(template) {
    return `
        <div class="template-card">
            <div class="template-header">
                <h3>${template.name}</h3>
                <span class="template-category ${template.category}">${getCategoryLabel(template.category)}</span>
            </div>
            <p class="template-description">${template.description}</p>

            <div class="template-workouts">
                ${template.workouts.map((workout, index) => `
                    <div class="template-workout-item">
                        <div class="template-workout-info">
                            <strong>${workout.name}</strong>
                            <span>${workout.exercises.length} cviků</span>
                        </div>
                        <button class="button text-button" onclick="useTemplate('${template.id}', ${index})">
                            Použít
                        </button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function renderWorkoutHistoryTab() {
    const wb = window.WorkoutBuilderInstance;
    const history = wb.getWorkoutHistory(20);

    if (history.length === 0) {
        return `
            <div class="card">
                <div class="empty-state">
                    <span class="material-symbols-outlined" style="font-size: 64px; opacity: 0.3;">history</span>
                    <p>Zatím jste nedokončili žádný trénink</p>
                </div>
            </div>
        `;
    }

    return `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">
                    <span class="material-symbols-outlined">history</span>
                    Historie tréninků
                </h2>
            </div>

            <div class="workout-history-list">
                ${history.map(session => renderHistorySession(session)).join('')}
            </div>
        </div>
    `;
}

function renderHistorySession(session) {
    const date = new Date(session.date);
    const duration = formatDuration(session.duration);
    const completedExercises = session.exercises.filter(ex => !ex.skipped).length;

    return `
        <div class="history-session" onclick="showSessionDetails('${session.id}')">
            <div class="history-session-header">
                <div>
                    <h4>${session.workoutName}</h4>
                    <div class="history-session-date">${formatDate(date)}</div>
                </div>
                <span class="material-symbols-outlined">chevron_right</span>
            </div>

            <div class="history-session-stats">
                <span><span class="material-symbols-outlined">timer</span> ${duration}</span>
                <span><span class="material-symbols-outlined">fitness_center</span> ${completedExercises} cviků</span>
                <span><span class="material-symbols-outlined">format_list_numbered</span> ${session.totalSets} sérií</span>
            </div>
        </div>
    `;
}

// === ACTIVE WORKOUT SESSION UI ===
function renderActiveWorkout() {
    const wb = window.WorkoutBuilderInstance;
    const session = wb.activeWorkout;

    if (!session) {
        renderContent('workouts');
        return;
    }

    const currentExercise = session.exercises[session.currentExerciseIndex];
    const progress = ((session.currentExerciseIndex + 1) / session.exercises.length) * 100;

    const content = `
        <div class="active-workout-container">
            <!-- Header -->
            <div class="active-workout-header">
                <button class="icon-button" onclick="pauseWorkout()">
                    <span class="material-symbols-outlined">pause</span>
                </button>
                <div class="active-workout-title">
                    <h2>${session.workout.name}</h2>
                    <div class="workout-progress-text">${session.currentExerciseIndex + 1} / ${session.exercises.length} cviků</div>
                </div>
                <button class="icon-button" onclick="cancelWorkoutConfirm()">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>

            <!-- Progress bar -->
            <div class="workout-progress-bar">
                <div class="workout-progress-fill" style="width: ${progress}%"></div>
            </div>

            <!-- Current Exercise -->
            <div class="card current-exercise-card">
                <h3 class="current-exercise-name">${currentExercise.name}</h3>
                ${currentExercise.notes ? `<p class="exercise-notes">${currentExercise.notes}</p>` : ''}

                <div class="exercise-stats-row">
                    <div class="exercise-stat">
                        <span class="exercise-stat-label">Série</span>
                        <span class="exercise-stat-value">${currentExercise.currentSet + 1} / ${currentExercise.sets}</span>
                    </div>
                    <div class="exercise-stat">
                        <span class="exercise-stat-label">Opakování</span>
                        <span class="exercise-stat-value">${currentExercise.reps}</span>
                    </div>
                    <div class="exercise-stat">
                        <span class="exercise-stat-label">Odpočinek</span>
                        <span class="exercise-stat-value">${currentExercise.rest}s</span>
                    </div>
                </div>

                <!-- Set logger -->
                <div class="set-logger">
                    <div class="form-group">
                        <label class="form-label">Opakování provedeno</label>
                        <input type="number" id="completedReps" class="text-field" placeholder="Počet" value="${currentExercise.reps.toString().split('-')[0]}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Váha (kg) <small style="opacity: 0.7;">volitelné</small></label>
                        <input type="number" id="completedWeight" class="text-field" placeholder="0" step="0.5">
                    </div>
                </div>

                <div class="exercise-actions">
                    <button class="button text-button" onclick="skipCurrentExercise()">
                        <span class="material-symbols-outlined">skip_next</span>
                        Přeskočit cvik
                    </button>
                    <button class="button filled-button" onclick="completeCurrentSet()" style="flex: 2;">
                        <span class="material-symbols-outlined">check</span>
                        Dokončit sérii
                    </button>
                </div>

                <!-- Completed sets -->
                ${currentExercise.completedSets.length > 0 ? `
                    <div class="completed-sets">
                        <h4>Dokončené série:</h4>
                        ${currentExercise.completedSets.map((set, index) => `
                            <div class="completed-set-item">
                                <span>Série ${index + 1}</span>
                                <span>${set.reps} opakování${set.weight > 0 ? ` × ${set.weight}kg` : ''}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>

            <!-- Rest Timer (hidden by default) -->
            <div id="restTimerCard" class="card rest-timer-card" style="display: none;">
                <h3>Odpočinek</h3>
                <div class="rest-timer-display" id="restTimerDisplay">60</div>
                <div class="rest-timer-actions">
                    <button class="button text-button" onclick="skipRest()">Přeskočit</button>
                    <button class="button filled-button" onclick="addRestTime(30)">+30s</button>
                </div>
            </div>

            <!-- Exercise List -->
            <div class="card">
                <h3 style="margin-bottom: var(--spacing-md);">Přehled tréninku</h3>
                ${session.exercises.map((ex, index) => `
                    <div class="exercise-list-item ${index === session.currentExerciseIndex ? 'active' : ''} ${ex.completedSets.length === ex.sets ? 'completed' : ''}">
                        <div class="exercise-list-info">
                            <span class="exercise-list-number">${index + 1}</span>
                            <div>
                                <div class="exercise-list-name">${ex.name}</div>
                                <div class="exercise-list-sets">${ex.sets}× ${ex.reps}${ex.rest ? `, ${ex.rest}s odpočinek` : ''}</div>
                            </div>
                        </div>
                        <span class="material-symbols-outlined">
                            ${ex.completedSets.length === ex.sets ? 'check_circle' : index === session.currentExerciseIndex ? 'radio_button_checked' : 'radio_button_unchecked'}
                        </span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    document.getElementById('mainContent').innerHTML = content;
}

// === WORKOUT SESSION CONTROLS ===
function startWorkoutSession(workoutId) {
    const wb = window.WorkoutBuilderInstance;
    const workout = wb.customWorkouts.find(w => w.id === workoutId);

    if (!workout) {
        showNotification('Trénink nenalezen');
        return;
    }

    wb.startWorkout(workout);
    renderActiveWorkout();
    showNotification('Trénink zahájen! 💪');
}

function completeCurrentSet() {
    const wb = window.WorkoutBuilderInstance;
    const session = wb.activeWorkout;

    if (!session) return;

    const reps = parseInt(document.getElementById('completedReps').value) || 0;
    const weight = parseFloat(document.getElementById('completedWeight').value) || 0;

    if (reps === 0) {
        showNotification('Zadejte počet opakování');
        return;
    }

    wb.completeSet(session.currentExerciseIndex, reps, weight);

    const currentExercise = session.exercises[session.currentExerciseIndex];

    // Check if all sets are completed
    if (currentExercise.completedSets.length >= currentExercise.sets) {
        // Move to next exercise
        if (session.currentExerciseIndex < session.exercises.length - 1) {
            session.currentExerciseIndex++;
            showNotification('Cvik dokončen! 🎉');
            renderActiveWorkout();
        } else {
            // Workout completed
            finishWorkoutSession();
        }
    } else {
        // Start rest timer
        startRestTimer(currentExercise.rest);
        renderActiveWorkout();
    }
}

function skipCurrentExercise() {
    const wb = window.WorkoutBuilderInstance;
    const session = wb.activeWorkout;

    if (!session) return;

    wb.skipExercise(session.currentExerciseIndex);

    if (session.currentExerciseIndex < session.exercises.length - 1) {
        session.currentExerciseIndex++;
        renderActiveWorkout();
        showNotification('Cvik přeskočen');
    } else {
        finishWorkoutSession();
    }
}

function startRestTimer(seconds) {
    const wb = window.WorkoutBuilderInstance;
    const timerCard = document.getElementById('restTimerCard');
    const timerDisplay = document.getElementById('restTimerDisplay');

    timerCard.style.display = 'block';

    wb.startRestTimer(
        seconds,
        (remaining) => {
            timerDisplay.textContent = remaining;
            if (remaining <= 3 && remaining > 0) {
                timerDisplay.style.color = 'var(--md-sys-color-error)';
            }
        },
        () => {
            timerCard.style.display = 'none';
            showNotification('Odpočinek dokončen! 💪');
            if ('vibrate' in navigator) {
                navigator.vibrate([200, 100, 200]);
            }
        }
    );
}

function skipRest() {
    const wb = window.WorkoutBuilderInstance;
    wb.stopRestTimer();
    document.getElementById('restTimerCard').style.display = 'none';
}

function addRestTime(seconds) {
    showNotification(`+${seconds}s přidáno`);
}

function pauseWorkout() {
    if (confirm('Pozastavit trénink?')) {
        // TODO: Implement pause functionality
        showNotification('Trénink pozastaven');
    }
}

function cancelWorkoutConfirm() {
    if (confirm('Opravdu chcete zrušit trénink? Váš pokrok bude ztracen.')) {
        const wb = window.WorkoutBuilderInstance;
        wb.cancelWorkout();
        renderContent('workouts');
        showNotification('Trénink zrušen');
    }
}

function finishWorkoutSession() {
    const wb = window.WorkoutBuilderInstance;
    const session = wb.activeWorkout;

    // Calculate workout stats
    const duration = Math.round((Date.now() - session.startTime) / 1000);
    const durationMins = Math.floor(duration / 60);
    const completedExercises = session.exercises.filter(ex => ex.completedSets.length > 0).length;
    const totalSets = session.exercises.reduce((sum, ex) => sum + ex.completedSets.length, 0);

    const notes = prompt('Poznámky k tréninku (volitelné):');
    const completedSession = wb.finishWorkout(notes || '');

    // Show completion notification with stats
    const stats = `⏱️ ${durationMins} min | 💪 ${completedExercises} cviků | 📊 ${totalSets} sérií`;
    showNotification(`Gratulujeme! Trénink dokončen! 🎉\n${stats}`);

    // Browser notification if supported
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Trénink dokončen! 🎉', {
            body: `${session.workout.name}\n${stats}`,
            icon: '/icons/icon-128.png',
            badge: '/icons/icon-128.png'
        });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification('Trénink dokončen! 🎉', {
                    body: `${session.workout.name}\n${stats}`,
                    icon: '/icons/icon-128.png'
                });
            }
        });
    }

    // Vibration pattern for completion
    if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 200]);
    }

    // Check for achievements
    if (typeof checkForNewAchievements !== 'undefined') {
        setTimeout(() => checkForNewAchievements(), 1000);
    }

    renderContent('workouts');
}

// === WORKOUT CREATION & EDITING ===
function showCreateWorkoutModal() {
    const modal = `
        <div class="modal active" id="createWorkoutModal">
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <span class="material-symbols-outlined modal-icon">add_circle</span>
                    <h3>Vytvořit nový trénink</h3>
                </div>

                <div class="form-group">
                    <label class="form-label">Název tréninku</label>
                    <input type="text" id="newWorkoutName" class="text-field" placeholder="např. Ranní workout">
                </div>

                <div class="form-group">
                    <label class="form-label">Kategorie</label>
                    <select id="newWorkoutCategory" class="text-field">
                        <option value="custom">Vlastní</option>
                        <option value="strength">Síla</option>
                        <option value="cardio">Kardio</option>
                        <option value="core">Core</option>
                        <option value="flexibility">Flexibilita</option>
                    </select>
                </div>

                <div id="exercisesContainer">
                    <h4 style="margin-bottom: var(--spacing-sm);">Cviky</h4>
                    <div id="exercisesList"></div>
                    <button class="button text-button full" onclick="addExerciseRow()">
                        <span class="material-symbols-outlined">add</span>
                        Přidat cvik
                    </button>
                </div>

                <div class="modal-actions">
                    <button class="button text-button" onclick="closeCreateWorkoutModal()">Zrušit</button>
                    <button class="button filled-button" onclick="saveNewWorkout()">Vytvořit</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modal);
    addExerciseRow(); // Add first exercise row
}

function addExerciseRow(exercise = null) {
    const container = document.getElementById('exercisesList');
    const index = container.children.length;

    const row = `
        <div class="exercise-row" data-index="${index}">
            <input type="text" class="text-field" placeholder="Název cviku" value="${exercise?.name || ''}" data-field="name">
            <input type="number" class="text-field" placeholder="Série" value="${exercise?.sets || 3}" data-field="sets" style="width: 80px;">
            <input type="text" class="text-field" placeholder="Opakování" value="${exercise?.reps || '10-12'}" data-field="reps" style="width: 100px;">
            <input type="number" class="text-field" placeholder="Odpočinek (s)" value="${exercise?.rest || 60}" data-field="rest" style="width: 120px;">
            <button class="icon-button" onclick="removeExerciseRow(${index})" title="Odebrat">
                <span class="material-symbols-outlined">delete</span>
            </button>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', row);
}

function removeExerciseRow(index) {
    const row = document.querySelector(`.exercise-row[data-index="${index}"]`);
    if (row) row.remove();
}

function closeCreateWorkoutModal() {
    const modal = document.getElementById('createWorkoutModal');
    if (modal) modal.remove();
}

function saveNewWorkout() {
    const name = document.getElementById('newWorkoutName').value.trim();
    const category = document.getElementById('newWorkoutCategory').value;

    if (!name) {
        showNotification('Zadejte název tréninku');
        return;
    }

    const exerciseRows = document.querySelectorAll('.exercise-row');
    const exercises = [];

    exerciseRows.forEach(row => {
        const name = row.querySelector('[data-field="name"]').value.trim();
        const sets = parseInt(row.querySelector('[data-field="sets"]').value) || 3;
        const reps = row.querySelector('[data-field="reps"]').value.trim() || '10';
        const rest = parseInt(row.querySelector('[data-field="rest"]').value) || 60;

        if (name) {
            exercises.push({ name, sets, reps, rest, notes: '' });
        }
    });

    if (exercises.length === 0) {
        showNotification('Přidejte alespoň jeden cvik');
        return;
    }

    const wb = window.WorkoutBuilderInstance;
    wb.createCustomWorkout(name, exercises, category);

    closeCreateWorkoutModal();
    renderContent('workouts');
    showNotification('Trénink vytvořen! 🎉');
}

function useTemplate(templateId, workoutIndex) {
    const wb = window.WorkoutBuilderInstance;
    wb.createWorkoutFromTemplate(templateId, workoutIndex);
    renderContent('workouts');
    switchWorkoutTab('my-workouts');
    showNotification('Trénink přidán z šablony! ✅');
}

function deleteWorkoutConfirm(workoutId) {
    if (confirm('Opravdu chcete smazat tento trénink?')) {
        const wb = window.WorkoutBuilderInstance;
        wb.deleteCustomWorkout(workoutId);
        renderContent('workouts');
        showNotification('Trénink smazán');
    }
}

// === UTILITY FUNCTIONS ===
function switchWorkoutTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.workout-tab').forEach(tab => tab.classList.remove('active'));
    event.currentTarget.classList.add('active');

    // Update tab content
    document.querySelectorAll('.workout-tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

function getCategoryLabel(category) {
    const labels = {
        custom: 'Vlastní',
        strength: 'Síla',
        cardio: 'Kardio',
        core: 'Core',
        flexibility: 'Flexibilita'
    };
    return labels[category] || category;
}

function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatDate(date) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return `Dnes ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
        return `Včera ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    } else {
        return `${date.getDate()}.${date.getMonth() + 1}. ${date.getFullYear()}`;
    }
}

function showSessionDetails(sessionId) {
    const wb = window.WorkoutBuilderInstance;
    const session = wb.workoutHistory.find(s => s.id === sessionId);

    if (!session) {
        showNotification('Trénink nenalezen');
        return;
    }

    const date = new Date(session.date);
    const duration = formatDuration(session.duration);

    const modal = `
        <div class="modal active" id="sessionDetailsModal">
            <div class="modal-content" style="max-width: 600px; max-height: 80vh; overflow-y: auto;">
                <div class="modal-header">
                    <span class="material-symbols-outlined modal-icon">fitness_center</span>
                    <h3>${session.workoutName}</h3>
                </div>

                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--spacing-md); margin-bottom: var(--spacing-lg);">
                    <div style="text-align: center;">
                        <div style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);">Datum</div>
                        <div style="font-weight: 600;">${formatDate(date)}</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);">Doba trvání</div>
                        <div style="font-weight: 600;">${duration}</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);">Celkem sérií</div>
                        <div style="font-weight: 600;">${session.totalSets}</div>
                    </div>
                </div>

                ${session.notes ? `
                    <div style="background: var(--md-sys-color-surface-variant); padding: var(--spacing-md); border-radius: var(--radius-md); margin-bottom: var(--spacing-lg);">
                        <div style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant); margin-bottom: 4px;">Poznámky</div>
                        <div>${session.notes}</div>
                    </div>
                ` : ''}

                <h4 style="margin-bottom: var(--spacing-md);">Cviky</h4>
                ${session.exercises.map(ex => `
                    <div style="background: var(--md-sys-color-surface-container-low); padding: var(--spacing-md); border-radius: var(--radius-md); margin-bottom: var(--spacing-sm);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-sm);">
                            <strong>${ex.name}</strong>
                            ${ex.skipped ? '<span style="color: var(--md-sys-color-error); font-size: 0.75rem;">Přeskočeno</span>' : ''}
                        </div>
                        ${!ex.skipped && ex.completedSets.length > 0 ? `
                            <div style="display: flex; flex-direction: column; gap: 4px;">
                                ${ex.completedSets.map((set, index) => `
                                    <div style="display: flex; justify-content: space-between; font-size: 0.875rem; padding: 4px 0; border-bottom: 1px solid var(--md-sys-color-outline-variant);">
                                        <span>Série ${index + 1}</span>
                                        <span>${set.reps} opakování${set.weight > 0 ? ` × ${set.weight}kg` : ''}</span>
                                    </div>
                                `).join('')}
                            </div>
                        ` : '<div style="font-size: 0.875rem; color: var(--md-sys-color-on-surface-variant); font-style: italic;">Žádné série</div>'}
                    </div>
                `).join('')}

                <div class="modal-actions">
                    <button class="button filled-button full" onclick="closeSessionDetailsModal()">Zavřít</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modal);
}

function closeSessionDetailsModal() {
    const modal = document.getElementById('sessionDetailsModal');
    if (modal) modal.remove();
}

function editWorkout(workoutId) {
    const wb = window.WorkoutBuilderInstance;
    const workout = wb.customWorkouts.find(w => w.id === workoutId);

    if (!workout) {
        showNotification('Trénink nenalezen');
        return;
    }

    const modal = `
        <div class="modal active" id="editWorkoutModal">
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <span class="material-symbols-outlined modal-icon">edit</span>
                    <h3>Upravit trénink</h3>
                </div>

                <div class="form-group">
                    <label class="form-label">Název tréninku</label>
                    <input type="text" id="editWorkoutName" class="text-field" value="${workout.name}">
                </div>

                <div class="form-group">
                    <label class="form-label">Kategorie</label>
                    <select id="editWorkoutCategory" class="text-field">
                        <option value="custom" ${workout.category === 'custom' ? 'selected' : ''}>Vlastní</option>
                        <option value="strength" ${workout.category === 'strength' ? 'selected' : ''}>Síla</option>
                        <option value="cardio" ${workout.category === 'cardio' ? 'selected' : ''}>Kardio</option>
                        <option value="core" ${workout.category === 'core' ? 'selected' : ''}>Core</option>
                        <option value="flexibility" ${workout.category === 'flexibility' ? 'selected' : ''}>Flexibilita</option>
                    </select>
                </div>

                <div id="editExercisesContainer">
                    <h4 style="margin-bottom: var(--spacing-sm);">Cviky</h4>
                    <div id="editExercisesList"></div>
                    <button class="button text-button full" onclick="addEditExerciseRow()">
                        <span class="material-symbols-outlined">add</span>
                        Přidat cvik
                    </button>
                </div>

                <div class="modal-actions">
                    <button class="button text-button" onclick="closeEditWorkoutModal()">Zrušit</button>
                    <button class="button filled-button" onclick="saveEditedWorkout('${workoutId}')">Uložit změny</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modal);

    // Add existing exercises
    workout.exercises.forEach(exercise => {
        addEditExerciseRow(exercise);
    });
}

function addEditExerciseRow(exercise = null) {
    const container = document.getElementById('editExercisesList');
    const index = container.children.length;

    const row = `
        <div class="exercise-row" data-index="${index}">
            <input type="text" class="text-field" placeholder="Název cviku" value="${exercise?.name || ''}" data-field="name">
            <input type="number" class="text-field" placeholder="Série" value="${exercise?.sets || 3}" data-field="sets" style="width: 80px;">
            <input type="text" class="text-field" placeholder="Opakování" value="${exercise?.reps || '10-12'}" data-field="reps" style="width: 100px;">
            <input type="number" class="text-field" placeholder="Odpočinek (s)" value="${exercise?.rest || 60}" data-field="rest" style="width: 120px;">
            <button class="icon-button" onclick="removeEditExerciseRow(${index})" title="Odebrat">
                <span class="material-symbols-outlined">delete</span>
            </button>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', row);
}

function removeEditExerciseRow(index) {
    const row = document.querySelector(`#editExercisesList .exercise-row[data-index="${index}"]`);
    if (row) row.remove();
}

function closeEditWorkoutModal() {
    const modal = document.getElementById('editWorkoutModal');
    if (modal) modal.remove();
}

function saveEditedWorkout(workoutId) {
    const name = document.getElementById('editWorkoutName').value.trim();
    const category = document.getElementById('editWorkoutCategory').value;

    if (!name) {
        showNotification('Zadejte název tréninku');
        return;
    }

    const exerciseRows = document.querySelectorAll('#editExercisesList .exercise-row');
    const exercises = [];

    exerciseRows.forEach(row => {
        const exerciseName = row.querySelector('[data-field="name"]').value.trim();
        const sets = parseInt(row.querySelector('[data-field="sets"]').value) || 3;
        const reps = row.querySelector('[data-field="reps"]').value.trim() || '10';
        const rest = parseInt(row.querySelector('[data-field="rest"]').value) || 60;

        if (exerciseName) {
            exercises.push({ name: exerciseName, sets, reps, rest, notes: '' });
        }
    });

    if (exercises.length === 0) {
        showNotification('Přidejte alespoň jeden cvik');
        return;
    }

    const wb = window.WorkoutBuilderInstance;
    wb.updateCustomWorkout(workoutId, { name, category, exercises });

    closeEditWorkoutModal();
    renderContent('workouts');
    showNotification('Trénink upraven! ✅');
}

// === 1RM PROGRESS TAB ===
function render1RMProgressTab() {
    const wb = window.WorkoutBuilderInstance;

    // Get all unique exercises with weight data
    const exercisesWithWeights = new Set();
    wb.workoutHistory.forEach(session => {
        session.exercises.forEach(ex => {
            ex.completedSets.forEach(set => {
                if (set.weight > 0) {
                    exercisesWithWeights.add(ex.name);
                }
            });
        });
    });

    const exerciseList = Array.from(exercisesWithWeights);

    return `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">
                    <span class="material-symbols-outlined">trending_up</span>
                    Pokrok síly (1RM)
                </h2>
            </div>

            ${exerciseList.length === 0 ? `
                <div class="empty-state">
                    <span class="material-symbols-outlined" style="font-size: 64px; opacity: 0.3;">trending_up</span>
                    <p>Zatím nemáte žádná data o vahách</p>
                    <p style="font-size: 0.875rem; opacity: 0.7;">Začněte zaznamenávat váhy během tréninků</p>
                </div>
            ` : `
                <div class="form-group" style="margin-bottom: var(--spacing-lg);">
                    <label class="form-label">Vyberte cvik</label>
                    <select id="exercise1RMSelect" class="text-field" onchange="show1RMChart(this.value)">
                        <option value="">-- Vyberte cvik --</option>
                        ${exerciseList.map(name => `<option value="${name}">${name}</option>`).join('')}
                    </select>
                </div>

                <div id="1rmChartContainer" style="display: none;">
                    <h3 style="margin-bottom: var(--spacing-md);" id="selectedExerciseName"></h3>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: var(--spacing-md); margin-bottom: var(--spacing-lg);">
                        <div class="stat-card">
                            <div class="stat-label">Aktuální 1RM</div>
                            <div class="stat-value" id="current1RM">-</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Osobní rekord</div>
                            <div class="stat-value" id="pr1RM">-</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Celkový pokrok</div>
                            <div class="stat-value" id="progress1RM">-</div>
                        </div>
                    </div>

                    <div class="chart-container" style="position: relative; height: 300px; margin-bottom: var(--spacing-lg);">
                        <canvas id="1rmChart"></canvas>
                    </div>

                    <h4 style="margin-bottom: var(--spacing-sm);">Kalkulačka pracovních vah</h4>
                    <div class="weight-calculator">
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: var(--spacing-sm);" id="weightRecommendations">
                        </div>
                    </div>
                </div>
            `}
        </div>
    `;
}

function show1RMChart(exerciseName) {
    if (!exerciseName) {
        document.getElementById('1rmChartContainer').style.display = 'none';
        return;
    }

    const wb = window.WorkoutBuilderInstance;
    const progress = wb.get1RMProgress(exerciseName);
    const pr = wb.getPR(exerciseName);

    if (progress.length === 0) return;

    document.getElementById('1rmChartContainer').style.display = 'block';
    document.getElementById('selectedExerciseName').textContent = exerciseName;

    // Calculate stats
    const current = progress[progress.length - 1];
    const first = progress[0];
    const totalProgress = ((current.estimated1RM - first.estimated1RM) / first.estimated1RM * 100).toFixed(1);

    document.getElementById('current1RM').textContent = `${current.estimated1RM.toFixed(1)} kg`;
    document.getElementById('pr1RM').textContent = `${pr.estimated1RM.toFixed(1)} kg`;
    document.getElementById('progress1RM').textContent = `+${totalProgress}%`;

    // Render chart
    const ctx = document.getElementById('1rmChart');
    if (window.oneRMChartInstance) {
        window.oneRMChartInstance.destroy();
    }

    const labels = progress.map(p => {
        const date = new Date(p.date);
        return `${date.getDate()}.${date.getMonth() + 1}`;
    });

    const data = progress.map(p => p.estimated1RM);

    window.oneRMChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Odhadovaný 1RM (kg)',
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
                legend: { display: false },
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

    // Weight recommendations
    const recommendationsContainer = document.getElementById('weightRecommendations');
    const repRanges = [
        { reps: 1, label: '1RM', color: '#d32f2f' },
        { reps: 3, label: '3RM', color: '#f57c00' },
        { reps: 5, label: '5RM', color: '#fbc02d' },
        { reps: 8, label: '8RM', color: '#388e3c' },
        { reps: 10, label: '10RM', color: '#1976d2' },
        { reps: 12, label: '12RM', color: '#7b1fa2' }
    ];

    recommendationsContainer.innerHTML = repRanges.map(range => {
        const weight = wb.calculateWorkingWeight(current.estimated1RM, range.reps);
        return `
            <div style="background: ${range.color}15; border-left: 3px solid ${range.color}; padding: var(--spacing-sm); border-radius: var(--radius-sm);">
                <div style="font-size: 0.75rem; opacity: 0.8;">${range.label}</div>
                <div style="font-weight: 600; font-size: 1.125rem;">${weight.toFixed(1)} kg</div>
            </div>
        `;
    }).join('');
}

// === ADVANCED TIMERS TAB ===
function renderTimersTab() {
    return `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">
                    <span class="material-symbols-outlined">timer</span>
                    Pokročilé timery
                </h2>
            </div>

            <div class="timers-grid">
                <!-- Tabata Timer -->
                <div class="timer-card">
                    <div class="timer-card-header">
                        <span class="material-symbols-outlined">whatshot</span>
                        <h3>Tabata</h3>
                    </div>
                    <p class="timer-description">8 kol × (20s práce + 10s odpočinek)</p>
                    <button class="button filled-button full" onclick="startTabata()">
                        <span class="material-symbols-outlined">play_arrow</span>
                        Spustit Tabata
                    </button>
                </div>

                <!-- EMOM Timer -->
                <div class="timer-card">
                    <div class="timer-card-header">
                        <span class="material-symbols-outlined">schedule</span>
                        <h3>EMOM</h3>
                    </div>
                    <p class="timer-description">Každou minutu na minutu</p>
                    <div class="form-group" style="margin-bottom: var(--spacing-sm);">
                        <input type="number" id="emomMinutes" class="text-field" placeholder="Počet minut" value="10" min="1" max="60">
                    </div>
                    <button class="button filled-button full" onclick="startEMOM()">
                        <span class="material-symbols-outlined">play_arrow</span>
                        Spustit EMOM
                    </button>
                </div>

                <!-- AMRAP Timer -->
                <div class="timer-card">
                    <div class="timer-card-header">
                        <span class="material-symbols-outlined">all_inclusive</span>
                        <h3>AMRAP</h3>
                    </div>
                    <p class="timer-description">Co nejvíc kol za čas</p>
                    <div class="form-group" style="margin-bottom: var(--spacing-sm);">
                        <input type="number" id="amrapMinutes" class="text-field" placeholder="Počet minut" value="15" min="1" max="60">
                    </div>
                    <button class="button filled-button full" onclick="startAMRAP()">
                        <span class="material-symbols-outlined">play_arrow</span>
                        Spustit AMRAP
                    </button>
                </div>

                <!-- Custom Interval Timer -->
                <div class="timer-card">
                    <div class="timer-card-header">
                        <span class="material-symbols-outlined">settings</span>
                        <h3>Vlastní intervaly</h3>
                    </div>
                    <p class="timer-description">Nastavte si vlastní interval</p>
                    <div class="form-group" style="margin-bottom: var(--spacing-xs);">
                        <input type="number" id="workSeconds" class="text-field" placeholder="Práce (s)" value="30">
                    </div>
                    <div class="form-group" style="margin-bottom: var(--spacing-xs);">
                        <input type="number" id="restSeconds" class="text-field" placeholder="Odpočinek (s)" value="15">
                    </div>
                    <div class="form-group" style="margin-bottom: var(--spacing-sm);">
                        <input type="number" id="intervalRounds" class="text-field" placeholder="Počet kol" value="8">
                    </div>
                    <button class="button filled-button full" onclick="startCustomInterval()">
                        <span class="material-symbols-outlined">play_arrow</span>
                        Spustit intervaly
                    </button>
                </div>
            </div>
        </div>

        <!-- Timer Modal (hidden by default) -->
        <div id="timerModal" class="timer-modal" style="display: none;">
            <div class="timer-modal-content">
                <button class="timer-close-btn" onclick="closeTimerModal()">
                    <span class="material-symbols-outlined">close</span>
                </button>
                <div id="timerDisplay" class="timer-display"></div>
                <div id="timerStatus" class="timer-status"></div>
                <div class="timer-controls">
                    <button class="button text-button" onclick="pauseTimer()">Pauza</button>
                    <button class="button filled-button" onclick="closeTimerModal()">Ukončit</button>
                </div>
            </div>
        </div>
    `;
}

// Timer functions
function startTabata() {
    const wb = window.WorkoutBuilderInstance;
    showTimerModal();

    wb.startTabataTimer(
        (workTime, round) => {
            document.getElementById('timerDisplay').textContent = workTime;
            document.getElementById('timerStatus').textContent = `Kolo ${round}/8 - PRACUJ! 💪`;
            document.getElementById('timerDisplay').style.color = 'var(--md-sys-color-primary)';
        },
        (restTime, round) => {
            document.getElementById('timerDisplay').textContent = restTime;
            document.getElementById('timerStatus').textContent = `Kolo ${round}/8 - Odpočinek`;
            document.getElementById('timerDisplay').style.color = 'var(--md-sys-color-tertiary)';
        },
        (round) => {
            if ('vibrate' in navigator) navigator.vibrate(200);
        },
        () => {
            document.getElementById('timerStatus').textContent = 'Tabata dokončeno! 🎉';
            showNotification('Tabata dokončeno! 🔥');
            if ('vibrate' in navigator) navigator.vibrate([200, 100, 200, 100, 200]);
        }
    );
}

function startEMOM() {
    const minutes = parseInt(document.getElementById('emomMinutes').value) || 10;
    const wb = window.WorkoutBuilderInstance;
    showTimerModal();

    wb.startEMOMTimer(
        minutes,
        (minute, seconds) => {
            document.getElementById('timerDisplay').textContent = seconds;
            document.getElementById('timerStatus').textContent = `Minuta ${minute}/${minutes}`;

            if (seconds === 0) {
                if ('vibrate' in navigator) navigator.vibrate(200);
            }
        },
        () => {
            document.getElementById('timerStatus').textContent = 'EMOM dokončeno! 🎉';
            showNotification('EMOM dokončeno! 💪');
        }
    );
}

function startAMRAP() {
    const minutes = parseInt(document.getElementById('amrapMinutes').value) || 15;
    const wb = window.WorkoutBuilderInstance;
    showTimerModal();

    wb.startAMRAPTimer(
        minutes,
        (mins, secs) => {
            document.getElementById('timerDisplay').textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
            document.getElementById('timerStatus').textContent = 'AMRAP - Dělej co nejvíc!';
        },
        () => {
            document.getElementById('timerStatus').textContent = 'AMRAP dokončeno! 🎉';
            showNotification('AMRAP dokončeno! 🔥');
            if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
        }
    );
}

function startCustomInterval() {
    const workSecs = parseInt(document.getElementById('workSeconds').value) || 30;
    const restSecs = parseInt(document.getElementById('restSeconds').value) || 15;
    const rounds = parseInt(document.getElementById('intervalRounds').value) || 8;

    showTimerModal();

    let currentRound = 1;

    const runRound = () => {
        if (currentRound > rounds) {
            document.getElementById('timerStatus').textContent = 'Intervaly dokončeny! 🎉';
            showNotification('Intervaly dokončeny! 💪');
            return;
        }

        // Work phase
        let workTime = workSecs;
        const workInterval = setInterval(() => {
            document.getElementById('timerDisplay').textContent = workTime;
            document.getElementById('timerStatus').textContent = `Kolo ${currentRound}/${rounds} - PRACUJ!`;
            document.getElementById('timerDisplay').style.color = 'var(--md-sys-color-primary)';
            workTime--;

            if (workTime < 0) {
                clearInterval(workInterval);

                // Rest phase
                let restTime = restSecs;
                const restInterval = setInterval(() => {
                    document.getElementById('timerDisplay').textContent = restTime;
                    document.getElementById('timerStatus').textContent = `Kolo ${currentRound}/${rounds} - Odpočinek`;
                    document.getElementById('timerDisplay').style.color = 'var(--md-sys-color-tertiary)';
                    restTime--;

                    if (restTime < 0) {
                        clearInterval(restInterval);
                        if ('vibrate' in navigator) navigator.vibrate(200);
                        currentRound++;
                        runRound();
                    }
                }, 1000);
            }
        }, 1000);
    };

    runRound();
}

function showTimerModal() {
    document.getElementById('timerModal').style.display = 'flex';
}

function closeTimerModal() {
    document.getElementById('timerModal').style.display = 'none';
    // Stop any running timers
    const wb = window.WorkoutBuilderInstance;
    if (wb.workoutTimer) {
        wb.stopRestTimer();
    }
}

function pauseTimer() {
    showNotification('Pauza (funkcionalita bude doplněna)');
}
