// === WORKOUT BUILDER UI ===
// UI komponenty pro tvorbu a spouštění tréninků

// === MAIN WORKOUT BUILDER VIEW ===
function renderWorkoutBuilder() {
    const wb = window.WorkoutBuilderInstance;
    const customWorkouts = wb.loadCustomWorkouts();
    const templates = wb.templates;

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
    const notes = prompt('Poznámky k tréninku (volitelné):');

    const session = wb.finishWorkout(notes || '');

    showNotification('Gratulujeme! Trénink dokončen! 🎉');

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
    // TODO: Implement session details modal
    showNotification('Detail tréninku (coming soon)');
}

function editWorkout(workoutId) {
    // TODO: Implement workout editing
    showNotification('Úprava tréninku (coming soon)');
}
