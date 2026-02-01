"use strict";

// === CLOUD SYNC MODULE ===
const CloudSync = {
    // API endpoint (will be same domain on Cloudflare Pages)
    apiUrl: '/api/sync',

    // Get user ID from active profile
    getUserId() {
        // First try to get from active profile
        if (typeof ProfileManager !== 'undefined') {
            const activeProfile = ProfileManager.getActiveProfile();
            if (activeProfile && activeProfile.syncId) {
                return activeProfile.syncId;
            }
        }
        // Fallback to legacy storage
        let userId = localStorage.getItem('fitnessUserId');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('fitnessUserId', userId);
        }
        return userId;
    },

    // Get last sync time
    getLastSync() {
        return localStorage.getItem('fitnessLastSync');
    },

    // Set last sync time
    setLastSync(time) {
        localStorage.setItem('fitnessLastSync', time);
    },

    // Check if online
    isOnline() {
        return navigator.onLine;
    },

    // Sync data to cloud
    async pushToCloud() {
        if (!this.isOnline()) {
            return { success: false, error: 'Offline' };
        }

        try {
            const userId = this.getUserId();
            const data = {
                ...AppState,
                _deviceInfo: navigator.userAgent.substring(0, 50)
            };

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, data })
            });

            const result = await response.json();

            if (result.success) {
                this.setLastSync(result.lastSync);
                return { success: true, lastSync: result.lastSync };
            } else {
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('Sync push error:', error);
            return { success: false, error: error.message };
        }
    },

    // Pull data from cloud
    async pullFromCloud() {
        if (!this.isOnline()) {
            return { success: false, error: 'Offline' };
        }

        try {
            const userId = this.getUserId();
            const response = await fetch(`${this.apiUrl}?userId=${userId}`);
            const result = await response.json();

            if (result.data) {
                return { success: true, data: result.data, lastSync: result.lastSync };
            } else {
                return { success: true, data: null, message: 'No cloud data' };
            }
        } catch (error) {
            console.error('Sync pull error:', error);
            return { success: false, error: error.message };
        }
    },

    // Merge cloud data with local (cloud wins for conflicts)
    mergeData(cloudData) {
        if (!cloudData || typeof cloudData !== 'object') return false;

        // Remove internal sync fields
        delete cloudData._lastSync;
        delete cloudData._deviceInfo;

        // Validate critical data types before merge
        const validatedData = {};

        // Validate currentWeek (1-12)
        if (typeof cloudData.currentWeek === 'number' && cloudData.currentWeek >= 1 && cloudData.currentWeek <= 12) {
            validatedData.currentWeek = cloudData.currentWeek;
        }

        // Validate userData object
        if (cloudData.userData && typeof cloudData.userData === 'object') {
            validatedData.userData = {
                weight: typeof cloudData.userData.weight === 'number' ? cloudData.userData.weight : AppState.userData.weight,
                height: typeof cloudData.userData.height === 'number' ? cloudData.userData.height : AppState.userData.height,
                age: typeof cloudData.userData.age === 'number' ? cloudData.userData.age : AppState.userData.age,
                targetWeight: typeof cloudData.userData.targetWeight === 'number' ? cloudData.userData.targetWeight : AppState.userData.targetWeight
            };
        }

        // Validate completionData object
        if (cloudData.completionData && typeof cloudData.completionData === 'object') {
            validatedData.completionData = cloudData.completionData;
        }

        // Validate weightLogs array
        if (Array.isArray(cloudData.weightLogs)) {
            validatedData.weightLogs = cloudData.weightLogs.filter(log =>
                log && typeof log.date === 'string' && typeof log.weight === 'number'
            );
        }

        // Validate testResults array
        if (Array.isArray(cloudData.testResults)) {
            validatedData.testResults = cloudData.testResults;
        }

        // Validate settings object
        if (cloudData.settings && typeof cloudData.settings === 'object') {
            validatedData.settings = { ...AppState.settings, ...cloudData.settings };
        }

        // Validate currentTab
        if (typeof cloudData.currentTab === 'string') {
            validatedData.currentTab = cloudData.currentTab;
        }

        // Merge validated data
        Object.assign(AppState, validatedData);
        saveData();

        return true;
    },

    // Full sync (pull then push)
    async fullSync() {
        const pullResult = await this.pullFromCloud();

        if (pullResult.success && pullResult.data) {
            const localLastSync = this.getLastSync();
            const cloudLastSync = pullResult.lastSync;

            // If cloud is newer, merge
            if (!localLastSync || new Date(cloudLastSync) > new Date(localLastSync)) {
                this.mergeData(pullResult.data);
            }
        }

        // Push current state
        return await this.pushToCloud();
    },

    // Get sync status for UI
    getSyncStatus() {
        const lastSync = this.getLastSync();
        const isOnline = this.isOnline();

        return {
            isOnline,
            lastSync,
            lastSyncFormatted: lastSync ? new Date(lastSync).toLocaleString('cs-CZ') : 'Nikdy',
            userId: this.getUserId()
        };
    },

    // Copy user ID to clipboard
    async copyUserId() {
        const userId = this.getUserId();
        try {
            await navigator.clipboard.writeText(userId);
            return true;
        } catch {
            return false;
        }
    },

    // Set user ID (for restore) - updates active profile's syncId
    setUserId(newId) {
        if (newId && newId.startsWith('user_')) {
            // Update in active profile if ProfileManager exists
            if (typeof ProfileManager !== 'undefined') {
                const profiles = ProfileManager.getProfiles();
                const activeId = ProfileManager.getActiveProfileId();
                const profile = profiles.find(p => p.id === activeId);
                if (profile) {
                    profile.syncId = newId;
                    ProfileManager.saveProfiles(profiles);
                }
            }
            // Also save to legacy storage for compatibility
            localStorage.setItem('fitnessUserId', newId);
            return true;
        }
        return false;
    }
};

// Auto-sync on visibility change (when user returns to app)
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && CloudSync.isOnline()) {
        // Debounce - sync after 2 seconds
        setTimeout(() => {
            if (AppState.settings.cloudSync) {
                CloudSync.pushToCloud();
            }
        }, 2000);
    }
});

// Listen for online/offline events
window.addEventListener('online', () => {
    if (AppState.settings.cloudSync) {
        showNotification('Online - synchronizuji...');
        CloudSync.fullSync().then(result => {
            if (result.success) {
                showNotification('Data synchronizována');
            }
        });
    }
});

window.addEventListener('offline', () => {
    showNotification('Offline režim');
});
