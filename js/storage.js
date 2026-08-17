/* ============================================
   js/storage.js
   ============================================ */
const Storage = {
    get(key, defaultValue) {
        try {
            const data = localStorage.getItem(key);
            if (data === null) return defaultValue;
            return JSON.parse(data);
        } catch (e) {
            return defaultValue;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            return false;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            return false;
        }
    },

    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            return false;
        }
    },

    has(key) {
        return localStorage.getItem(key) !== null;
    },

    keys() {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            keys.push(localStorage.key(i));
        }
        return keys;
    },

    getSize() {
        let total = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const val = localStorage.getItem(key);
            total += key.length + val.length;
        }
        return total;
    },

    isAvailable() {
        try {
            localStorage.setItem('_test_', '1');
            localStorage.removeItem('_test_');
            return true;
        } catch (e) {
            return false;
        }
    }
};

const APP_STORAGE_KEYS = {
    SETTINGS: 'geopocket_settings',
    DIARY: 'geopocket_diary',
    PROFILE: 'geopocket_profile',
    FAVORITES: 'geopocket_favorites',
    ACHIEVEMENTS: 'geopocket_achievements',
    STATS: 'geopocket_stats',
    SESSION: 'geopocket_session'
};

function getSettings() {
    return Storage.get(APP_STORAGE_KEYS.SETTINGS, {
        theme: 'light',
        language: 'ru',
        notifications: true,
        gpsEnabled: true,
        offlineMode: true,
        fontSize: 'medium'
    });
}

function saveSettings(settings) {
    return Storage.set(APP_STORAGE_KEYS.SETTINGS, settings);
}

function getDiaryEntries() {
    return Storage.get(APP_STORAGE_KEYS.DIARY, []);
}

function saveDiaryEntries(entries) {
    return Storage.set(APP_STORAGE_KEYS.DIARY, entries);
}

function addDiaryEntry(entry) {
    const entries = getDiaryEntries();
    entries.unshift(entry);
    saveDiaryEntries(entries);
    return entry;
}

function updateDiaryEntry(id, updates) {
    const entries = getDiaryEntries();
    const index = entries.findIndex(e => e.id === id);
    if (index === -1) return null;
    entries[index] = { ...entries[index], ...updates };
    saveDiaryEntries(entries);
    return entries[index];
}

function deleteDiaryEntry(id) {
    const entries = getDiaryEntries();
    const filtered = entries.filter(e => e.id !== id);
    saveDiaryEntries(filtered);
    return filtered;
}

function getDiaryEntry(id) {
    const entries = getDiaryEntries();
    return entries.find(e => e.id === id) || null;
}

function getProfile() {
    return Storage.get(APP_STORAGE_KEYS.PROFILE, {
        name: 'Юный геолог',
        avatar: '🧑‍🔬',
        level: 1,
        experience: 0,
        joined: Date.now()
    });
}

function saveProfile(profile) {
    return Storage.set(APP_STORAGE_KEYS.PROFILE, profile);
}

function getFavorites() {
    return Storage.get(APP_STORAGE_KEYS.FAVORITES, []);
}

function saveFavorites(favorites) {
    return Storage.set(APP_STORAGE_KEYS.FAVORITES, favorites);
}

function toggleFavorite(mineralId) {
    const favorites = getFavorites();
    const index = favorites.indexOf(mineralId);
    if (index === -1) {
        favorites.push(mineralId);
    } else {
        favorites.splice(index, 1);
    }
    saveFavorites(favorites);
    return favorites;
}

function isFavorite(mineralId) {
    const favorites = getFavorites();
    return favorites.includes(mineralId);
}

function getAchievements() {
    return Storage.get(APP_STORAGE_KEYS.ACHIEVEMENTS, []);
}

function saveAchievements(achievements) {
    return Storage.set(APP_STORAGE_KEYS.ACHIEVEMENTS, achievements);
}

function unlockAchievement(id) {
    const achievements = getAchievements();
    if (achievements.includes(id)) return achievements;
    achievements.push(id);
    saveAchievements(achievements);
    return achievements;
}

function isAchievementUnlocked(id) {
    const achievements = getAchievements();
    return achievements.includes(id);
}

function getStats() {
    return Storage.get(APP_STORAGE_KEYS.STATS, {
        totalEntries: 0,
        totalMineralsFound: 0,
        totalExpeditions: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastActive: null,
        uniqueMinerals: []
    });
}

function saveStats(stats) {
    return Storage.set(APP_STORAGE_KEYS.STATS, stats);
}

function updateStats(updates) {
    const stats = getStats();
    const newStats = { ...stats, ...updates };
    saveStats(newStats);
    return newStats;
}