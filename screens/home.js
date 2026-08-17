/* ============================================
   screens/home.js
   ============================================ */
const HomeScreen = {
    render() {
        const container = document.getElementById('screen-container');
        const profile = getProfile();
        const stats = getStats();
        const entries = getDiaryEntries();
        const recentEntries = entries.slice(0, 3);

        const mineralCount = MINERALS.length;
        const entryCount = entries.length;

        container.innerHTML = `
            <div class="screen active" id="screen-home">
                <div class="home-greeting">
                    <h1>Остерегайся аномалий, ${profile.name}!</h1>
                    <p> Поддерживай рассудок 67% </p>
                </div>

                <div class="home-stats-row">
                    <div class="home-stat-card">
                        <div class="stat-number">${mineralCount}</div>
                        <div class="stat-label">Лекарства</div>
                    </div>
                    <div class="home-stat-card">
                        <div class="stat-number">${entryCount}</div>
                        <div class="stat-label">Записи</div>
                    </div>
                    <div class="home-stat-card">
                        <div class="stat-number">${stats.totalExpeditions || 0}</div>
                        <div class="stat-label">Операции</div>
                    </div>
                </div>

                <div class="home-quick-grid">
                    <div class="home-quick-item" data-action="guide">
                        <div class="quick-icon">📚</div>
                        <div class="quick-label">Справочник</div>
                    </div>
                    <div class="home-quick-item" data-action="diary-add">
                        <div class="quick-icon">📝</div>
                        <div class="quick-label">Новая запись</div>
                    </div>
                    <div class="home-quick-item" data-action="tools">
                        <div class="quick-icon">🧭</div>
                        <div class="quick-label">Инструменты</div>
                    </div>
                    <div class="home-quick-item" data-action="identifier">
                        <div class="quick-icon">🔍</div>
                        <div class="quick-label">Определитель</div>
                    </div>
                </div>

                ${recentEntries.length > 0 ? `
                    <div class="home-recent">
                        <h3 style="margin-bottom: var(--spacing-md);">📋 Последние находки</h3>
                        ${recentEntries.map(entry => `
                            <div class="diary-entry" data-entry-id="${entry.id}" onclick="DiaryScreen.viewEntry('${entry.id}')">
                                ${entry.imageData ? `<img src="${entry.imageData}" class="entry-image" alt="Фото находки" />` : ''}
                                <div class="entry-header">
                                    <span class="entry-title">${entry.mineralName || 'Находка'}</span>
                                    <span class="entry-date">${getRelativeTime(entry.date || Date.now())}</span>
                                </div>
                                ${entry.description ? `<div class="entry-desc">${truncateText(entry.description, 80)}</div>` : ''}
                                <div class="entry-meta">
                                    ${entry.place ? `<span>📍 ${entry.place}</span>` : ''}
                                    ${entry.lat ? `<span>🌍 ${entry.lat.toFixed(4)}, ${entry.lng.toFixed(4)}</span>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div class="empty-state" style="margin-top: var(--spacing-xl);">
                        <div class="empty-icon">🗺️</div>
                        <h3>Начните исследование!</h3>
                        <p>Добавьте свою первую находку в дневник</p>
                        <button class="btn btn-primary" style="margin-top: var(--spacing-md);" onclick="Router.navigate('diary'); HomeScreen.triggerAdd();">
                            ✏️ Создать запись
                        </button>
                    </div>
                `}
            </div>
        `;

        this._attachEvents();
    },

    _attachEvents() {
        const items = document.querySelectorAll('.home-quick-item');
        items.forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;
                switch (action) {
                    case 'guide':
                        Router.navigate('guide');
                        break;
                    case 'diary-add':
                        Router.navigate('diary');
                        setTimeout(() => DiaryScreen.triggerAdd(), 300);
                        break;
                    case 'tools':
                        Router.navigate('tools');
                        break;
                    case 'identifier':
                        Router.navigate('tools');
                        setTimeout(() => ToolsScreen.openIdentifier(), 400);
                        break;
                    default:
                        break;
                }
            });
        });
    },

    triggerAdd() {
        DiaryScreen.triggerAdd();
    }
};