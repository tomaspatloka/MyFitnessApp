"use strict";

// === EXERCISE MANAGER ===
const ExerciseManager = {
    
    // Kategorie cviků
    categories: [
        { id: 'strength', name: 'Síla', icon: 'fitness_center', color: '#e53935' },
        { id: 'cardio', name: 'Kardio', icon: 'directions_run', color: '#fb8c00' },
        { id: 'flexibility', name: 'Flexibilita', icon: 'self_improvement', color: '#7cb342' },
        { id: 'recovery', name: 'Regenerace', icon: 'spa', color: '#00acc1' },
        { id: 'core', name: 'Core', icon: 'accessibility_new', color: '#8e24aa' },
        { id: 'other', name: 'Ostatní', icon: 'more_horiz', color: '#757575' }
    ],

    // Časy dne
    timeSlots: [
        { id: 'morning', name: 'Ráno', icon: 'wb_sunny' },
        { id: 'afternoon', name: 'Odpoledne', icon: 'wb_twilight' },
        { id: 'evening', name: 'Večer', icon: 'nights_stay' }
    ],

    // Dny v týdnu
    weekDays: [
        { id: 'monday', name: 'Pondělí' },
        { id: 'tuesday', name: 'Úterý' },
        { id: 'wednesday', name: 'Středa' },
        { id: 'thursday', name: 'Čtvrtek' },
        { id: 'friday', name: 'Pátek' },
        { id: 'saturday', name: 'Sobota' },
        { id: 'sunday', name: 'Neděle' }
    ],

    // Vlastní cviky (ukládané do localStorage)
    customExercises: [],

    // Aktuálně editovaný cvik
    currentEditId: null,

    // === INICIALIZACE ===
    init() {
        this.loadCustomExercises();
        this.createModal();
        console.log('ExerciseManager initialized');
    },

    loadCustomExercises() {
        const saved = localStorage.getItem('customExercises');
        if (saved) {
            this.customExercises = JSON.parse(saved);
        }
    },

    saveCustomExercises() {
        localStorage.setItem('customExercises', JSON.stringify(this.customExercises));
    },

    // === CRUD OPERACE ===
    
    // Vytvořit nový cvik
    createExercise(exerciseData) {
        const newExercise = {
            id: 'custom_' + Date.now(),
            title: exerciseData.title,
            description: exerciseData.description || '',
            category: exerciseData.category || 'other',
            time: exerciseData.time || 'morning',
            details: exerciseData.details || '',
            steps: exerciseData.steps || [],
            tips: exerciseData.tips || [],
            duration: exerciseData.duration || '',
            sets: exerciseData.sets || '',
            isCustom: true,
            createdAt: new Date().toISOString()
        };

        this.customExercises.push(newExercise);
        this.saveCustomExercises();
        
        // Přidat do ExerciseDescriptions pro zobrazení detailů
        this.addToDescriptions(newExercise);

        return newExercise;
    },

    // Aktualizovat cvik
    updateExercise(exerciseId, exerciseData) {
        const index = this.customExercises.findIndex(e => e.id === exerciseId);
        if (index !== -1) {
            this.customExercises[index] = {
                ...this.customExercises[index],
                ...exerciseData,
                updatedAt: new Date().toISOString()
            };
            this.saveCustomExercises();
            this.addToDescriptions(this.customExercises[index]);
            return this.customExercises[index];
        }
        return null;
    },

    // Smazat cvik
    deleteExercise(exerciseId) {
        const index = this.customExercises.findIndex(e => e.id === exerciseId);
        if (index !== -1) {
            const exercise = this.customExercises[index];
            this.customExercises.splice(index, 1);
            this.saveCustomExercises();
            
            // Odstranit z ExerciseDescriptions
            if (window.ExerciseDescriptions && window.ExerciseDescriptions[exercise.title]) {
                delete window.ExerciseDescriptions[exercise.title];
            }
            
            return true;
        }
        return false;
    },

    // Získat cvik podle ID
    getExercise(exerciseId) {
        return this.customExercises.find(e => e.id === exerciseId);
    },

    // Získat všechny vlastní cviky
    getAllCustomExercises() {
        return this.customExercises;
    },

    // Získat cviky podle kategorie
    getExercisesByCategory(categoryId) {
        return this.customExercises.filter(e => e.category === categoryId);
    },

    // Přidat cvik do plánu na konkrétní den
    addExerciseToDay(exerciseId, weekNumber, dayId) {
        const exercise = this.getExercise(exerciseId);
        if (!exercise) return false;

        // Získat data týdne
        if (!AppState.completionData[weekNumber]) {
            initializeWeekData(weekNumber);
        }

        const dayData = AppState.completionData[weekNumber][dayId];
        if (!dayData) return false;

        // Vytvořit nový záznam cvičení
        const newId = Math.max(...dayData.exercises.map(e => e.id), 0) + 1;
        const newExercise = {
            id: newId,
            title: exercise.title,
            time: exercise.time,
            done: false,
            details: exercise.details || exercise.duration || exercise.sets,
            isCustom: true,
            customId: exercise.id
        };

        dayData.exercises.push(newExercise);
        dayData.total = dayData.exercises.length;
        
        saveData();
        return true;
    },

    // Odebrat cvik z plánu
    removeExerciseFromDay(exerciseIndex, weekNumber, dayId) {
        if (!AppState.completionData[weekNumber]) return false;
        
        const dayData = AppState.completionData[weekNumber][dayId];
        if (!dayData || !dayData.exercises[exerciseIndex]) return false;

        dayData.exercises.splice(exerciseIndex, 1);
        dayData.total = dayData.exercises.length;
        dayData.completed = dayData.exercises.filter(e => e.done).length;
        
        // Přečíslovat ID
        dayData.exercises.forEach((ex, idx) => {
            ex.id = idx + 1;
        });
        
        saveData();
        return true;
    },

    // Přidat do window.ExerciseDescriptions
    addToDescriptions(exercise) {
        if (!window.ExerciseDescriptions) {
            window.ExerciseDescriptions = {};
        }

        const category = this.categories.find(c => c.id === exercise.category);
        const icon = category ? this.getCategoryEmoji(exercise.category) : '🏋️';

        window.ExerciseDescriptions[exercise.title] = {
            title: `${icon} ${exercise.title}`,
            description: exercise.description || 'Vlastní cvičení',
            steps: exercise.steps.length > 0 ? exercise.steps : ['Proveďte cvičení podle popisu'],
            tips: exercise.tips.length > 0 ? exercise.tips : ['Dbejte na správnou techniku'],
            duration: exercise.duration || '',
            sets: exercise.sets || ''
        };
    },

    getCategoryEmoji(categoryId) {
        const emojis = {
            'strength': '💪',
            'cardio': '🏃',
            'flexibility': '🧘',
            'recovery': '🧖',
            'core': '🎯',
            'other': '⭐'
        };
        return emojis[categoryId] || '⭐';
    },

    // === UI - VYTVOŘENÍ MODALU ===
    createModal() {
        // Kontrola jestli modal už neexistuje
        if (document.getElementById('exerciseEditorModal')) return;

        const modalHtml = `
            <div class="modal" id="exerciseEditorModal">
                <div class="modal-content exercise-editor-modal">
                    <div class="modal-header">
                        <span class="material-symbols-outlined modal-icon">edit_note</span>
                        <h3 id="exerciseEditorTitle">Nový cvik</h3>
                        <button class="icon-button modal-close-btn" onclick="ExerciseManager.closeEditor()">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    
                    <div class="exercise-editor-content">
                        <input type="hidden" id="exerciseEditId">
                        
                        <!-- Základní info -->
                        <div class="form-group">
                            <label class="form-label">Název cviku *</label>
                            <input type="text" id="exerciseName" class="text-field" placeholder="např. Kliky s výskokem" maxlength="50">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Popis</label>
                            <textarea id="exerciseDescription" class="text-field textarea" placeholder="Krátký popis cviku..." rows="2" maxlength="200"></textarea>
                        </div>
                        
                        <!-- Kategorie a čas -->
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Kategorie</label>
                                <div class="category-selector" id="categorySelector">
                                    <!-- Kategorie budou generovány -->
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Čas dne</label>
                                <div class="time-selector" id="timeSelector">
                                    <!-- Časy budou generovány -->
                                </div>
                            </div>
                        </div>
                        
                        <!-- Detaily -->
                        <div class="form-group">
                            <label class="form-label">Série / Opakování</label>
                            <input type="text" id="exerciseSets" class="text-field" placeholder="např. 3 série × 12 opakování">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Délka / Trvání</label>
                            <input type="text" id="exerciseDuration" class="text-field" placeholder="např. 10 minut">
                        </div>
                        
                        <!-- Kroky -->
                        <div class="form-group">
                            <label class="form-label">Postup (každý krok na nový řádek)</label>
                            <textarea id="exerciseSteps" class="text-field textarea" placeholder="1. První krok&#10;2. Druhý krok&#10;3. Třetí krok" rows="4"></textarea>
                        </div>
                        
                        <!-- Tipy -->
                        <div class="form-group">
                            <label class="form-label">Tipy (každý tip na nový řádek)</label>
                            <textarea id="exerciseTips" class="text-field textarea" placeholder="Dbejte na správnou techniku&#10;Dýchejte pravidelně" rows="3"></textarea>
                        </div>
                    </div>
                    
                    <div class="modal-actions">
                        <button class="button text-button" onclick="ExerciseManager.closeEditor()">Zrušit</button>
                        <button class="button filled-button" onclick="ExerciseManager.saveExercise()">
                            <span class="material-symbols-outlined">save</span>
                            Uložit
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Modal pro přidání cviku do plánu -->
            <div class="modal" id="addToPlanModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <span class="material-symbols-outlined modal-icon">calendar_add_on</span>
                        <h3>Přidat do plánu</h3>
                    </div>
                    
                    <div id="addToPlanContent">
                        <!-- Obsah bude generován -->
                    </div>
                    
                    <div class="modal-actions">
                        <button class="button text-button" onclick="closeModal('addToPlanModal')">Zrušit</button>
                    </div>
                </div>
            </div>
        `;

        // Přidat do body
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Inicializovat selektory
        this.initSelectors();
    },

    initSelectors() {
        // Kategorie
        const categorySelector = document.getElementById('categorySelector');
        if (categorySelector) {
            categorySelector.innerHTML = this.categories.map(cat => `
                <button type="button" class="category-chip" data-category="${cat.id}" onclick="ExerciseManager.selectCategory('${cat.id}')" style="--cat-color: ${cat.color}">
                    <span class="material-symbols-outlined">${cat.icon}</span>
                    <span>${cat.name}</span>
                </button>
            `).join('');
        }

        // Čas
        const timeSelector = document.getElementById('timeSelector');
        if (timeSelector) {
            timeSelector.innerHTML = this.timeSlots.map(time => `
                <button type="button" class="time-chip" data-time="${time.id}" onclick="ExerciseManager.selectTime('${time.id}')">
                    <span class="material-symbols-outlined">${time.icon}</span>
                    <span>${time.name}</span>
                </button>
            `).join('');
        }
    },

    selectCategory(categoryId) {
        document.querySelectorAll('.category-chip').forEach(chip => {
            chip.classList.toggle('selected', chip.dataset.category === categoryId);
        });
    },

    selectTime(timeId) {
        document.querySelectorAll('.time-chip').forEach(chip => {
            chip.classList.toggle('selected', chip.dataset.time === timeId);
        });
    },

    // === EDITOR FUNKCE ===
    openEditor(exerciseId = null) {
        this.currentEditId = exerciseId;
        
        const modal = document.getElementById('exerciseEditorModal');
        const title = document.getElementById('exerciseEditorTitle');
        
        if (exerciseId) {
            // Editace existujícího
            const exercise = this.getExercise(exerciseId);
            if (exercise) {
                title.textContent = 'Upravit cvik';
                this.fillForm(exercise);
            }
        } else {
            // Nový cvik
            title.textContent = 'Nový cvik';
            this.clearForm();
        }
        
        modal.classList.add('active');
    },

    closeEditor() {
        const modal = document.getElementById('exerciseEditorModal');
        modal.classList.remove('active');
        this.currentEditId = null;
        this.clearForm();
    },

    fillForm(exercise) {
        document.getElementById('exerciseEditId').value = exercise.id;
        document.getElementById('exerciseName').value = exercise.title;
        document.getElementById('exerciseDescription').value = exercise.description || '';
        document.getElementById('exerciseSets').value = exercise.sets || '';
        document.getElementById('exerciseDuration').value = exercise.duration || '';
        document.getElementById('exerciseSteps').value = (exercise.steps || []).join('\n');
        document.getElementById('exerciseTips').value = (exercise.tips || []).join('\n');
        
        this.selectCategory(exercise.category || 'other');
        this.selectTime(exercise.time || 'morning');
    },

    clearForm() {
        document.getElementById('exerciseEditId').value = '';
        document.getElementById('exerciseName').value = '';
        document.getElementById('exerciseDescription').value = '';
        document.getElementById('exerciseSets').value = '';
        document.getElementById('exerciseDuration').value = '';
        document.getElementById('exerciseSteps').value = '';
        document.getElementById('exerciseTips').value = '';
        
        // Reset selektorů
        document.querySelectorAll('.category-chip').forEach(c => c.classList.remove('selected'));
        document.querySelectorAll('.time-chip').forEach(c => c.classList.remove('selected'));
        
        // Výchozí hodnoty
        this.selectCategory('strength');
        this.selectTime('morning');
    },

    saveExercise() {
        const name = document.getElementById('exerciseName').value.trim();
        
        if (!name) {
            showNotification('Zadejte název cviku');
            return;
        }

        const selectedCategory = document.querySelector('.category-chip.selected');
        const selectedTime = document.querySelector('.time-chip.selected');

        const exerciseData = {
            title: name,
            description: document.getElementById('exerciseDescription').value.trim(),
            category: selectedCategory ? selectedCategory.dataset.category : 'other',
            time: selectedTime ? selectedTime.dataset.time : 'morning',
            sets: document.getElementById('exerciseSets').value.trim(),
            duration: document.getElementById('exerciseDuration').value.trim(),
            details: document.getElementById('exerciseSets').value.trim() || document.getElementById('exerciseDuration').value.trim(),
            steps: document.getElementById('exerciseSteps').value.split('\n').filter(s => s.trim()),
            tips: document.getElementById('exerciseTips').value.split('\n').filter(t => t.trim())
        };

        if (this.currentEditId) {
            // Aktualizace
            this.updateExercise(this.currentEditId, exerciseData);
            showNotification('Cvik byl upraven');
        } else {
            // Nový cvik
            this.createExercise(exerciseData);
            showNotification('Cvik byl vytvořen');
        }

        this.closeEditor();
        
        // Obnovit zobrazení pokud jsme na stránce s cviky
        if (typeof renderCustomExercisesTab === 'function') {
            renderCustomExercisesTab();
        }
    },

    // === PŘIDÁNÍ DO PLÁNU ===
    showAddToPlanDialog(exerciseId) {
        const exercise = this.getExercise(exerciseId);
        if (!exercise) return;

        const content = `
            <p style="margin-bottom: var(--spacing-md);">Přidat <strong>${exercise.title}</strong> do:</p>
            
            <div class="form-group">
                <label class="form-label">Týden</label>
                <select id="addToPlanWeek" class="text-field">
                    ${Array.from({length: 12}, (_, i) => `
                        <option value="${i + 1}" ${i + 1 === AppState.currentWeek ? 'selected' : ''}>
                            Týden ${i + 1}
                        </option>
                    `).join('')}
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">Den</label>
                <div class="day-selector">
                    ${this.weekDays.map(day => `
                        <button type="button" class="day-chip" data-day="${day.id}" onclick="ExerciseManager.addToPlan('${exerciseId}', '${day.id}')">
                            ${day.name}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        document.getElementById('addToPlanContent').innerHTML = content;
        document.getElementById('addToPlanModal').classList.add('active');
    },

    addToPlan(exerciseId, dayId) {
        const week = parseInt(document.getElementById('addToPlanWeek').value);
        
        if (this.addExerciseToDay(exerciseId, week, dayId)) {
            showNotification(`Cvik přidán do ${this.weekDays.find(d => d.id === dayId).name}`);
            closeModal('addToPlanModal');
            
            // Obnovit plán pokud jsme na něm
            if (AppState.currentTab === 'plan') {
                renderPlan();
            }
        } else {
            showNotification('Nepodařilo se přidat cvik');
        }
    },

    // === RENDEROVÁNÍ SEZNAMU ===
    renderExerciseList() {
        const exercises = this.getAllCustomExercises();
        
        if (exercises.length === 0) {
            return `
                <div class="empty-state">
                    <span class="material-symbols-outlined" style="font-size: 64px; color: var(--md-sys-color-outline);">fitness_center</span>
                    <h3>Žádné vlastní cviky</h3>
                    <p>Vytvořte si vlastní cviky přizpůsobené vašim potřebám</p>
                    <button class="button filled-button" onclick="ExerciseManager.openEditor()">
                        <span class="material-symbols-outlined">add</span>
                        Vytvořit první cvik
                    </button>
                </div>
            `;
        }

        // Seskupit podle kategorie
        const grouped = {};
        this.categories.forEach(cat => {
            const catExercises = exercises.filter(e => e.category === cat.id);
            if (catExercises.length > 0) {
                grouped[cat.id] = catExercises;
            }
        });

        let html = `
            <div class="exercise-list-header">
                <span>${exercises.length} vlastních cviků</span>
                <button class="button filled-button" onclick="ExerciseManager.openEditor()">
                    <span class="material-symbols-outlined">add</span>
                    Nový cvik
                </button>
            </div>
        `;

        Object.keys(grouped).forEach(catId => {
            const category = this.categories.find(c => c.id === catId);
            const catExercises = grouped[catId];

            html += `
                <div class="exercise-category-group">
                    <div class="category-header" style="--cat-color: ${category.color}">
                        <span class="material-symbols-outlined">${category.icon}</span>
                        <span>${category.name}</span>
                        <span class="category-count">${catExercises.length}</span>
                    </div>
                    <div class="exercise-cards">
                        ${catExercises.map(ex => this.renderExerciseCard(ex)).join('')}
                    </div>
                </div>
            `;
        });

        return html;
    },

    renderExerciseCard(exercise) {
        const category = this.categories.find(c => c.id === exercise.category);
        const timeSlot = this.timeSlots.find(t => t.id === exercise.time);

        return `
            <div class="exercise-card" data-id="${exercise.id}">
                <div class="exercise-card-header">
                    <span class="exercise-card-title">${exercise.title}</span>
                    <div class="exercise-card-actions">
                        <button class="icon-button-sm" onclick="ExerciseManager.showAddToPlanDialog('${exercise.id}')" title="Přidat do plánu">
                            <span class="material-symbols-outlined">calendar_add_on</span>
                        </button>
                        <button class="icon-button-sm" onclick="ExerciseManager.openEditor('${exercise.id}')" title="Upravit">
                            <span class="material-symbols-outlined">edit</span>
                        </button>
                        <button class="icon-button-sm" onclick="ExerciseManager.confirmDelete('${exercise.id}')" title="Smazat">
                            <span class="material-symbols-outlined">delete</span>
                        </button>
                    </div>
                </div>
                <div class="exercise-card-body">
                    ${exercise.description ? `<p class="exercise-card-desc">${exercise.description}</p>` : ''}
                    <div class="exercise-card-meta">
                        <span class="time-badge time-${exercise.time}">
                            <span class="material-symbols-outlined" style="font-size: 14px;">${timeSlot?.icon || 'schedule'}</span>
                            ${timeSlot?.name || exercise.time}
                        </span>
                        ${exercise.sets ? `<span class="meta-tag">${exercise.sets}</span>` : ''}
                        ${exercise.duration ? `<span class="meta-tag">${exercise.duration}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    },

    confirmDelete(exerciseId) {
        const exercise = this.getExercise(exerciseId);
        if (!exercise) return;

        if (confirm(`Opravdu chcete smazat cvik "${exercise.title}"?`)) {
            this.deleteExercise(exerciseId);
            showNotification('Cvik byl smazán');
            
            if (typeof renderCustomExercisesTab === 'function') {
                renderCustomExercisesTab();
            }
        }
    },

    // === ŠABLONY Z EXISTUJÍCÍCH CVIKŮ ===
    getTemplates() {
        if (!window.ExerciseDescriptions) return [];
        
        return Object.keys(window.ExerciseDescriptions).map(title => {
            const desc = window.ExerciseDescriptions[title];
            return {
                title: title,
                description: desc.description,
                steps: desc.steps,
                tips: desc.tips,
                duration: desc.duration,
                sets: desc.sets
            };
        }).slice(0, 20); // Max 20 šablon
    },

    useTemplate(templateTitle) {
        const template = window.ExerciseDescriptions[templateTitle];
        if (!template) return;

        document.getElementById('exerciseName').value = templateTitle + ' (kopie)';
        document.getElementById('exerciseDescription').value = template.description || '';
        document.getElementById('exerciseSets').value = template.sets || '';
        document.getElementById('exerciseDuration').value = template.duration || '';
        document.getElementById('exerciseSteps').value = (template.steps || []).join('\n');
        document.getElementById('exerciseTips').value = (template.tips || []).join('\n');
    }
};

// === GLOBÁLNÍ FUNKCE PRO RENDEROVÁNÍ TABU ===
function renderCustomExercisesTab() {
    const content = `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">
                    <span class="material-symbols-outlined">edit_note</span>
                    Moje cviky
                </h2>
            </div>
            
            <div class="custom-exercises-container">
                ${ExerciseManager.renderExerciseList()}
            </div>
        </div>
    `;

    document.getElementById('mainContent').innerHTML = content;
}

// Inicializace při načtení
document.addEventListener('DOMContentLoaded', () => {
    ExerciseManager.init();
    
    // Načíst vlastní cviky do ExerciseDescriptions
    ExerciseManager.customExercises.forEach(ex => {
        ExerciseManager.addToDescriptions(ex);
    });
});
