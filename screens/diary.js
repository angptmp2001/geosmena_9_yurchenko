/* ============================================
   screens/diary.js
   ============================================ */
const DiaryScreen = {
    _isAdding: false,

    render() {
        const entries = getDiaryEntries();
        const container = document.getElementById('screen-container');

        container.innerHTML = `
            <div class="screen active" id="screen-diary">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--spacing-md);">
                    <h2>📝 Дневник</h2>
                    <div style="display:flex;gap:var(--spacing-sm);">
                        ${entries.length > 0 ? `<button class="btn btn-sm btn-secondary" onclick="DiaryScreen.exportPDF()">📄 Экспорт</button>` : ''}
                        <button class="btn btn-sm btn-primary" onclick="DiaryScreen.triggerAdd()">+ Новая</button>
                    </div>
                </div>

                <div id="diary-list">
                    ${entries.length === 0 ? `
                        <div class="empty-state" style="margin-top:var(--spacing-2xl);">
                            <div class="empty-icon">📭</div>
                            <h3>Дневник пуст</h3>
                            <p>Добавьте свою первую находку</p>
                            <button class="btn btn-primary" style="margin-top:var(--spacing-md);" onclick="DiaryScreen.triggerAdd()">
                                ✏️ Создать запись
                            </button>
                        </div>
                    ` : entries.map(entry => `
                        <div class="diary-entry">
                            ${entry.imageData ? `<img src="${entry.imageData}" class="entry-image" alt="Фото" />` : ''}
                            <div class="entry-header">
                                <span class="entry-title">${entry.mineralName || 'Находка'}</span>
                                <span class="entry-date">${formatDateTime(entry.date || Date.now())}</span>
                            </div>
                            ${entry.description ? `<div class="entry-desc">${entry.description}</div>` : ''}
                            <div class="entry-meta">
                                ${entry.place ? `<span>📍 ${entry.place}</span>` : ''}
                                ${entry.lat ? `<span>🌍 ${entry.lat.toFixed(5)}, ${entry.lng.toFixed(5)}</span>` : ''}
                                ${entry.weather ? `<span>🌤️ ${entry.weather}</span>` : ''}
                            </div>
                            <div class="entry-actions">
                                <button class="btn btn-sm btn-ghost" onclick="DiaryScreen.viewEntry('${entry.id}')">👁️ Просмотр</button>
                                <button class="btn btn-sm btn-ghost" onclick="DiaryScreen.editEntry('${entry.id}')">✏️ Редактировать</button>
                                <button class="btn btn-sm btn-danger" onclick="DiaryScreen.deleteEntry('${entry.id}')">🗑️</button>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div id="diary-form-container" style="display:none;"></div>
            </div>
        `;

        this._attachEvents();
    },

    _attachEvents() {
        // Nothing special for now
    },

    triggerAdd(prefill) {
        this._isAdding = true;
        const container = document.getElementById('diary-form-container');
        if (!container) {
            this.render();
            this.triggerAdd(prefill);
            return;
        }

        container.style.display = 'block';
        container.innerHTML = this._renderForm(null, prefill);

        // Scroll to form
        setTimeout(() => {
            container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);

        // Auto-get GPS
        this._getLocationForForm();
    },

    _renderForm(entry, prefill) {
        const isEdit = !!entry;
        const data = entry || {
            id: generateId(),
            date: Date.now(),
            mineralName: prefill?.mineralName || '',
            description: '',
            place: '',
            lat: null,
            lng: null,
            accuracy: null,
            weather: '',
            imageData: null
        };

        return `
            <div class="card card-glass" style="margin-top:var(--spacing-md);">
                <div class="card-header">
                    <span class="card-title">${isEdit ? '✏️ Редактировать запись' : '📝 Новая запись'}</span>
                    <button class="btn-icon" onclick="DiaryScreen._closeForm()">✕</button>
                </div>
                <form id="diary-form" onsubmit="DiaryScreen._submitForm(event)">
                    <input type="hidden" name="id" value="${data.id}" />
                    <input type="hidden" name="date" value="${data.date}" />

                    <div class="form-group">
                        <label>Название минерала *</label>
                        <input type="text" class="form-control" name="mineralName" placeholder="Например: Кварц" value="${data.mineralName || ''}" required />
                    </div>

                    <div class="form-group">
                        <label>Описание</label>
                        <textarea class="form-control" name="description" placeholder="Опишите находку...">${data.description || ''}</textarea>
                    </div>

                    <div class="form-group">
                        <label>Место находки</label>
                        <input type="text" class="form-control" name="place" placeholder="Где нашли?" value="${data.place || ''}" />
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>Широта</label>
                            <input type="number" step="any" class="form-control" name="lat" placeholder="0.00000" value="${data.lat || ''}" />
                        </div>
                        <div class="form-group">
                            <label>Долгота</label>
                            <input type="number" step="any" class="form-control" name="lng" placeholder="0.00000" value="${data.lng || ''}" />
                        </div>
                    </div>

                    <div style="display:flex;gap:var(--spacing-sm);margin-bottom:var(--spacing-md);">
                        <button type="button" class="btn btn-sm btn-outline" onclick="DiaryScreen._getLocationForForm()">📍 Текущее местоположение</button>
                        <span id="gps-status" style="font-size:var(--font-size-xs);color:var(--color-text-muted);display:flex;align-items:center;">Не определено</span>
                    </div>

                    <div class="form-group">
                        <label>Погода</label>
                        <input type="text" class="form-control" name="weather" placeholder="Солнечно, дождь..." value="${data.weather || ''}" />
                    </div>

                    <div class="form-group">
                        <label>Фото</label>
                        <input type="file" class="form-control" name="image" accept="image/*" />
                        ${data.imageData ? `<img src="${data.imageData}" style="max-width:100%;max-height:200px;border-radius:var(--radius-small);margin-top:var(--spacing-sm);" />` : ''}
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">💾 Сохранить</button>
                        <button type="button" class="btn btn-ghost" onclick="DiaryScreen._closeForm()">Отмена</button>
                    </div>
                </form>
            </div>
        `;
    },

    _closeForm() {
        const container = document.getElementById('diary-form-container');
        if (container) {
            container.style.display = 'none';
            container.innerHTML = '';
        }
        this._isAdding = false;
        this.render();
    },

    _getLocationForForm() {
        const statusEl = document.getElementById('gps-status');
        if (statusEl) statusEl.textContent = '⏳ Определение...';

        getGeoPosition().then(pos => {
            const latInput = document.querySelector('input[name="lat"]');
            const lngInput = document.querySelector('input[name="lng"]');
            if (latInput) latInput.value = pos.lat.toFixed(6);
            if (lngInput) lngInput.value = pos.lng.toFixed(6);
            if (statusEl) statusEl.textContent = `✅ ${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)} (точность ${pos.accuracy.toFixed(0)}м)`;
        }).catch(err => {
            if (statusEl) statusEl.textContent = '❌ Ошибка: ' + err.message;
            Toast.show('Не удалось определить местоположение', 'warning');
        });
    },

    _submitForm(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);

        const entry = {
            id: formData.get('id'),
            date: parseInt(formData.get('date')) || Date.now(),
            mineralName: formData.get('mineralName') || 'Находка',
            description: formData.get('description') || '',
            place: formData.get('place') || '',
            lat: parseFloat(formData.get('lat')) || null,
            lng: parseFloat(formData.get('lng')) || null,
            weather: formData.get('weather') || '',
            imageData: null
        };

        const imageFile = formData.get('image');
        if (imageFile && imageFile.size > 0) {
            readFileAsDataURL(imageFile).then(dataUrl => {
                entry.imageData = dataUrl;
                this._saveEntry(entry);
            }).catch(() => {
                this._saveEntry(entry);
            });
        } else {
            this._saveEntry(entry);
        }
    },

    _saveEntry(entry) {
        const existing = getDiaryEntry(entry.id);
        if (existing) {
            updateDiaryEntry(entry.id, entry);
            Toast.show('✅ Запись обновлена', 'success');
        } else {
            addDiaryEntry(entry);
            // Update stats
            const stats = getStats();
            stats.totalEntries = (stats.totalEntries || 0) + 1;
            if (entry.mineralName && entry.mineralName !== 'Находка') {
                stats.totalMineralsFound = (stats.totalMineralsFound || 0) + 1;
                if (!stats.uniqueMinerals) stats.uniqueMinerals = [];
                if (!stats.uniqueMinerals.includes(entry.mineralName)) {
                    stats.uniqueMinerals.push(entry.mineralName);
                }
            }
            stats.lastActive = Date.now();
            // Update streak
            const lastActive = stats.lastActive;
            if (lastActive) {
                const daysSince = Math.floor((Date.now() - lastActive) / (1000 * 60 * 60 * 24));
                if (daysSince <= 1) {
                    stats.currentStreak = (stats.currentStreak || 0) + 1;
                } else if (daysSince > 1) {
                    stats.currentStreak = 1;
                }
                if (stats.currentStreak > (stats.longestStreak || 0)) {
                    stats.longestStreak = stats.currentStreak;
                }
            }
            saveStats(stats);
            Toast.show('✅ Запись сохранена!', 'success');
            this._checkAchievements();
        }
        this._closeForm();
        this.render();
    },

    _checkAchievements() {
        const entries = getDiaryEntries();
        const stats = getStats();
        const achievements = getAchievements();

        if (entries.length >= 1 && !achievements.includes('first_find')) {
            unlockAchievement('first_find');
            Toast.show('🏆 Достижение: Первая находка!', 'success');
        }
        if (entries.length >= 10 && !achievements.includes('collector')) {
            unlockAchievement('collector');
            Toast.show('🏆 Достижение: Коллекционер!', 'success');
        }
        if (entries.length >= 50 && !achievements.includes('geologist')) {
            unlockAchievement('geologist');
            Toast.show('🏆 Достижение: Геолог!', 'success');
        }
        if (stats.uniqueMinerals && stats.uniqueMinerals.length >= 5 && !achievements.includes('researcher')) {
            unlockAchievement('researcher');
            Toast.show('🏆 Достижение: Исследователь!', 'success');
        }
        if (stats.currentStreak >= 7 && !achievements.includes('streak_7')) {
            unlockAchievement('streak_7');
            Toast.show('🏆 Достижение: Неделя открытий!', 'success');
        }
        if (stats.totalExpeditions >= 10 && !achievements.includes('expedition_10')) {
            unlockAchievement('expedition_10');
            Toast.show('🏆 Достижение: Полевик!', 'success');
        }
    },

    viewEntry(id) {
        const entry = getDiaryEntry(id);
        if (!entry) {
            Toast.show('Запись не найдена', 'error');
            return;
        }

        const container = document.getElementById('screen-container');
        container.innerHTML = `
            <div class="screen active" id="screen-diary-view">
                <button class="btn btn-ghost btn-sm" style="margin-bottom:var(--spacing-md);" onclick="DiaryScreen.render()">← Назад</button>

                <div class="card card-glass">
                    ${entry.imageData ? `<img src="${entry.imageData}" style="width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:var(--radius-small);margin-bottom:var(--spacing-md);" />` : ''}
                    <h2 style="font-size:var(--font-size-xl);">${entry.mineralName || 'Находка'}</h2>
                    <div style="color:var(--color-text-muted);font-size:var(--font-size-sm);margin-bottom:var(--spacing-md);">
                        ${formatDateTime(entry.date || Date.now())}
                    </div>
                    ${entry.description ? `<p style="margin-bottom:var(--spacing-md);">${entry.description}</p>` : ''}
                    <div class="property-grid">
                        ${entry.place ? `<div class="property-item"><div class="prop-label">📍 Место</div><div class="prop-value">${entry.place}</div></div>` : ''}
                        ${entry.lat ? `<div class="property-item"><div class="prop-label">🌍 Координаты</div><div class="prop-value">${entry.lat.toFixed(5)}, ${entry.lng.toFixed(5)}</div></div>` : ''}
                        ${entry.weather ? `<div class="property-item"><div class="prop-label">🌤️ Погода</div><div class="prop-value">${entry.weather}</div></div>` : ''}
                    </div>
                    <div style="display:flex;gap:var(--spacing-sm);margin-top:var(--spacing-md);">
                        <button class="btn btn-sm btn-ghost" onclick="DiaryScreen.editEntry('${entry.id}')">✏️ Редактировать</button>
                        <button class="btn btn-sm btn-danger" onclick="DiaryScreen.deleteEntry('${entry.id}')">🗑️ Удалить</button>
                        <button class="btn btn-sm btn-secondary" onclick="DiaryScreen.exportSingle('${entry.id}')">📄 PDF</button>
                    </div>
                </div>
            </div>
        `;
    },

    editEntry(id) {
        const entry = getDiaryEntry(id);
        if (!entry) {
            Toast.show('Запись не найдена', 'error');
            return;
        }
        this._isAdding = true;
        const container = document.getElementById('screen-container');
        container.innerHTML = `
            <div class="screen active" id="screen-diary">
                <button class="btn btn-ghost btn-sm" style="margin-bottom:var(--spacing-md);" onclick="DiaryScreen.render()">← Назад</button>
                <div id="diary-form-container" style="display:block;">
                    ${this._renderForm(entry, null)}
                </div>
            </div>
        `;
        setTimeout(() => {
            const formContainer = document.getElementById('diary-form-container');
            if (formContainer) formContainer.scrollIntoView({ behavior: 'smooth' });
        }, 200);
    },

    deleteEntry(id) {
        if (confirm('Удалить эту запись?')) {
            deleteDiaryEntry(id);
            Toast.show('🗑️ Запись удалена', 'info');
            this.render();
        }
    },

    exportPDF() {
        const entries = getDiaryEntries();
        if (entries.length === 0) {
            Toast.show('Нет записей для экспорта', 'warning');
            return;
        }
        Toast.show('⏳ Генерация PDF...', 'info');
        PDFExporter.exportDiary(entries).then(() => {
            Toast.show('📄 PDF готов', 'success');
        }).catch(() => {
            Toast.show('Ошибка при создании PDF', 'error');
        });
    },

    exportSingle(id) {
        const entry = getDiaryEntry(id);
        if (!entry) {
            Toast.show('Запись не найдена', 'error');
            return;
        }
        Toast.show('⏳ Генерация PDF...', 'info');
        PDFExporter.exportSingleEntry(entry).then(() => {
            Toast.show('📄 PDF готов', 'success');
        }).catch(() => {
            Toast.show('Ошибка при создании PDF', 'error');
        });
    }
};