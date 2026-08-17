/* ============================================
   js/diagnostic.js
   ============================================ */
const Diagnostic = {
    runAll() {
        const results = {
            timestamp: Date.now(),
            checks: []
        };

        results.checks.push(this.checkLocalStorage());
        results.checks.push(this.checkIndexedDB());
        results.checks.push(this.checkGeolocation());
        results.checks.push(this.checkServiceWorker());
        results.checks.push(this.checkManifest());
        results.checks.push(this.checkNetwork());
        results.checks.push(this.checkMemory());

        results.passed = results.checks.every(c => c.passed);
        return results;
    },

    checkLocalStorage() {
        try {
            const testKey = '_diagnostic_test_';
            localStorage.setItem(testKey, 'ok');
            const result = localStorage.getItem(testKey);
            localStorage.removeItem(testKey);
            return {
                name: 'LocalStorage',
                passed: result === 'ok',
                details: `Размер: ${(Storage.getSize() / 1024).toFixed(1)} KB`
            };
        } catch (e) {
            return {
                name: 'LocalStorage',
                passed: false,
                details: e.message
            };
        }
    },

    checkIndexedDB() {
        return new Promise((resolve) => {
            try {
                const request = indexedDB.open('_diagnostic_db_', 1);
                request.onsuccess = (event) => {
                    const db = event.target.result;
                    db.close();
                    indexedDB.deleteDatabase('_diagnostic_db_');
                    resolve({
                        name: 'IndexedDB',
                        passed: true,
                        details: 'Доступна'
                    });
                };
                request.onerror = () => {
                    resolve({
                        name: 'IndexedDB',
                        passed: false,
                        details: 'Недоступна'
                    });
                };
            } catch (e) {
                resolve({
                    name: 'IndexedDB',
                    passed: false,
                    details: e.message
                });
            }
        });
    },

    checkGeolocation() {
        if (!navigator.geolocation) {
            return {
                name: 'Geolocation',
                passed: false,
                details: 'Не поддерживается'
            };
        }
        return {
            name: 'Geolocation',
            passed: true,
            details: 'Поддерживается'
        };
    },

    checkServiceWorker() {
        if ('serviceWorker' in navigator) {
            return {
                name: 'Service Worker',
                passed: true,
                details: 'Поддерживается'
            };
        }
        return {
            name: 'Service Worker',
            passed: false,
            details: 'Не поддерживается'
        };
    },

    checkManifest() {
        const manifestLink = document.querySelector('link[rel="manifest"]');
        if (manifestLink) {
            return {
                name: 'Manifest',
                passed: true,
                details: manifestLink.getAttribute('href') || 'Найден'
            };
        }
        return {
            name: 'Manifest',
            passed: false,
            details: 'Не найден'
        };
    },

    checkNetwork() {
        if (navigator.onLine) {
            return {
                name: 'Network',
                passed: true,
                details: 'Online'
            };
        }
        return {
            name: 'Network',
            passed: true,
            details: 'Offline (работает офлайн)'
        };
    },

    checkMemory() {
        if (performance && performance.memory) {
            const mem = performance.memory;
            const usedMB = (mem.usedJSHeapSize / (1024 * 1024)).toFixed(1);
            const totalMB = (mem.jsHeapSizeLimit / (1024 * 1024)).toFixed(0);
            return {
                name: 'Memory',
                passed: true,
                details: `${usedMB} MB / ${totalMB} MB`
            };
        }
        return {
            name: 'Memory',
            passed: true,
            details: 'Недоступно'
        };
    },

    async runAsync() {
        const results = {
            timestamp: Date.now(),
            checks: []
        };

        results.checks.push(this.checkLocalStorage());
        results.checks.push(await this.checkIndexedDB());
        results.checks.push(this.checkGeolocation());
        results.checks.push(this.checkServiceWorker());
        results.checks.push(this.checkManifest());
        results.checks.push(this.checkNetwork());
        results.checks.push(this.checkMemory());

        results.passed = results.checks.every(c => c.passed);
        return results;
    }
};