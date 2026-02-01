// === NOTIFICATION SYSTEM ===
"use strict";

const NotificationSystem = {
    // Výchozí nastavení
    defaultSettings: {
        enabled: false,
        morning: {
            enabled: true,
            time: "07:00",
            message: "Dobré ráno! Čas na ranní rozcvičku 🌅"
        },
        evening: {
            enabled: true,
            time: "18:00",
            message: "Večerní trénink tě čeká! 💪"
        },
        weighIn: {
            enabled: true,
            day: 1, // Pondělí (0 = neděle, 1 = pondělí, ...)
            time: "08:00",
            message: "Nezapomeň se dnes zvážit! ⚖️"
        },
        motivation: {
            enabled: true,
            interval: 3, // Každé 3 hodiny během aktivních hodin
            messages: [
                "Každý krok se počítá! 🚶",
                "Jsi na dobré cestě k cíli! 🎯",
                "Nezapomeň pít vodu! 💧",
                "Malý pokrok je pořád pokrok! 📈",
                "Tvé tělo ti poděkuje! 🙏",
                "Dnes je skvělý den pro trénink! ☀️"
            ]
        },
        quietHours: {
            enabled: true,
            start: "22:00",
            end: "07:00"
        },
        lastNotifications: {
            morning: null,
            evening: null,
            weighIn: null,
            motivation: null
        }
    },

    settings: null,
    checkInterval: null,

    // === INICIALIZACE ===
    init() {
        this.loadSettings();
        this.setupServiceWorker();
        
        if (this.settings.enabled) {
            this.startChecking();
        }

        // Kontrola při startu aplikace
        this.checkMissedNotifications();
        
        console.log('NotificationSystem initialized');
    },

    // Get storage key for current profile
    getStorageKey() {
        if (typeof ProfileManager !== 'undefined') {
            const activeId = ProfileManager.getActiveProfileId();
            if (activeId) {
                return `notificationSettings_${activeId}`;
            }
        }
        return 'notificationSettings';
    },

    loadSettings() {
        const key = this.getStorageKey();
        const saved = localStorage.getItem(key);
        if (saved) {
            this.settings = { ...this.defaultSettings, ...JSON.parse(saved) };
        } else {
            this.settings = { ...this.defaultSettings };
        }
    },

    saveSettings() {
        const key = this.getStorageKey();
        localStorage.setItem(key, JSON.stringify(this.settings));
    },

    // === PERMISSION HANDLING ===
    async requestPermission() {
        if (!("Notification" in window)) {
            console.log("Tento prohlížeč nepodporuje notifikace");
            return false;
        }

        if (Notification.permission === "granted") {
            return true;
        }

        if (Notification.permission !== "denied") {
            const permission = await Notification.requestPermission();
            return permission === "granted";
        }

        return false;
    },

    async enable() {
        const granted = await this.requestPermission();
        if (granted) {
            this.settings.enabled = true;
            this.saveSettings();
            this.startChecking();
            this.showNotification("Notifikace povoleny", "Budu ti připomínat tréninky! 🔔", "success");
            return true;
        }
        return false;
    },

    disable() {
        this.settings.enabled = false;
        this.saveSettings();
        this.stopChecking();
    },

    // === NOTIFICATION DISPLAY ===
    showNotification(title, body, type = "info", actions = []) {
        if (Notification.permission !== "granted") {
            console.log("Notifikace nejsou povoleny");
            return;
        }

        // Kontrola tichých hodin
        if (this.isQuietHours() && type !== "urgent") {
            console.log("Tiché hodiny - notifikace odložena");
            return;
        }

        const icons = {
            info: "/icons/icon-128.png",
            success: "/icons/icon-128.png",
            warning: "/icons/icon-128.png",
            workout: "/icons/icon-128.png"
        };

        const options = {
            body: body,
            icon: icons[type] || icons.info,
            badge: "/icons/icon-128.png",
            vibrate: [200, 100, 200],
            tag: `trenink-${type}-${Date.now()}`,
            requireInteraction: type === "workout",
            data: {
                type: type,
                timestamp: Date.now()
            }
        };

        // Přidání akcí pokud jsou podporovány
        if (actions.length > 0 && 'actions' in Notification.prototype) {
            options.actions = actions;
        }

        try {
            const notification = new Notification(title, options);

            notification.onclick = () => {
                window.focus();
                notification.close();
                
                // Přepnutí na relevantní tab podle typu
                if (type === "workout" || type === "info") {
                    if (typeof switchTab === 'function') {
                        switchTab('plan');
                    }
                }
            };

            return notification;
        } catch (error) {
            console.error("Chyba při zobrazení notifikace:", error);
        }
    },

    // === TIME CHECKING ===
    startChecking() {
        // Kontrola každou minutu
        this.checkInterval = setInterval(() => {
            this.checkScheduledNotifications();
        }, 60000); // 60 sekund

        // První kontrola ihned
        this.checkScheduledNotifications();
        
        console.log("Notification checking started");
    },

    stopChecking() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
        console.log("Notification checking stopped");
    },

    checkScheduledNotifications() {
        if (!this.settings.enabled) return;

        const now = new Date();
        const currentTime = this.formatTime(now);
        const currentDay = now.getDay();
        const today = now.toDateString();

        // Ranní notifikace
        if (this.settings.morning.enabled) {
            if (currentTime === this.settings.morning.time && 
                this.settings.lastNotifications.morning !== today) {
                this.showMorningNotification();
                this.settings.lastNotifications.morning = today;
                this.saveSettings();
            }
        }

        // Večerní notifikace
        if (this.settings.evening.enabled) {
            if (currentTime === this.settings.evening.time && 
                this.settings.lastNotifications.evening !== today) {
                this.showEveningNotification();
                this.settings.lastNotifications.evening = today;
                this.saveSettings();
            }
        }

        // Notifikace pro zvážení (jen v nastavený den)
        if (this.settings.weighIn.enabled) {
            if (currentDay === this.settings.weighIn.day && 
                currentTime === this.settings.weighIn.time &&
                this.settings.lastNotifications.weighIn !== today) {
                this.showWeighInNotification();
                this.settings.lastNotifications.weighIn = today;
                this.saveSettings();
            }
        }

        // Motivační notifikace
        if (this.settings.motivation.enabled) {
            this.checkMotivationNotification(now);
        }
    },

    checkMissedNotifications() {
        if (!this.settings.enabled) return;

        const now = new Date();
        const currentTime = this.timeToMinutes(this.formatTime(now));
        const today = now.toDateString();

        // Pokud jsme promeškali ranní notifikaci a ještě nebyla zobrazena
        if (this.settings.morning.enabled && 
            this.settings.lastNotifications.morning !== today) {
            const morningTime = this.timeToMinutes(this.settings.morning.time);
            if (currentTime > morningTime && currentTime < morningTime + 120) {
                // Zobrazit do 2 hodin od plánovaného času
                this.showMorningNotification();
                this.settings.lastNotifications.morning = today;
                this.saveSettings();
            }
        }
    },

    // === SPECIFIC NOTIFICATIONS ===
    showMorningNotification() {
        const todayExercises = this.getTodayExerciseCount();
        let body = this.settings.morning.message;
        
        if (todayExercises > 0) {
            body += `\nDnes máš naplánováno ${todayExercises} cvičení.`;
        }

        this.showNotification(
            "🌅 Dobré ráno!",
            body,
            "workout",
            [{ action: "open", title: "Zobrazit plán" }]
        );
    },

    showEveningNotification() {
        const progress = this.getTodayProgress();
        let body = this.settings.evening.message;
        
        if (progress.completed < progress.total) {
            body += `\nZbývá ti ${progress.total - progress.completed} z ${progress.total} cvičení.`;
        } else if (progress.total > 0) {
            body = "Skvělá práce! Dnes máš splněno! 🎉";
        }

        this.showNotification(
            "💪 Večerní trénink",
            body,
            "workout"
        );
    },

    showWeighInNotification() {
        this.showNotification(
            "⚖️ Čas na zvážení",
            this.settings.weighIn.message,
            "info"
        );
    },

    checkMotivationNotification(now) {
        const hours = now.getHours();
        const lastMotivation = this.settings.lastNotifications.motivation;
        
        // Pouze během aktivních hodin (8:00 - 20:00)
        if (hours < 8 || hours > 20) return;

        // Kontrola intervalu
        if (lastMotivation) {
            const lastTime = new Date(lastMotivation);
            const hoursDiff = (now - lastTime) / (1000 * 60 * 60);
            
            if (hoursDiff < this.settings.motivation.interval) {
                return;
            }
        }

        // Náhodná šance (30%) pro zobrazení
        if (Math.random() > 0.3) return;

        const messages = this.settings.motivation.messages;
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];

        this.showNotification(
            "💡 Motivace",
            randomMessage,
            "info"
        );

        this.settings.lastNotifications.motivation = now.toISOString();
        this.saveSettings();
    },

    // === QUICK NOTIFICATIONS ===
    notifyWorkoutComplete(exerciseName) {
        this.showNotification(
            "✅ Cvičení splněno!",
            `${exerciseName} - skvělá práce!`,
            "success"
        );
    },

    notifyDayComplete() {
        this.showNotification(
            "🎉 Den splněn!",
            "Všechna dnešní cvičení máš za sebou! Zasloužíš si odpočinek.",
            "success"
        );
    },

    notifyWeightLogged(weight) {
        this.showNotification(
            "📊 Váha zaznamenána",
            `${weight} kg - sleduj svůj progres v aplikaci!`,
            "info"
        );
    },

    notifyStreak(days) {
        this.showNotification(
            "🔥 Série pokračuje!",
            `Už ${days} dní v řadě cvičíš! Tak dál!`,
            "success"
        );
    },

    // === HELPER FUNCTIONS ===
    formatTime(date) {
        return date.toTimeString().slice(0, 5);
    },

    timeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    },

    isQuietHours() {
        if (!this.settings.quietHours.enabled) return false;

        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const startMinutes = this.timeToMinutes(this.settings.quietHours.start);
        const endMinutes = this.timeToMinutes(this.settings.quietHours.end);

        // Přes půlnoc
        if (startMinutes > endMinutes) {
            return currentMinutes >= startMinutes || currentMinutes < endMinutes;
        }
        
        return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    },

    getTodayExerciseCount() {
        try {
            if (typeof AppState !== 'undefined' && AppState.completionData) {
                const today = this.getTodayId();
                const weekData = AppState.completionData[AppState.currentWeek];
                if (weekData && weekData[today]) {
                    return weekData[today].total || 0;
                }
            }
        } catch (e) {
            console.error("Error getting exercise count:", e);
        }
        return 0;
    },

    getTodayProgress() {
        try {
            if (typeof AppState !== 'undefined' && AppState.completionData) {
                const today = this.getTodayId();
                const weekData = AppState.completionData[AppState.currentWeek];
                if (weekData && weekData[today]) {
                    return {
                        completed: weekData[today].completed || 0,
                        total: weekData[today].total || 0
                    };
                }
            }
        } catch (e) {
            console.error("Error getting progress:", e);
        }
        return { completed: 0, total: 0 };
    },

    getTodayId() {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        return days[new Date().getDay()];
    },

    // === SERVICE WORKER INTEGRATION ===
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                // Registrace pro periodickou synchronizaci (pokud podporováno)
                if ('periodicSync' in registration) {
                    registration.periodicSync.register('check-notifications', {
                        minInterval: 60 * 60 * 1000 // 1 hodina
                    }).catch(err => {
                        console.log('Periodic sync not available:', err);
                    });
                }
            });

            // Poslouchání zpráv ze service workeru
            navigator.serviceWorker.addEventListener('message', event => {
                if (event.data.type === 'SHOW_NOTIFICATION') {
                    this.showNotification(
                        event.data.title,
                        event.data.body,
                        event.data.notificationType
                    );
                }
            });
        }
    },

    // === TEST FUNCTION ===
    sendTestNotification() {
        this.showNotification(
            "🔔 Test notifikace",
            "Notifikace fungují správně!",
            "info"
        );
    },

    // === SCHEDULE CUSTOM REMINDER ===
    scheduleReminder(title, message, delayMinutes) {
        setTimeout(() => {
            this.showNotification(title, message, "info");
        }, delayMinutes * 60 * 1000);
        
        return true;
    }
};

