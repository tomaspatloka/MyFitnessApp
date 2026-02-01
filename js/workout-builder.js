// === WORKOUT BUILDER SYSTEM ===
// Systém pro tvorbu vlastních tréninků, šablony a sledování historie

class WorkoutBuilder {
    constructor() {
        this.customWorkouts = this.loadCustomWorkouts();
        this.workoutHistory = this.loadWorkoutHistory();
        this.templates = this.getDefaultTemplates();
        this.activeWorkout = null;
        this.workoutTimer = null;
        this.currentExerciseIndex = 0;
    }

    // === DATA PERSISTENCE ===
    loadCustomWorkouts() {
        const saved = localStorage.getItem(`customWorkouts_${AppState.currentProfile}`);
        return saved ? JSON.parse(saved) : [];
    }

    saveCustomWorkouts() {
        localStorage.setItem(`customWorkouts_${AppState.currentProfile}`, JSON.stringify(this.customWorkouts));
    }

    loadWorkoutHistory() {
        const saved = localStorage.getItem(`workoutHistory_${AppState.currentProfile}`);
        return saved ? JSON.parse(saved) : [];
    }

    saveWorkoutHistory() {
        localStorage.setItem(`workoutHistory_${AppState.currentProfile}`, JSON.stringify(this.workoutHistory));
    }

