const SettingsScreen = {
    render() {
        const settings = getSettings();
        const currentTheme = settings.theme || 'light';
        const container = document.getElementById('screen-container');

        container.innerHTML = `
            <div class="screen active" id="screen-settings">
                <button class="btn btn-ghost btn-sm" style="margin-bottom:var(--spacing-md);" onclick="Router.navigate('profile')">← Назад</button>
                <h2 style="margin-bottom:var(--spacing-md);">⚙️ Настройки</h2>

                <div class="settings-group">
                    <div class="settings-title">Тема оформления</div>
                    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--spacing-sm);margin-bottom:var(--spacing-md);">
                        ${Object.entries(SettingsManager.THEMES).map(([key, label]) => `
                            <div class="theme-card ${key === currentTheme ? 'active' : ''}" 
                                 data-theme="${key}"
                                 onclick="SettingsScreen.selectTheme('${key}')"
                                 style="
                                    padding:var(--spacing-md);
                                    border-radius:var(--radius-small);
                                    border:2px solid ${key === currentTheme ? 'var(--color-primary)' : 'var(--color-border)'};
                                    background:var(--color-surface);
                                    text-align:center;
                                    cursor:pointer;
                                    transition:all var(--transition-fast);
                                 ">
                                <div style="
                                    width:100%;
                                    height:40px;
                                    border-radius:var(--radius-small);
                                    background:${this._getThemePreview(key)};
                                    margin-bottom:var(--spacing-sm);
                                "></div>
                                <span style="font-size:var(--font-size-sm);font-weight:500;">${label}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="settings-group">
                    <div class="settings-title">Внешний вид</div>
                    <div class="settings-item" onclick="SettingsScreen.changeFontSize()">
                        <div class="si-left">
                            <span class="si-icon">🔤</span>
                            <div>
                                <div class="si-text">Размер шрифта</div>
                                <div class="si-desc">${settings.fontSize || 'medium'}</div>
                            </div>
                        </div>
                        <span class="si-arrow">›</span>
                    </div>
                </div>

                <div class="settings-group">
                    <div class="settings-title">Приложение</div>
                    <div class="settings-item" onclick="SettingsScreen.toggleGPS()">
                        <div class="si-left">
                            <span class="si-icon">📍</span>
                            <div>
                                <div class="si-text">GPS</div>
                                <div class="si-desc">Использовать геолокацию</div>
                            </div>
                        </div>
                        <div class="switch">
                            <input type="checkbox" id="gps-switch" ${settings.gpsEnabled !== false ? 'checked' : ''} />
                            <span class="slider"></span>
                        </div>
                    </div>
                    <div class="settings-item" onclick="SettingsScreen.toggleNotifications()">
                        <div class="si-left">
                            <span class="si-icon">🔔</span>
                            <div>
                                <div class="si-text">Уведомления</div>
                                <div class="si-desc">Показывать напоминания</div>
                            </div>
                        </div>
                        <div class="switch">
                            <input type="checkbox" id="notif-switch" ${settings.notifications !== false ? 'checked' : ''} />
                            <span class="slider"></span>
                        </div>
                    </div>
                </div>

                <div class="settings-group">
                    <div class="settings-title">Данные</div>
                    <div class="settings-item" onclick="SettingsScreen.exportData()">
                        <div class="si-left">
                            <span class="si-icon">📤</span>
                            <div>
                                <div class="si-text">Экспорт данных</div>
                                <div class="si-desc">Сохранить все данные в JSON</div>
                            </div>
                        </div>
                        <span class="si-arrow">›</span>
                    </div>
                    <div class="settings-item" onclick="SettingsScreen.importData()">
                        <div class="si-left">
                            <span class="si-icon">📥</span>
                            <div>
                                <div class="si-text">Импорт данных</div>
                                <div class="si-desc">Восстановить из JSON</div>
                            </div>
                        </div>
                        <span class="si-arrow">›</span>
                    </div>
                    <div class="settings-item" onclick="SettingsScreen.clearData()" style="border-color:var(--color-error);">
                        <div class="si-left">
                            <span class="si-icon" style="color:var(--color-error);">🗑️</span>
                            <div>
                                <div class="si-text" style="color:var(--color-error);">Очистить все данные</div>
                                <div class="si-desc">Удалить все записи и настройки</div>
                            </div>
                        </div>
                        <span class="si-arrow">›</span>
                    </div>
                </div>

                <div class="settings-group">
                    <div class="settings-title">О приложении</div>
                    <div class="settings-item" onclick="SettingsScreen.showAbout()">
                        <div class="si-left">
                            <span class="si-icon">ℹ️</span>
                            <div>
                                <div class="si-text">О GeoPocket</div>
                                <div class="si-desc">Версия 1.0.0</div>
                            </div>
                        </div>
                        <span class="si-arrow">›</span>
                    </div>
                </div>
            </div>
        `;

        this._attachEvents();
    },

    _getThemePreview(theme) {
        const previews = {
            light: 'linear-gradient(135deg, #F5F7FA, #FFFFFF)',
            dark: 'linear-gradient(135deg, #0F172A, #1E293B)',
            sunset: 'linear-gradient(135deg, #FFF7ED, #F97316)',
            dawn: 'linear-gradient(135deg, #F5F3FF, #8B5CF6)',
            field: 'linear-gradient(135deg, #F0FDF4, #22C55E)',
            mountain: 'linear-gradient(135deg, #F1F5F9, #3B82F6)'
        };
        return previews[theme] || previews.light;
    },

    selectTheme(theme) {
        if (theme === getSettings().theme) return;
        SettingsManager.set('theme', theme);
        this.render();
        Toast.show(`🎨 Тема: ${SettingsManager.THEMES[theme]}`, 'success');
    },

    _attachEvents() {
        const gpsSwitch = document.getElementById('gps-switch');
        if (gpsSwitch) {
            gpsSwitch.addEventListener('change', () => {
                const settings = getSettings();
                settings.gpsEnabled = gpsSwitch.checked;
                saveSettings(settings);
                Toast.show(`GPS ${gpsSwitch.checked ? '✅ включён' : '⛔ выключен'}`, 'info');
            });
        }

        const notifSwitch = document.getElementById('notif-switch');
        if (notifSwitch) {
            notifSwitch.addEventListener('change', () => {
                const settings = getSettings();
                settings.notifications = notifSwitch.checked;
                saveSettings(settings);
                Toast.show(`Уведомления ${notifSwitch.checked ? '✅ включены' : '⛔ выключены'}`, 'info');
            });
        }
    },

    toggleGPS() {
        const sw = document.getElementById('gps-switch');
        if (sw) {
            sw.checked = !sw.checked;
            sw.dispatchEvent(new Event('change'));
        }
    },

    toggleNotifications() {
        const sw = document.getElementById('notif-switch');
        if (sw) {
            sw.checked = !sw.checked;
            sw.dispatchEvent(new Event('change'));
        }
    },

    changeFontSize() {
        const sizes = ['small', 'medium', 'large', 'xlarge'];
        const labels = ['Маленький', 'Средний', 'Большой', 'Очень большой'];
        const current = getSettings().fontSize || 'medium';
        const idx = sizes.indexOf(current);
        const next = sizes[(idx + 1) % sizes.length];

        const settings = getSettings();
        settings.fontSize = next;
        saveSettings(settings);
        SettingsManager._applyFontSize(settings);
        Toast.show(`Размер шрифта: ${labels[sizes.indexOf(next)]}`, 'info');
        this.render();
    },

    exportData() {
        const data = {
            version: '1.0.0',
            exported: new Date().toISOString(),
            settings: getSettings(),
            profile: getProfile(),
            diary: getDiaryEntries(),
            favorites: getFavorites(),
            achievements: getAchievements(),
            stats: getStats()
        };
        const json = JSON.stringify(data, null, 2);
        downloadFile(json, `geopocket_backup_${formatDate(Date.now())}.json`, 'application/json');
        Toast.show('📤 Данные экспортированы', 'success');
    },

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const data = JSON.parse(ev.target.result);
                    if (data.settings) saveSettings(data.settings);
                    if (data.profile) saveProfile(data.profile);
                    if (data.diary) saveDiaryEntries(data.diary);
                    if (data.favorites) saveFavorites(data.favorites);
                    if (data.achievements) saveAchievements(data.achievements);
                    if (data.stats) saveStats(data.stats);
                    Toast.show('📥 Данные импортированы', 'success');
                    Router.navigate('profile');
                } catch (err) {
                    Toast.show('Ошибка при импорте', 'error');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    },

    clearData() {
        if (confirm('Удалить все данные? Это действие нельзя отменить.')) {
            if (confirm('Вы уверены? Все записи и настройки будут потеряны.')) {
                Storage.clear();
                Toast.show('🗑️ Все данные очищены', 'info');
                const defaults = {
                    theme: 'light',
                    language: 'ru',
                    notifications: true,
                    gpsEnabled: true,
                    offlineMode: true,
                    fontSize: 'medium'
                };
                saveSettings(defaults);
                saveProfile({ name: 'Юный геолог', avatar: '🧑‍🔬', level: 1, experience: 0, joined: Date.now() });
                saveDiaryEntries([]);
                saveFavorites([]);
                saveAchievements([]);
                saveStats({ totalEntries: 0, totalMineralsFound: 0, totalExpeditions: 0, currentStreak: 0, longestStreak: 0, lastActive: null, uniqueMinerals: [] });
                Router.navigate('home');
            }
        }
    },

    showAbout() {
        const container = document.getElementById('screen-container');
        container.innerHTML = `
            <div class="screen active" id="screen-about">
                <button class="btn btn-ghost btn-sm" style="margin-bottom:var(--spacing-md);" onclick="Router.navigate('settings')">← Назад</button>
                <div class="card card-glass" style="text-align:center;padding:var(--spacing-xl);">
                    <div style="font-size:64px;margin-bottom:var(--spacing-md);">⛰️</div>
                    <h1 style="font-size:var(--font-size-2xl);color:var(--color-primary);">GeoPocket</h1>
                    <p style="font-size:var(--font-size-md);color:var(--color-text-secondary);">Карманный геолог</p>
                    <p style="font-size:var(--font-size-sm);color:var(--color-text-muted);margin:var(--spacing-md) 0;">
                        Версия 1.0.0
                    </p>
                    <p style="font-size:var(--font-size-sm);color:var(--color-text-secondary);">
                        Приложение для юных геологов и исследователей.<br />
                        Работает полностью офлайн.
                    </p>
                    <div style="margin-top:var(--spacing-md);display:flex;gap:var(--spacing-sm);justify-content:center;flex-wrap:wrap;">
                        <span class="badge">💎 ${MINERALS.length} минералов</span>
                        <span class="badge">🪨 ${ROCKS.length} пород</span>
                        <span class="badge">📖 ${TERMS.length} терминов</span>
                    </div>
                    <p style="font-size:var(--font-size-xs);color:var(--color-text-muted);margin-top:var(--spacing-lg);">
                        Сделано с ❤️ для IT-Куб
                    </p>
                </div>
            </div>
        `;
    }
};