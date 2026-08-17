const SettingsManager = {
    // Доступные темы
    THEMES: {
        light: 'Светлая',
        dark: 'Тёмная',
        sunset: 'Закат',
        dawn: 'Рассвет',
        field: 'Поле',
        mountain: 'Горы'
    },

    getAll() {
        return getSettings();
    },

    get(key) {
        const settings = getSettings();
        return settings[key];
    },

    set(key, value) {
        const settings = getSettings();
        settings[key] = value;
        saveSettings(settings);
        this._applyTheme(settings.theme);
        return settings;
    },

    setMultiple(updates) {
        const settings = getSettings();
        for (const [key, value] of Object.entries(updates)) {
            settings[key] = value;
        }
        saveSettings(settings);
        this._applyTheme(settings.theme);
        return settings;
    },

    reset() {
        const defaults = {
            theme: 'light',
            language: 'ru',
            notifications: true,
            gpsEnabled: true,
            offlineMode: true,
            fontSize: 'medium'
        };
        saveSettings(defaults);
        this._applyTheme(defaults.theme);
        return defaults;
    },

    _applyTheme(theme) {
        const html = document.documentElement;
        Object.keys(this.THEMES).forEach(t => html.classList.remove(`theme-${t}`));
        if (theme && this.THEMES[theme]) {
            html.classList.add(`theme-${theme}`);
        } else {
            html.classList.add('theme-light');
        }
    },

    init() {
        const settings = this.getAll();
        this._applyTheme(settings.theme || 'light');
        this._applyFontSize(settings);
        return settings;
    },

    _applyFontSize(settings) {
        const size = settings.fontSize || 'medium';
        const sizes = {
            small: '13px',
            medium: '15px',
            large: '18px',
            xlarge: '21px'
        };
        const baseSize = sizes[size] || '15px';
        document.documentElement.style.setProperty('--font-size-base', baseSize);
    }
};