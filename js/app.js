const Toast = {
    show(message, type = 'info') {
        const container = document.querySelector('.toast-container');
        if (!container) {
            const newContainer = document.createElement('div');
            newContainer.className = 'toast-container';
            document.body.appendChild(newContainer);
            return this.show(message, type);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast-out');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

const App = {
    async init() {
        const splash = document.getElementById('splash-screen');
        const mainContent = document.getElementById('main-content');

        SettingsManager.init();

        try {
            await seedDatabase();
            await loadMineralsFromDB();
        } catch (e) {
            // fallback
        }

        // Загружаем переопределённые минералы из localStorage
        const savedMinerals = Storage.get('geopocket_minerals_override', null);
        if (savedMinerals && Array.isArray(savedMinerals) && savedMinerals.length > 0) {
            MINERALS = savedMinerals;
        }

        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const screen = item.dataset.screen;
                Router.navigate(screen);
            });
        });

        setTimeout(() => {
            splash.classList.add('hide');
            mainContent.style.display = 'flex';
            Router.navigate('home');
            this.registerSW();
        }, 1800);
    },

    registerSW() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .catch(() => {});
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

window.addEventListener('online', () => {
    Toast.show('🌐 Интернет восстановлен', 'info');
});

window.addEventListener('offline', () => {
    Toast.show('📡 Офлайн-режим активен', 'warning');
});

window.addEventListener('popstate', () => {
    const current = Router.getCurrentScreen();
    if (current === 'mineral' || current === 'settings' || current === 'diary-view') {
        Router.navigate('guide');
    } else {
        Router.navigate('home');
    }
});