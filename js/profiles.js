"use strict";

// === PROFILE MANAGEMENT MODULE ===
const ProfileManager = {
    STORAGE_KEY: 'fitnessProfiles',
    ACTIVE_KEY: 'fitnessActiveProfile',

    // Get all profiles
    getProfiles() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    // Save profiles
    saveProfiles(profiles) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profiles));
    },

    // Get active profile ID
    getActiveProfileId() {
        return localStorage.getItem(this.ACTIVE_KEY);
    },

    // Set active profile
    setActiveProfile(profileId) {
        localStorage.setItem(this.ACTIVE_KEY, profileId);
    },

    // Get active profile object
    getActiveProfile() {
        const profiles = this.getProfiles();
        const activeId = this.getActiveProfileId();
        return profiles.find(p => p.id === activeId) || null;
    },

    // Create new profile
    createProfile(name, icon = '👤') {
        const profiles = this.getProfiles();

        const newProfile = {
            id: 'profile_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            name: name.trim(),
            icon: icon,
            syncId: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString()
        };

        profiles.push(newProfile);
        this.saveProfiles(profiles);

        // If this is the first profile, set it as active
        if (profiles.length === 1) {
            this.setActiveProfile(newProfile.id);
        }

        return newProfile;
    },

    // Delete profile
    deleteProfile(profileId) {
        let profiles = this.getProfiles();
        profiles = profiles.filter(p => p.id !== profileId);
        this.saveProfiles(profiles);

        // Delete profile data
        localStorage.removeItem(`fitnessAppData_${profileId}`);
        localStorage.removeItem(`customExercises_${profileId}`);
        localStorage.removeItem(`notificationSettings_${profileId}`);

        // If deleted active profile, switch to first available
        if (this.getActiveProfileId() === profileId) {
            if (profiles.length > 0) {
                this.setActiveProfile(profiles[0].id);
                this.loadProfileData(profiles[0].id);
            } else {
                localStorage.removeItem(this.ACTIVE_KEY);
            }
        }

        return profiles;
    },

    // Rename profile
    renameProfile(profileId, newName, newIcon) {
        const profiles = this.getProfiles();
        const profile = profiles.find(p => p.id === profileId);
        if (profile) {
            profile.name = newName.trim();
            if (newIcon) profile.icon = newIcon;
            this.saveProfiles(profiles);
        }
        return profile;
    },

    // Switch to profile
    switchProfile(profileId) {
        const profiles = this.getProfiles();
        const profile = profiles.find(p => p.id === profileId);

        if (!profile) return false;

        // Save current profile data first
        this.saveCurrentProfileData();

        // Switch active profile
        this.setActiveProfile(profileId);

        // Load new profile data
        this.loadProfileData(profileId);

        // Update sync ID
        if (typeof CloudSync !== 'undefined') {
            localStorage.setItem('fitnessUserId', profile.syncId);
        }

        return true;
    },

    // Save current profile data
    saveCurrentProfileData() {
        const activeId = this.getActiveProfileId();
        if (activeId && typeof AppState !== 'undefined') {
            localStorage.setItem(`fitnessAppData_${activeId}`, JSON.stringify(AppState));

            // Save custom exercises if exists
            const customExercises = localStorage.getItem('customExercises');
            if (customExercises) {
                localStorage.setItem(`customExercises_${activeId}`, customExercises);
            }
        }
    },

    // Load profile data
    loadProfileData(profileId) {
        const data = localStorage.getItem(`fitnessAppData_${profileId}`);

        if (data && typeof AppState !== 'undefined') {
            const parsed = JSON.parse(data);
            Object.keys(AppState).forEach(key => {
                if (parsed[key] !== undefined) {
                    AppState[key] = parsed[key];
                }
            });
        } else {
            // Reset to defaults for new profile
            this.resetAppStateToDefaults();
        }

        // Load custom exercises
        const customExercises = localStorage.getItem(`customExercises_${profileId}`);
        if (customExercises) {
            localStorage.setItem('customExercises', customExercises);
        } else {
            localStorage.removeItem('customExercises');
        }

        // Update sync ID
        const profile = this.getProfiles().find(p => p.id === profileId);
        if (profile) {
            localStorage.setItem('fitnessUserId', profile.syncId);
        }
    },

    // Reset AppState to defaults
    resetAppStateToDefaults() {
        if (typeof AppState === 'undefined') return;

        AppState.currentWeek = 1;
        AppState.currentTab = 'dashboard';
        AppState.userData = {
            weight: 80,
            height: 175,
            age: 30,
            targetWeight: 70
        };
        AppState.completionData = {};
        AppState.weightLogs = [];
        AppState.testResults = [];
        AppState.settings = {
            notifications: false,
            darkMode: false,
            autoSave: true,
            showTips: true,
            winterMode: false,
            cloudSync: false
        };
    },

    // Migrate from old single-user format
    migrateFromLegacy() {
        // Check if already migrated
        if (this.getProfiles().length > 0) return false;

        // Check for legacy data
        const legacyData = localStorage.getItem('fitnessAppData');
        const legacyUserId = localStorage.getItem('fitnessUserId');

        if (legacyData) {
            // Create default profile from legacy data
            const profile = this.createProfile('Hlavní profil', '💪');

            // Copy legacy sync ID if exists
            if (legacyUserId) {
                const profiles = this.getProfiles();
                const p = profiles.find(pr => pr.id === profile.id);
                if (p) {
                    p.syncId = legacyUserId;
                    this.saveProfiles(profiles);
                }
            }

            // Save legacy data to profile
            localStorage.setItem(`fitnessAppData_${profile.id}`, legacyData);

            // Copy custom exercises
            const customExercises = localStorage.getItem('customExercises');
            if (customExercises) {
                localStorage.setItem(`customExercises_${profile.id}`, customExercises);
            }

            this.setActiveProfile(profile.id);
            return true;
        }

        return false;
    },

    // Initialize profile system
    init() {
        // Try to migrate legacy data
        this.migrateFromLegacy();

        // If no profiles exist, create default one
        if (this.getProfiles().length === 0) {
            this.createProfile('Můj profil', '💪');
        }

        // Ensure active profile is set
        if (!this.getActiveProfileId()) {
            const profiles = this.getProfiles();
            if (profiles.length > 0) {
                this.setActiveProfile(profiles[0].id);
            }
        }

        // Load active profile data
        const activeId = this.getActiveProfileId();
        if (activeId) {
            this.loadProfileData(activeId);
        }
    },

    // Get profile icons
    getIcons() {
        return ['💪', '🏃', '🏋️', '⭐', '🔥', '💚', '💙', '💜', '🧡', '❤️', '👤', '👩', '👨', '🦸', '🏆'];
    }
};

// Auto-save current profile data periodically
setInterval(() => {
    if (typeof AppState !== 'undefined' && AppState.settings.autoSave) {
        ProfileManager.saveCurrentProfileData();
    }
}, 30000); // Every 30 seconds

// Save on page unload
window.addEventListener('beforeunload', () => {
    ProfileManager.saveCurrentProfileData();
});
