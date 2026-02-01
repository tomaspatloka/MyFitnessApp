// === ACHIEVEMENTS & GAMIFICATION SYSTEM ===

const AchievementSystem = {
    achievements: [
        // Začátečnické achievementy
        {
            id: 'first_workout',
            title: 'První krok',
            description: 'Dokončil jsi svůj první trénink',
            icon: '🎯',
            category: 'beginner',
            requirement: { type: 'workouts_completed', count: 1 },
            points: 10,
            unlocked: false
        },
        {
            id: 'first_week',
            title: 'Týden v pohybu',
            description: 'Dokončil jsi celý týden tréninku',
            icon: '📅',
            category: 'beginner',
            requirement: { type: 'weeks_completed', count: 1 },
            points: 25,
            unlocked: false
        },
        {
            id: 'first_weight_log',
            title: 'Váha pod kontrolou',
            description: 'Zapsal jsi svou první váhu',
            icon: '⚖️',
            category: 'beginner',
            requirement: { type: 'weight_logs', count: 1 },
            points: 5,
            unlocked: false
        },

        // Streak achievementy
        {
            id: 'streak_3',
            title: 'Rozjezd',
            description: 'Cvičil jsi 3 dny v řadě',
            icon: '🔥',
            category: 'streak',
            requirement: { type: 'streak_days', count: 3 },
            points: 15,
            unlocked: false
        },
        {
            id: 'streak_7',
            title: 'Týdenní válec',
            description: 'Cvičil jsi 7 dní v řadě',
            icon: '🔥🔥',
            category: 'streak',
            requirement: { type: 'streak_days', count: 7 },
            points: 30,
            unlocked: false
        },
        {
            id: 'streak_14',
            title: 'Nezastavitelný',
            description: 'Cvičil jsi 14 dní v řadě',
            icon: '🔥🔥🔥',
            category: 'streak',
            requirement: { type: 'streak_days', count: 14 },
            points: 50,
            unlocked: false
        },
        {
            id: 'streak_30',
            title: 'Měsíční legenda',
            description: 'Cvičil jsi 30 dní v řadě',
            icon: '💎',
            category: 'streak',
            requirement: { type: 'streak_days', count: 30 },
            points: 100,
            unlocked: false
        },

        // Výkonnostní achievementy
        {
            id: 'workouts_10',
            title: 'Dřina se vyplácí',
            description: 'Dokončil jsi 10 tréninků',
            icon: '💪',
            category: 'performance',
            requirement: { type: 'workouts_completed', count: 10 },
            points: 20,
            unlocked: false
        },
        {
            id: 'workouts_25',
            title: 'Trenér by byl hrdý',
            description: 'Dokončil jsi 25 tréninků',
            icon: '💪💪',
            category: 'performance',
            requirement: { type: 'workouts_completed', count: 25 },
            points: 35,
            unlocked: false
        },
        {
            id: 'workouts_50',
            title: 'Fitness guru',
            description: 'Dokončil jsi 50 tréninků',
            icon: '🏆',
            category: 'performance',
            requirement: { type: 'workouts_completed', count: 50 },
            points: 75,
            unlocked: false
        },
        {
            id: 'workouts_100',
            title: 'Stovkař',
            description: 'Dokončil jsi 100 tréninků',
            icon: '👑',
            category: 'performance',
            requirement: { type: 'workouts_completed', count: 100 },
            points: 150,
            unlocked: false
        },

        // Váhové achievementy
        {
            id: 'weight_loss_2',
            title: 'První úspěch',
            description: 'Zhubl jsi 2 kg',
            icon: '📉',
            category: 'weight',
            requirement: { type: 'weight_lost', count: 2 },
            points: 20,
            unlocked: false
        },
        {
            id: 'weight_loss_5',
            title: 'Skvělý pokrok',
            description: 'Zhubl jsi 5 kg',
            icon: '📉📉',
            category: 'weight',
            requirement: { type: 'weight_lost', count: 5 },
            points: 40,
            unlocked: false
        },
        {
            id: 'weight_loss_10',
            title: 'Transformace',
            description: 'Zhubl jsi 10 kg',
            icon: '⭐',
            category: 'weight',
            requirement: { type: 'weight_lost', count: 10 },
            points: 80,
            unlocked: false
        },
        {
            id: 'goal_reached',
            title: 'Cíl splněn!',
            description: 'Dosáhl jsi své cílové váhy',
            icon: '🎊',
            category: 'weight',
            requirement: { type: 'goal_weight_reached', count: 1 },
            points: 200,
            unlocked: false
        },

        // Konzistence achievementy
        {
            id: 'perfect_week',
            title: 'Dokonalý týden',
            description: 'Dokončil jsi všechny tréninky za týden',
            icon: '✨',
            category: 'consistency',
            requirement: { type: 'perfect_weeks', count: 1 },
            points: 30,
            unlocked: false
        },
        {
            id: 'early_bird',
            title: 'Ranní ptáče',
            description: 'Dokončil jsi 10 ranních tréninků',
            icon: '🌅',
            category: 'consistency',
            requirement: { type: 'morning_workouts', count: 10 },
            points: 25,
            unlocked: false
        },

        // Speciální achievementy
        {
            id: 'winter_warrior',
            title: 'Zimní válečník',
            description: 'Cvičil jsi v zimním režimu celý měsíc',
            icon: '❄️',
            category: 'special',
            requirement: { type: 'winter_days', count: 30 },
            points: 50,
            unlocked: false
        }
    ],

    // Inicializace systému
    init() {
        this.loadAchievements();
        this.checkForNewAchievements();
    },

    // Načtení odemčených achievementů z localStorage
    loadAchievements() {
        const saved = localStorage.getItem('achievements');
        if (saved) {
            const unlocked = JSON.parse(saved);
            this.achievements.forEach(achievement => {
                if (unlocked.includes(achievement.id)) {
                    achievement.unlocked = true;
                }
            });
        }
    },

    // Uložení achievementů
    saveAchievements() {
        const unlocked = this.achievements
            .filter(a => a.unlocked)
            .map(a => a.id);
        localStorage.setItem('achievements', JSON.stringify(unlocked));
    },

    // Kontrola a odemknutí nových achievementů
    checkForNewAchievements() {
        const stats = this.getPlayerStats();
        const newlyUnlocked = [];

        this.achievements.forEach(achievement => {
            if (!achievement.unlocked && this.checkRequirement(achievement.requirement, stats)) {
                achievement.unlocked = true;
                newlyUnlocked.push(achievement);
            }
        });

        if (newlyUnlocked.length > 0) {
            this.saveAchievements();
            this.showAchievementNotifications(newlyUnlocked);
        }

        return newlyUnlocked;
    },

    // Kontrola splnění požadavku
    checkRequirement(requirement, stats) {
        switch (requirement.type) {
            case 'workouts_completed':
                return stats.totalWorkouts >= requirement.count;
            case 'weeks_completed':
                return stats.weeksCompleted >= requirement.count;
            case 'weight_logs':
                return stats.weightLogs >= requirement.count;
            case 'streak_days':
                return stats.currentStreak >= requirement.count;
            case 'weight_lost':
                return stats.weightLost >= requirement.count;
            case 'goal_weight_reached':
                return stats.goalReached;
            case 'perfect_weeks':
                return stats.perfectWeeks >= requirement.count;
            case 'morning_workouts':
                return stats.morningWorkouts >= requirement.count;
            case 'winter_days':
                return stats.winterDays >= requirement.count;
            default:
                return false;
        }
    },

    // Získání statistik hráče
    getPlayerStats() {
        const stats = {
            totalWorkouts: 0,
            weeksCompleted: 0,
            weightLogs: AppState.weightLogs?.length || 0,
            currentStreak: this.calculateStreak(),
            weightLost: this.calculateWeightLost(),
            goalReached: this.checkGoalReached(),
            perfectWeeks: 0,
            morningWorkouts: 0,
            winterDays: 0
        };

        // Spočítat dokončené tréninky
        Object.keys(AppState.completionData || {}).forEach(week => {
            const weekData = AppState.completionData[week];
            let weekTotal = 0;
            let weekCompleted = 0;

            Object.keys(weekData).forEach(day => {
                if (day !== 'weekNumber') {
                    const dayData = weekData[day];
                    weekTotal += dayData.total || 0;
                    weekCompleted += dayData.completed || 0;
                    stats.totalWorkouts += dayData.completed || 0;

                    // Počítat ranní tréninky
                    if (dayData.exercises) {
                        dayData.exercises.forEach(ex => {
                            if (ex.done && ex.time === 'morning') {
                                stats.morningWorkouts++;
                            }
                        });
                    }
                }
            });

            // Perfektní týden
            if (weekTotal > 0 && weekCompleted === weekTotal) {
                stats.perfectWeeks++;
            }

            // Dokončené týdny (alespoň 80%)
            if (weekTotal > 0 && (weekCompleted / weekTotal) >= 0.8) {
                stats.weeksCompleted++;
            }
        });

        // Zimní dny (placeholder - implementovat podle potřeby)
        if (AppState.settings?.winterMode) {
            stats.winterDays = stats.totalWorkouts; // zjednodušení
        }

        return stats;
    },

    // Výpočet aktuálního streak
    calculateStreak() {
        if (!AppState.completionData) return 0;

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Získat všechny dny s dokončenými cvičeními
        const workoutDates = [];
        Object.keys(AppState.completionData).forEach(week => {
            const weekData = AppState.completionData[week];
            Object.keys(weekData).forEach(day => {
                if (day !== 'weekNumber') {
                    const dayData = weekData[day];
                    if (dayData.completed > 0) {
                        // Pro jednoduchost použijeme den v týdnu
                        // V reálné implementaci bychom potřebovali skutečná data
                        workoutDates.push(day);
                    }
                }
            });
        });

        // Zjednodušený výpočet - spočítat po sobě jdoucí dny
        let consecutiveDays = 0;
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

        for (let i = days.length - 1; i >= 0; i--) {
            const currentWeek = AppState.completionData[AppState.currentWeek];
            if (currentWeek && currentWeek[days[i]]?.completed > 0) {
                consecutiveDays++;
            } else {
                break;
            }
        }

        return consecutiveDays;
    },

    // Výpočet zhubnuté váhy
    calculateWeightLost() {
        if (!AppState.weightLogs || AppState.weightLogs.length === 0) return 0;

        const sorted = [...AppState.weightLogs].sort((a, b) =>
            new Date(a.date) - new Date(b.date)
        );

        const firstWeight = sorted[0].weight;
        const lastWeight = sorted[sorted.length - 1].weight;

        return Math.max(0, firstWeight - lastWeight);
    },

    // Kontrola dosažení cílové váhy
    checkGoalReached() {
        if (!AppState.weightLogs || AppState.weightLogs.length === 0) return false;
        if (!AppState.userData?.targetWeight) return false;

        const lastWeight = AppState.weightLogs[AppState.weightLogs.length - 1].weight;
        return lastWeight <= AppState.userData.targetWeight;
    },

    // Zobrazení notifikací o nových achievementech
    showAchievementNotifications(achievements) {
        achievements.forEach((achievement, index) => {
            setTimeout(() => {
                this.showAchievementPopup(achievement);
            }, index * 2000); // Zobrazovat po 2 sekundách
        });
    },

    // Zobrazení popup s achievementem
    showAchievementPopup(achievement) {
        const popup = document.createElement('div');
        popup.className = 'achievement-popup';
        popup.innerHTML = `
            <div class="achievement-popup-content">
                <div class="achievement-icon-large">${achievement.icon}</div>
                <div class="achievement-popup-title">Achievement odemčen!</div>
                <div class="achievement-popup-name">${achievement.title}</div>
                <div class="achievement-popup-desc">${achievement.description}</div>
                <div class="achievement-points">+${achievement.points} bodů</div>
            </div>
        `;

        document.body.appendChild(popup);

        // Animace
        setTimeout(() => popup.classList.add('show'), 100);

        // Konfety
        if (typeof triggerConfetti === 'function') {
            triggerConfetti();
        }

        // Odstranění po 5 sekundách
        setTimeout(() => {
            popup.classList.remove('show');
            setTimeout(() => popup.remove(), 500);
        }, 5000);

        // Zvuk (pokud je dostupný)
        this.playAchievementSound();
    },

    // Přehrání zvuku (placeholder)
    playAchievementSound() {
        // Implementovat pokud chcete zvukové efekty
    },

    // Získání celkových bodů
    getTotalPoints() {
        return this.achievements
            .filter(a => a.unlocked)
            .reduce((sum, a) => sum + a.points, 0);
    },

    // Získání levelu hráče
    getPlayerLevel() {
        const points = this.getTotalPoints();

        if (points < 50) return { level: 1, name: 'Začátečník', icon: '🌱' };
        if (points < 150) return { level: 2, name: 'Nadšenec', icon: '💪' };
        if (points < 300) return { level: 3, name: 'Pokročilý', icon: '🔥' };
        if (points < 500) return { level: 4, name: 'Expert', icon: '⭐' };
        if (points < 800) return { level: 5, name: 'Mistr', icon: '🏆' };
        return { level: 6, name: 'Legenda', icon: '👑' };
    },

    // Získání pokroku k dalšímu levelu
    getProgressToNextLevel() {
        const points = this.getTotalPoints();
        const thresholds = [0, 50, 150, 300, 500, 800];

        for (let i = 0; i < thresholds.length; i++) {
            if (points < thresholds[i]) {
                const current = i === 0 ? 0 : thresholds[i - 1];
                const next = thresholds[i];
                const progress = ((points - current) / (next - current)) * 100;
                return {
                    current: points,
                    needed: next,
                    progress: Math.round(progress)
                };
            }
        }

        return { current: points, needed: points, progress: 100 };
    },

    // Render seznam achievementů
    renderAchievementsList() {
        const categories = {
            beginner: 'Začátečník',
            streak: 'Série',
            performance: 'Výkon',
            weight: 'Váha',
            consistency: 'Konzistence',
            special: 'Speciální'
        };

        let html = '';

        Object.keys(categories).forEach(category => {
            const categoryAchievements = this.achievements.filter(a => a.category === category);

            if (categoryAchievements.length > 0) {
                html += `
                    <div class="achievement-category">
                        <h3 class="achievement-category-title">${categories[category]}</h3>
                        <div class="achievements-grid">
                `;

                categoryAchievements.forEach(achievement => {
                    const unlocked = achievement.unlocked ? 'unlocked' : 'locked';
                    html += `
                        <div class="achievement-card ${unlocked}">
                            <div class="achievement-icon">${achievement.icon}</div>
                            <div class="achievement-title">${achievement.title}</div>
                            <div class="achievement-desc">${achievement.description}</div>
                            <div class="achievement-points">${achievement.points} bodů</div>
                            ${!achievement.unlocked ? '<div class="achievement-lock">🔒</div>' : ''}
                        </div>
                    `;
                });

                html += `
                        </div>
                    </div>
                `;
            }
        });

        return html;
    }
};

// Export pro použití v jiných souborech
window.AchievementSystem = AchievementSystem;