    // === WORKOUT TEMPLATES ===
    getDefaultTemplates() {
        return [
            {
                id: 'push-pull-legs',
                name: 'Push/Pull/Legs (PPL)',
                category: 'strength',
                description: '3denní cyklus zaměřený na tlačné svaly, tahové svaly a nohy',
                workouts: [
                    {
                        name: 'Push Day (Tlak)',
                        exercises: [
                            { name: 'Kliky', sets: 4, reps: '8-12', rest: 90, notes: 'Standardní nebo wide grip' },
                            { name: 'Pike Push-ups', sets: 3, reps: '8-10', rest: 90, notes: 'Pro ramena' },
                            { name: 'Diamond Push-ups', sets: 3, reps: '8-12', rest: 60, notes: 'Pro triceps' },
                            { name: 'Dips na židli', sets: 3, reps: '10-15', rest: 60, notes: 'Hrudník a triceps' }
                        ]
                    },
                    {
                        name: 'Pull Day (Tah)',
                        exercises: [
                            { name: 'Australské kliky', sets: 4, reps: '8-12', rest: 90, notes: 'Pod stolem nebo tyčí' },
                            { name: 'Superman pulls', sets: 3, reps: '12-15', rest: 60, notes: 'Záda a zadní ramena' },
                            { name: 'Reverse snow angels', sets: 3, reps: '15', rest: 60, notes: 'Horní záda' },
                            { name: 'Biceps curl s gumou', sets: 3, reps: '12-15', rest: 45, notes: 'Izolace bicepsu' }
                        ]
                    },
                    {
                        name: 'Leg Day (Nohy)',
                        exercises: [
                            { name: 'Dřepy', sets: 4, reps: '12-15', rest: 90, notes: 'Sumo nebo standardní' },
                            { name: 'Výpady v chůzi', sets: 3, reps: '10/noha', rest: 90, notes: 'Kvadricepsy a hýždě' },
                            { name: 'Bulgarian split squat', sets: 3, reps: '10/noha', rest: 75, notes: 'Zadní noha na židli' },
                            { name: 'Calf raises', sets: 4, reps: '15-20', rest: 45, notes: 'Lýtka' }
                        ]
                    }
                ]
            },
            {
                id: 'upper-lower',
                name: 'Upper/Lower Split',
                category: 'strength',
                description: '4denní split - 2x horní tělo, 2x dolní tělo',
                workouts: [
                    {
                        name: 'Upper Body A',
                        exercises: [
                            { name: 'Kliky', sets: 4, reps: '8-12', rest: 90, notes: 'Standardní varianta' },
                            { name: 'Australské kliky', sets: 3, reps: '8-12', rest: 90, notes: 'Horizontální tah' },
                            { name: 'Pike push-ups', sets: 3, reps: '8-10', rest: 75, notes: 'Ramena' },
                            { name: 'Plank row', sets: 3, reps: '10/strana', rest: 60, notes: 'Core a záda' }
                        ]
                    },
                    {
                        name: 'Lower Body A',
                        exercises: [
                            { name: 'Dřepy', sets: 4, reps: '12-15', rest: 90, notes: 'Těžká varianta' },
                            { name: 'Romanian deadlift', sets: 3, reps: '10-12', rest: 90, notes: 'S činkami nebo gumou' },
                            { name: 'Výpady', sets: 3, reps: '10/noha', rest: 75, notes: 'Statické nebo v chůzi' },
                            { name: 'Glute bridges', sets: 3, reps: '15', rest: 60, notes: 'Hýždě' }
                        ]
                    },
                    {
                        name: 'Upper Body B',
                        exercises: [
                            { name: 'Diamond push-ups', sets: 4, reps: '8-12', rest: 90, notes: 'Triceps focus' },
                            { name: 'Wide grip push-ups', sets: 3, reps: '10-15', rest: 75, notes: 'Hrudník focus' },
                            { name: 'Superman pulls', sets: 3, reps: '12-15', rest: 60, notes: 'Záda' },
                            { name: 'Lateral raises', sets: 3, reps: '12-15', rest: 60, notes: 'Boční ramena' }
                        ]
                    },
                    {
                        name: 'Lower Body B',
                        exercises: [
                            { name: 'Sumo dřepy', sets: 4, reps: '12-15', rest: 90, notes: 'Široký stance' },
                            { name: 'Single leg deadlift', sets: 3, reps: '10/noha', rest: 90, notes: 'Rovnováha' },
                            { name: 'Bulgarian split squat', sets: 3, reps: '10/noha', rest: 75, notes: 'Intenzivní' },
                            { name: 'Calf raises', sets: 4, reps: '15-20', rest: 45, notes: 'Lýtka' }
                        ]
                    }
                ]
            },
            {
                id: 'full-body',
                name: 'Full Body 3x týdně',
                category: 'strength',
                description: 'Komplexní trénink celého těla 3x týdně',
                workouts: [
                    {
                        name: 'Full Body A',
                        exercises: [
                            { name: 'Dřepy', sets: 4, reps: '10-12', rest: 90, notes: 'Compound movement' },
                            { name: 'Kliky', sets: 3, reps: '10-15', rest: 90, notes: 'Horní tlak' },
                            { name: 'Australské kliky', sets: 3, reps: '8-12', rest: 90, notes: 'Horní tah' },
                            { name: 'Výpady', sets: 3, reps: '10/noha', rest: 75, notes: 'Nohy' },
                            { name: 'Prkno', sets: 3, reps: '45-60s', rest: 60, notes: 'Core' }
                        ]
                    },
                    {
                        name: 'Full Body B',
                        exercises: [
                            { name: 'Bulgarian split squat', sets: 3, reps: '10/noha', rest: 90, notes: 'Unilateral' },
                            { name: 'Pike push-ups', sets: 3, reps: '8-10', rest: 90, notes: 'Ramena' },
                            { name: 'Superman pulls', sets: 3, reps: '12-15', rest: 75, notes: 'Záda' },
                            { name: 'Glute bridges', sets: 3, reps: '15', rest: 60, notes: 'Hýždě' },
                            { name: 'Russian twists', sets: 3, reps: '20', rest: 60, notes: 'Core rotace' }
                        ]
                    },
                    {
                        name: 'Full Body C',
                        exercises: [
                            { name: 'Jump squats', sets: 3, reps: '10', rest: 90, notes: 'Výbušnost' },
                            { name: 'Wide push-ups', sets: 3, reps: '10-15', rest: 90, notes: 'Hrudník' },
                            { name: 'Reverse snow angels', sets: 3, reps: '15', rest: 60, notes: 'Horní záda' },
                            { name: 'Step-ups', sets: 3, reps: '12/noha', rest: 75, notes: 'Nohy' },
                            { name: 'Bicycle crunches', sets: 3, reps: '20', rest: 60, notes: 'Core' }
                        ]
                    }
                ]
            },
            {
                id: 'hiit-cardio',
                name: 'HIIT Kardio',
                category: 'cardio',
                description: 'Vysokointenzivní intervalový trénink',
                workouts: [
                    {
                        name: 'HIIT Basic',
                        exercises: [
                            { name: 'Jumping jacks', sets: 4, reps: '30s', rest: 30, notes: 'Zahřátí' },
                            { name: 'Burpees', sets: 4, reps: '30s', rest: 30, notes: 'Celé tělo' },
                            { name: 'High knees', sets: 4, reps: '30s', rest: 30, notes: 'Kardio' },
                            { name: 'Mountain climbers', sets: 4, reps: '30s', rest: 30, notes: 'Core a kardio' },
                            { name: 'Jump squats', sets: 4, reps: '30s', rest: 30, notes: 'Nohy explosive' }
                        ]
                    }
                ]
            },
            {
                id: 'core-abs',
                name: 'Core & Abs Focus',
                category: 'core',
                description: 'Zaměření na core a břišní svaly',
                workouts: [
                    {
                        name: 'Abs Destroyer',
                        exercises: [
                            { name: 'Prkno', sets: 3, reps: '60s', rest: 45, notes: 'Základní držení' },
                            { name: 'Boční prkno', sets: 3, reps: '45s/strana', rest: 45, notes: 'Šikmé svaly' },
                            { name: 'Leh-sedy', sets: 4, reps: '15-20', rest: 60, notes: 'Horní břicho' },
                            { name: 'Leg raises', sets: 3, reps: '12-15', rest: 60, notes: 'Dolní břicho' },
                            { name: 'Russian twists', sets: 3, reps: '30', rest: 45, notes: 'Rotace' },
                            { name: 'Dead bug', sets: 3, reps: '20', rest: 45, notes: 'Koordinace' }
                        ]
                    }
                ]
            }
        ];
    }

