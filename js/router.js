/* ============================================
   js/router.js
   ============================================ */
const Router = {
    _currentScreen: 'home',
    _params: {},

    navigate(screen, params) {
        this._currentScreen = screen;
        this._params = params || {};

        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.screen === screen);
        });

        // Render screen
        this._renderScreen(screen, params);

        // Close any open forms
        const formContainer = document.getElementById('diary-form-container');
        if (formContainer) {
            formContainer.style.display = 'none';
            formContainer.innerHTML = '';
        }

        // Scroll to top
        const container = document.getElementById('screen-container');
        if (container) container.scrollTop = 0;
    },

    _renderScreen(screen, params) {
        switch (screen) {
            case 'home':
                HomeScreen.render();
                break;
            case 'guide':
                GuideScreen.render();
                break;
            case 'mineral':
                MineralScreen.render(params);
                break;
            case 'diary':
                DiaryScreen.render();
                break;
            case 'tools':
                ToolsScreen.render();
                break;
            case 'profile':
                ProfileScreen.render();
                break;
            case 'settings':
                SettingsScreen.render();
                break;
            default:
                HomeScreen.render();
        }
    },

    getCurrentScreen() {
        return this._currentScreen;
    },

    getParams() {
        return this._params;
    },

    goBack() {
        this.navigate('home');
    }
};