/* ============================================
   js/database.js
   ============================================ */
const DB_NAME = 'GeoPocketDB';
const DB_VERSION = 1;

const DB_STORES = {
    MINERALS: 'minerals',
    ROCKS: 'rocks',
    TERMS: 'terms',
    DIARY: 'diary',
    IMAGES: 'images'
};

let db = null;

function openDatabase() {
    return new Promise((resolve, reject) => {
        if (db && db.name === DB_NAME) {
            resolve(db);
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const database = event.target.result;
            if (!database.objectStoreNames.contains(DB_STORES.MINERALS)) {
                database.createObjectStore(DB_STORES.MINERALS, { keyPath: 'id' });
            }
            if (!database.objectStoreNames.contains(DB_STORES.ROCKS)) {
                database.createObjectStore(DB_STORES.ROCKS, { keyPath: 'id' });
            }
            if (!database.objectStoreNames.contains(DB_STORES.TERMS)) {
                database.createObjectStore(DB_STORES.TERMS, { keyPath: 'id' });
            }
            if (!database.objectStoreNames.contains(DB_STORES.DIARY)) {
                const diaryStore = database.createObjectStore(DB_STORES.DIARY, { keyPath: 'id' });
                diaryStore.createIndex('date', 'date', { unique: false });
            }
            if (!database.objectStoreNames.contains(DB_STORES.IMAGES)) {
                database.createObjectStore(DB_STORES.IMAGES, { keyPath: 'id' });
            }
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

function dbAdd(storeName, data) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not open'));
            return;
        }
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.add(data);
        request.onsuccess = () => resolve(data);
        request.onerror = () => reject(request.error);
    });
}

function dbPut(storeName, data) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not open'));
            return;
        }
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(data);
        request.onsuccess = () => resolve(data);
        request.onerror = () => reject(request.error);
    });
}

function dbGet(storeName, id) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not open'));
            return;
        }
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
    });
}

function dbGetAll(storeName) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not open'));
            return;
        }
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

function dbDelete(storeName, id) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not open'));
            return;
        }
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(id);
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
    });
}

function dbClear(storeName) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not open'));
            return;
        }
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
    });
}

function dbGetByIndex(storeName, indexName, value) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not open'));
            return;
        }
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const index = store.index(indexName);
        const request = index.getAll(value);
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

async function seedDatabase() {
    try {
        await openDatabase();

        // Seed minerals
        const existingMinerals = await dbGetAll(DB_STORES.MINERALS);
        if (existingMinerals.length === 0) {
            for (const mineral of MINERALS) {
                await dbPut(DB_STORES.MINERALS, mineral);
            }
        }

        // Seed rocks
        const existingRocks = await dbGetAll(DB_STORES.ROCKS);
        if (existingRocks.length === 0) {
            for (const rock of ROCKS) {
                await dbPut(DB_STORES.ROCKS, rock);
            }
        }

        // Seed terms
        const existingTerms = await dbGetAll(DB_STORES.TERMS);
        if (existingTerms.length === 0) {
            for (const term of TERMS) {
                await dbPut(DB_STORES.TERMS, term);
            }
        }

        return true;
    } catch (e) {
        return false;
    }
}

async function syncMineralsToDB() {
    try {
        await openDatabase();
        for (const mineral of MINERALS) {
            await dbPut(DB_STORES.MINERALS, mineral);
        }
        return true;
    } catch (e) {
        return false;
    }
}

async function loadMineralsFromDB() {
    try {
        await openDatabase();
        const data = await dbGetAll(DB_STORES.MINERALS);
        if (data.length > 0) {
            MINERALS = data;
        }
        return MINERALS;
    } catch (e) {
        return MINERALS;
    }
}