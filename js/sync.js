"use strict";

// === CLOUD SYNC MODULE ===
const CloudSync = {
    // API endpoint (will be same domain on Cloudflare Pages)
    apiUrl: '/api/sync',

    // Get or create user ID
    getUserId() {
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
        if (!cloudData) return false;

        // Remove internal sync fields
        delete cloudData._lastSync;
        delete cloudData._deviceInfo;

        // Merge - cloud data takes precedence
        Object.assign(AppState, cloudData);
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

    // Set user ID (for restore)
    setUserId(newId) {
        if (newId && newId.startsWith('user_')) {
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