// === RENDER NOTIFICATION SETTINGS UI ===
function renderNotificationSettings() {
    const settings = NotificationSystem.settings;
    const permissionStatus = Notification.permission;
    
    const daysOfWeek = [
        { value: 0, label: "Neděle" },
        { value: 1, label: "Pondělí" },
        { value: 2, label: "Úterý" },
        { value: 3, label: "Středa" },
        { value: 4, label: "Čtvrtek" },
        { value: 5, label: "Pátek" },
        { value: 6, label: "Sobota" }
    ];

    return `
        <div class="notification-settings">
            <!-- Hlavní přepínač -->
            <div class="settings-item" style="background: ${settings.enabled ? 'var(--md-sys-color-primary-container)' : 'var(--md-sys-color-surface-variant)'}; padding: 16px; border-radius: 12px; margin-bottom: 16px;">
                <div>
                    <div style="font-weight: 500; display: flex; align-items: center; gap: 8px;">
                        <span class="material-symbols-outlined">${settings.enabled ? 'notifications_active' : 'notifications_off'}</span>
                        Notifikace ${settings.enabled ? 'zapnuty' : 'vypnuty'}
                    </div>
                    <div style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant); margin-top: 4px;">
                        ${permissionStatus === 'granted' ? '✅ Oprávnění uděleno' : 
                          permissionStatus === 'denied' ? '❌ Oprávnění zamítnuto' : 
                          '⚠️ Oprávnění neuděleno'}
                    </div>
                </div>
                <label class="switch">
                    <input type="checkbox" ${settings.enabled ? 'checked' : ''} 
                           onchange="toggleNotificationSystem(this.checked)">
                    <span class="slider"></span>
                </label>
            </div>

            ${settings.enabled ? `
                <!-- Ranní připomínka -->
                <div class="notification-card">
                    <div class="notification-card-header">
                        <span class="material-symbols-outlined" style="color: #ffc107;">wb_sunny</span>
                        <span>Ranní připomínka</span>
                        <label class="switch" style="margin-left: auto;">
                            <input type="checkbox" ${settings.morning.enabled ? 'checked' : ''} 
                                   onchange="updateNotificationSetting('morning', 'enabled', this.checked)">
                            <span class="slider"></span>
                        </label>
                    </div>
                    ${settings.morning.enabled ? `
                        <div class="notification-card-content">
                            <div class="form-group">
                                <label class="form-label">Čas</label>
                                <input type="time" class="text-field" value="${settings.morning.time}"
                                       onchange="updateNotificationSetting('morning', 'time', this.value)">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Zpráva</label>
                                <input type="text" class="text-field" value="${settings.morning.message}"
                                       onchange="updateNotificationSetting('morning', 'message', this.value)"
                                       placeholder="Vlastní zpráva...">
                            </div>
                        </div>
                    ` : ''}
                </div>

                <!-- Večerní připomínka -->
                <div class="notification-card">
                    <div class="notification-card-header">
                        <span class="material-symbols-outlined" style="color: #7c4dff;">nights_stay</span>
                        <span>Večerní připomínka</span>
                        <label class="switch" style="margin-left: auto;">
                            <input type="checkbox" ${settings.evening.enabled ? 'checked' : ''} 
                                   onchange="updateNotificationSetting('evening', 'enabled', this.checked)">
                            <span class="slider"></span>
                        </label>
                    </div>
                    ${settings.evening.enabled ? `
                        <div class="notification-card-content">
                            <div class="form-group">
                                <label class="form-label">Čas</label>
                                <input type="time" class="text-field" value="${settings.evening.time}"
                                       onchange="updateNotificationSetting('evening', 'time', this.value)">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Zpráva</label>
                                <input type="text" class="text-field" value="${settings.evening.message}"
                                       onchange="updateNotificationSetting('evening', 'message', this.value)"
                                       placeholder="Vlastní zpráva...">
                            </div>
                        </div>
                    ` : ''}
                </div>

                <!-- Připomínka zvážení -->
                <div class="notification-card">
                    <div class="notification-card-header">
                        <span class="material-symbols-outlined" style="color: #00bcd4;">monitor_weight</span>
                        <span>Připomínka zvážení</span>
                        <label class="switch" style="margin-left: auto;">
                            <input type="checkbox" ${settings.weighIn.enabled ? 'checked' : ''} 
                                   onchange="updateNotificationSetting('weighIn', 'enabled', this.checked)">
                            <span class="slider"></span>
                        </label>
                    </div>
                    ${settings.weighIn.enabled ? `
                        <div class="notification-card-content">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                <div class="form-group">
                                    <label class="form-label">Den</label>
                                    <select class="text-field" onchange="updateNotificationSetting('weighIn', 'day', parseInt(this.value))">
                                        ${daysOfWeek.map(d => `
                                            <option value="${d.value}" ${settings.weighIn.day === d.value ? 'selected' : ''}>
                                                ${d.label}
                                            </option>
                                        `).join('')}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Čas</label>
                                    <input type="time" class="text-field" value="${settings.weighIn.time}"
                                           onchange="updateNotificationSetting('weighIn', 'time', this.value)">
                                </div>
                            </div>
                        </div>
                    ` : ''}
                </div>

                <!-- Motivační zprávy -->
                <div class="notification-card">
                    <div class="notification-card-header">
                        <span class="material-symbols-outlined" style="color: #4caf50;">emoji_objects</span>
                        <span>Motivační zprávy</span>
                        <label class="switch" style="margin-left: auto;">
                            <input type="checkbox" ${settings.motivation.enabled ? 'checked' : ''} 
                                   onchange="updateNotificationSetting('motivation', 'enabled', this.checked)">
                            <span class="slider"></span>
                        </label>
                    </div>
                    ${settings.motivation.enabled ? `
                        <div class="notification-card-content">
                            <div class="form-group">
                                <label class="form-label">Interval (hodiny)</label>
                                <select class="text-field" onchange="updateNotificationSetting('motivation', 'interval', parseInt(this.value))">
                                    <option value="2" ${settings.motivation.interval === 2 ? 'selected' : ''}>Každé 2 hodiny</option>
                                    <option value="3" ${settings.motivation.interval === 3 ? 'selected' : ''}>Každé 3 hodiny</option>
                                    <option value="4" ${settings.motivation.interval === 4 ? 'selected' : ''}>Každé 4 hodiny</option>
                                    <option value="6" ${settings.motivation.interval === 6 ? 'selected' : ''}>Každých 6 hodin</option>
                                </select>
                            </div>
                            <p style="font-size: 0.75rem; color: var(--md-sys-color-on-surface-variant);">
                                Náhodné motivační zprávy během dne (8:00 - 20:00)
                            </p>
                        </div>
                    ` : ''}
                </div>

                <!-- Tiché hodiny -->
                <div class="notification-card">
                    <div class="notification-card-header">
                        <span class="material-symbols-outlined" style="color: #9e9e9e;">do_not_disturb_on</span>
                        <span>Tiché hodiny</span>
                        <label class="switch" style="margin-left: auto;">
                            <input type="checkbox" ${settings.quietHours.enabled ? 'checked' : ''} 
                                   onchange="updateNotificationSetting('quietHours', 'enabled', this.checked)">
                            <span class="slider"></span>
                        </label>
                    </div>
                    ${settings.quietHours.enabled ? `
                        <div class="notification-card-content">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                <div class="form-group">
                                    <label class="form-label">Od</label>
                                    <input type="time" class="text-field" value="${settings.quietHours.start}"
                                           onchange="updateNotificationSetting('quietHours', 'start', this.value)">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Do</label>
                                    <input type="time" class="text-field" value="${settings.quietHours.end}"
                                           onchange="updateNotificationSetting('quietHours', 'end', this.value)">
                                </div>
                            </div>
                        </div>
                    ` : ''}
                </div>

                <!-- Test tlačítko -->
                <button class="button filled-button full" onclick="NotificationSystem.sendTestNotification()" style="margin-top: 16px;">
                    <span class="material-symbols-outlined">notifications</span>
                    Odeslat testovací notifikaci
                </button>
            ` : `
                <div style="text-align: center; padding: 24px; color: var(--md-sys-color-on-surface-variant);">
                    <span class="material-symbols-outlined" style="font-size: 48px; opacity: 0.5;">notifications_off</span>
                    <p style="margin-top: 12px;">Zapni notifikace pro připomínky tréninků</p>
                </div>
            `}
        </div>
    `;
}

// === GLOBAL FUNCTIONS FOR UI ===
async function toggleNotificationSystem(enabled) {
    if (enabled) {
        const success = await NotificationSystem.enable();
        if (!success) {
            showNotification('Notifikace nelze povolit. Zkontroluj nastavení prohlížeče.');
        }
    } else {
        NotificationSystem.disable();
    }
    
    // Překreslit settings
    if (AppState.currentTab === 'settings') {
        renderSettings();
    }
}

function updateNotificationSetting(category, key, value) {
    NotificationSystem.settings[category][key] = value;
    NotificationSystem.saveSettings();
    
    // Feedback
    showNotification('Nastavení uloženo');
}

// Inicializace při načtení
document.addEventListener('DOMContentLoaded', () => {
    NotificationSystem.init();
});