    // === CUSTOM WORKOUT MANAGEMENT ===
    createCustomWorkout(name, exercises, category = 'custom') {
        const workout = {
            id: Date.now().toString(),
            name: name,
            category: category,
            exercises: exercises,
            createdAt: new Date().toISOString(),
            lastUsed: null,
            timesCompleted: 0
        };

        this.customWorkouts.push(workout);
        this.saveCustomWorkouts();
        return workout;
    }

    updateCustomWorkout(workoutId, updates) {
        const index = this.customWorkouts.findIndex(w => w.id === workoutId);
        if (index !== -1) {
            this.customWorkouts[index] = { ...this.customWorkouts[index], ...updates };
            this.saveCustomWorkouts();
            return true;
        }
        return false;
    }

    deleteCustomWorkout(workoutId) {
        this.customWorkouts = this.customWorkouts.filter(w => w.id !== workoutId);
        this.saveCustomWorkouts();
    }

    // === WORKOUT FROM TEMPLATE ===
    createWorkoutFromTemplate(templateId, workoutIndex) {
        const template = this.templates.find(t => t.id === templateId);
        if (!template || !template.workouts[workoutIndex]) return null;

        const workout = template.workouts[workoutIndex];
        return this.createCustomWorkout(
            workout.name,
            workout.exercises,
            template.category
        );
    }

    // === ACTIVE WORKOUT SESSION ===
    startWorkout(workout) {
        this.activeWorkout = {
            workout: workout,
            startTime: Date.now(),
            exercises: workout.exercises.map(ex => ({
                ...ex,
                completedSets: [],
                currentSet: 0
            })),
            currentExerciseIndex: 0,
            totalRest: 0,
            notes: ''
        };
        return this.activeWorkout;
    }

