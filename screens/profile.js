const ProfileScreen = {
    render() {
        const profile = getProfile();
        const stats = getStats();
        const entries = getDiaryEntries();
        const achievements = getAchievements();

        const allAchievements = [
            { id: 'first_find', icon: '🏆', name: 'Первая находка', desc: 'Сделать первую запись в дневнике' },
            { id: 'collector', icon: '📦', name: 'Коллекционер', desc: 'Собрать 10 находок' },
            { id: 'geologist', icon: '🔬', name: 'Геолог', desc: 'Собрать 50 находок' },
            { id: 'researcher', icon: '🧪', name: 'Исследователь', desc: 'Найти 5 разных минералов' },
            { id: 'streak_7', icon: '🔥', name: 'Неделя открытий', desc: 'Дневник активен 7 дней подряд' },
            { id: 'expedition_10', icon: '⛰️', name: 'Полевик', desc: 'Совершить 10 экспедиций' }
        ];

        const mineralCount = MINERALS.length;
        const entryCount = entries.length;

        const container = document.getElementById('screen-container');
        container.innerHTML = `
            <div class="screen active" id="screen-profile">
                <div class="profile-header">
                    <div class="profile-avatar" style="font-size:0; overflow:hidden; display:flex; align-items:center; justify-content:center;">
                        ${profile.avatar && profile.avatar.startsWith('data:image') 
                            ? `<img src="${profile.avatar}" style="width:100%;height:100%;object-fit:cover;" />` 
                            : `<span style="font-size:40px;">${profile.avatar || '🧑‍🔬'}</span>`}
                    </div>
                    <div class="profile-name">${profile.name}</div>
                    <div class="profile-role">Юный геолог • Уровень ${profile.level || 1}</div>
                </div>

                <div class="profile-stats">
                    <div class="profile-stat">
                        <div class="ps-number">${mineralCount}</div>
                        <div class="ps-label">Минералов</div>
                    </div>
                    <div class="profile-stat">
                        <div class="ps-number">${entryCount}</div>
                        <div class="ps-label">Находок</div>
                    </div>
                    <div class="profile-stat">
                        <div class="ps-number">${stats.totalExpeditions || 0}</div>
                        <div class="ps-label">Экспедиций</div>
                    </div>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--spacing-sm);margin:var(--spacing-md) 0;">
                    <div class="card" style="text-align:center;padding:var(--spacing-md);">
                        <div style="font-size:28px;">🔥</div>
                        <div style="font-weight:700;font-size:var(--font-size-lg);">${stats.currentStreak || 0}</div>
                        <div style="font-size:var(--font-size-xs);color:var(--color-text-muted);">Дней подряд</div>
                    </div>
                    <div class="card" style="text-align:center;padding:var(--spacing-md);">
                        <div style="font-size:28px;">🏅</div>
                        <div style="font-weight:700;font-size:var(--font-size-lg);">${stats.longestStreak || 0}</div>
                        <div style="font-size:var(--font-size-xs);color:var(--color-text-muted);">Рекордный стрик</div>
                    </div>
                </div>

                <h3 style="margin:var(--spacing-md) 0;">🏅 Достижения</h3>
                <div class="achievement-grid">
                    ${allAchievements.map(ach => {
                        const unlocked = achievements.includes(ach.id);
                        return `
                            <div class="achievement-item ${unlocked ? 'unlocked' : 'locked'}">
                                <div class="ach-icon">${ach.icon}</div>
                                <div class="ach-name">${ach.name}</div>
                                ${unlocked ? '<div style="font-size:10px;color:var(--color-secondary);">✅</div>' : ''}
                            </div>
                        `;
                    }).join('')}
                </div>

                <div style="margin:var(--spacing-md) 0;display:flex;gap:var(--spacing-sm);flex-wrap:wrap;">
                    <button class="btn btn-sm btn-ghost" onclick="Router.navigate('settings')">⚙️ Настройки</button>
                    <button class="btn btn-sm btn-ghost" onclick="ProfileScreen.editProfile()">✏️ Редактировать профиль</button>
                    <button class="btn btn-sm btn-ghost" onclick="ProfileScreen.runDiagnostic()">🔍 Диагностика</button>
                </div>
            </div>
        `;
    },

    editProfile() {
        const profile = getProfile();
        const container = document.getElementById('screen-container');

        container.innerHTML = `
            <div class="screen active" id="screen-profile-edit">
                <button class="btn btn-ghost btn-sm" style="margin-bottom:var(--spacing-md);" onclick="ProfileScreen.render()">← Назад</button>

                <div class="card card-glass">
                    <h3>✏️ Редактировать профиль</h3>
                    <form id="profile-form" onsubmit="ProfileScreen.saveProfile(event)">
                        <div class="form-group">
                            <label>Имя</label>
                            <input type="text" class="form-control" name="name" value="${profile.name || ''}" required />
                        </div>
                        <div class="form-group">
                            <label>Аватар (эмодзи или фото)</label>
                            <div style="display:flex;align-items:center;gap:var(--spacing-md);">
                                <div style="width:80px;height:80px;border-radius:50%;background:var(--color-background);display:flex;align-items:center;justify-content:center;overflow:hidden;border:2px solid var(--color-primary);" id="avatar-preview">
                                    ${profile.avatar && profile.avatar.startsWith('data:image') 
                                        ? `<img src="${profile.avatar}" style="width:100%;height:100%;object-fit:cover;" />` 
                                        : `<span style="font-size:40px;">${profile.avatar || '🧑‍🔬'}</span>`}
                                </div>
                                <div>
                                    <input type="file" id="avatar-file" accept="image/*" style="display:none;" />
                                    <button type="button" class="btn btn-sm btn-outline" onclick="document.getElementById('avatar-file').click()">📷 Выбрать фото</button>
                                    <button type="button" class="btn btn-sm btn-ghost" onclick="ProfileScreen.clearAvatar()">❌ Удалить</button>
                                </div>
                            </div>
                            <input type="hidden" name="avatar" id="avatar-data" value="${profile.avatar || ''}" />
                            <div style="display:flex;flex-wrap:wrap;gap:var(--spacing-sm);margin-top:var(--spacing-sm);">
                                ${['🧑‍🔬', '👩‍🔬', '🧑‍🏫', '🌋', '⛰️', '🔬', '🧪', '🪨', '💎'].map(emoji => `
                                    <button type="button" class="btn btn-sm btn-ghost" onclick="ProfileScreen.setEmojiAvatar('${emoji}')" style="font-size:24px;padding:8px 12px;">${emoji}</button>
                                `).join('')}
                            </div>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">💾 Сохранить</button>
                            <button type="button" class="btn btn-ghost" onclick="ProfileScreen.render()">Отмена</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.getElementById('avatar-file').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(ev) {
                const dataUrl = ev.target.result;
                document.getElementById('avatar-data').value = dataUrl;
                document.getElementById('avatar-preview').innerHTML = `<img src="${dataUrl}" style="width:100%;height:100%;object-fit:cover;" />`;
            };
            reader.readAsDataURL(file);
        });
    },

    setEmojiAvatar(emoji) {
        document.getElementById('avatar-data').value = emoji;
        document.getElementById('avatar-preview').innerHTML = `<span style="font-size:40px;">${emoji}</span>`;
    },

    clearAvatar() {
        document.getElementById('avatar-data').value = '';
        document.getElementById('avatar-preview').innerHTML = `<span style="font-size:40px;">🧑‍🔬</span>`;
    },

    saveProfile(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);

        const profile = {
            name: formData.get('name') || 'Юный геолог',
            avatar: formData.get('avatar') || '🧑‍🔬',
            level: getProfile().level || 1,
            experience: getProfile().experience || 0,
            joined: getProfile().joined || Date.now()
        };

        saveProfile(profile);
        Toast.show('✅ Профиль обновлён', 'success');
        this.render();
    },

    runDiagnostic() {
        Toast.show('⏳ Запуск диагностики...', 'info');
        Diagnostic.runAsync().then(results => {
            const passed = results.checks.filter(c => c.passed).length;
            const total = results.checks.length;

            let html = `
                <div class="card card-glass">
                    <h3>🔍 Диагностика</h3>
                    <p style="font-size:var(--font-size-sm);color:var(--color-text-muted);margin-bottom:var(--spacing-md);">
                        Проверка: ${passed}/${total} пройдено
                        ${passed === total ? ' ✅ Всё работает!' : ' ⚠️ Есть проблемы'}
                    </p>
                    ${results.checks.map(c => `
                        <div style="display:flex;justify-content:space-between;padding:var(--spacing-sm) 0;border-bottom:1px solid var(--color-border);">
                            <span>${c.name}</span>
                            <span style="color:${c.passed ? 'var(--color-secondary)' : 'var(--color-error)'};font-weight:600;">
                                ${c.passed ? '✅' : '❌'} ${c.details || ''}
                            </span>
                        </div>
                    `).join('')}
                    <button class="btn btn-sm btn-ghost" style="margin-top:var(--spacing-md);" onclick="ProfileScreen.render()">← Назад</button>
                </div>
            `;

            const container = document.getElementById('screen-container');
            container.innerHTML = `
                <div class="screen active" id="screen-profile-diagnostic">
                    ${html}
                </div>
            `;
        });
    }
};