    completeSet(exerciseIndex, reps, weight = 0) {
        if (!this.activeWorkout) return false;

        const exercise = this.activeWorkout.exercises[exerciseIndex];
        exercise.completedSets.push({
            reps: reps,
            weight: weight,
            timestamp: Date.now()
        });
        exercise.currentSet++;

        return true;
    }

    skipExercise(exerciseIndex) {
        if (!this.activeWorkout) return false;
        this.activeWorkout.exercises[exerciseIndex].skipped = true;
        return true;
    }

    finishWorkout(notes = '') {
        if (!this.activeWorkout) return null;

        const session = {
            id: Date.now().toString(),
            workoutId: this.activeWorkout.workout.id,
            workoutName: this.activeWorkout.workout.name,
            date: new Date().toISOString(),
            duration: Math.round((Date.now() - this.activeWorkout.startTime) / 1000), // seconds
            exercises: this.activeWorkout.exercises.map(ex => ({
                name: ex.name,
                plannedSets: ex.sets,
                completedSets: ex.completedSets,
                skipped: ex.skipped || false
            })),
            notes: notes,
            totalSets: this.activeWorkout.exercises.reduce((sum, ex) => sum + ex.completedSets.length, 0)
        };

        this.workoutHistory.push(session);
        this.saveWorkoutHistory();

        // Update workout stats
        const workout = this.customWorkouts.find(w => w.id === this.activeWorkout.workout.id);
        if (workout) {
            workout.lastUsed = new Date().toISOString();
            workout.timesCompleted = (workout.timesCompleted || 0) + 1;
            this.saveCustomWorkouts();
        }

        const completedWorkout = this.activeWorkout;
        this.activeWorkout = null;

        return session;
    }

    cancelWorkout() {
        this.activeWorkout = null;
        if (this.workoutTimer) {
            clearInterval(this.workoutTimer);
            this.workoutTimer = null;
        }
    }

    // === WORKOUT HISTORY & STATS ===
    getWorkoutHistory(limit = 10) {
        return this.workoutHistory
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
    }

    getWorkoutStats(workoutId) {
        const sessions = this.workoutHistory.filter(s => s.workoutId === workoutId);

        if (sessions.length === 0) return null;

        const totalSessions = sessions.length;
        const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
        const avgDuration = Math.round(totalDuration / totalSessions);

        return {
            totalSessions,
            avgDuration,
            lastCompleted: sessions[0].date,
            totalSets: sessions.reduce((sum, s) => sum + s.totalSets, 0)
        };
    }

    getExerciseProgress(exerciseName) {
        const exerciseData = [];

        this.workoutHistory.forEach(session => {
            session.exercises.forEach(ex => {
                if (ex.name === exerciseName && ex.completedSets.length > 0) {
                    ex.completedSets.forEach(set => {
                        exerciseData.push({
                            date: session.date,
                            reps: set.reps,
                            weight: set.weight
                        });
                    });
                }
            });
        });

        return exerciseData.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    // === REST TIMER ===
    startRestTimer(seconds, onTick, onComplete) {
        if (this.workoutTimer) {
            clearInterval(this.workoutTimer);
        }

        let remaining = seconds;
        onTick(remaining);

        this.workoutTimer = setInterval(() => {
            remaining--;
            onTick(remaining);

            if (remaining <= 0) {
                clearInterval(this.workoutTimer);
                this.workoutTimer = null;
                onComplete();
            }
        }, 1000);
    }

    stopRestTimer() {
        if (this.workoutTimer) {
            clearInterval(this.workoutTimer);
            this.workoutTimer = null;
        }
    }
}

// Initialize global instance
if (typeof window !== 'undefined') {
    window.WorkoutBuilderInstance = new WorkoutBuilder();
}
