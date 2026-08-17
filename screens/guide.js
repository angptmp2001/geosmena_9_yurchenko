const GuideScreen = {
    _currentTab: 'minerals',
    _searchTerm: '',
    _filteredData: [],

    render() {
        const container = document.getElementById('screen-container');
        container.innerHTML = `
            <div class="screen active" id="screen-guide">
                <div class="guide-search">
                    <input type="text" id="guide-search-input" placeholder="Поиск минералов, пород, терминов..." autocomplete="off" />
                </div>

                <div class="guide-tabs">
                    <button class="tab-btn active" data-tab="minerals">💎 Минералы</button>
                    <button class="tab-btn" data-tab="rocks">🪨 Породы</button>
                    <button class="tab-btn" data-tab="terms">📖 Термины</button>
                </div>

                <div class="guide-list" id="guide-list">
                    ${this._renderItems('minerals', '')}
                </div>
            </div>
        `;

        this._attachEvents();
    },

    _renderItems(tab, search) {
        let data = [];
        let renderFn;

        switch (tab) {
            case 'minerals':
                data = MINERALS;
                renderFn = this._renderMineralItem;
                break;
            case 'rocks':
                data = ROCKS;
                renderFn = this._renderRockItem;
                break;
            case 'terms':
                data = TERMS;
                renderFn = this._renderTermItem;
                break;
            default:
                return '<div class="empty-state"><p>Ничего не найдено</p></div>';
        }

        if (search.trim()) {
            const term = search.toLowerCase().trim();
            data = data.filter(item => {
                return Object.values(item).some(val => {
                    if (!val) return false;
                    return String(val).toLowerCase().includes(term);
                });
            });
        }

        if (data.length === 0) {
            return '<div class="empty-state"><div class="empty-icon">🔍</div><p>Ничего не найдено</p></div>';
        }

        return data.map(renderFn).join('');
    },

    _renderMineralItem(mineral) {
        const isFav = isFavorite(mineral.id);
        return `
            <div class="card card-horizontal" onclick="GuideScreen.openMineral('${mineral.id}')">
                <div class="card-image-sm" style="background: linear-gradient(135deg, #E2E8F0, #CBD5E1); display:flex; align-items:center; justify-content:center; font-size:28px;">
                    💎
                </div>
                <div class="card-content">
                    <div class="card-title">${mineral.name} <span style="font-weight:400;color:var(--color-text-muted);font-size:var(--font-size-sm);">${mineral.formula || ''}</span></div>
                    <div class="card-desc">${mineral.description ? truncateText(mineral.description, 60) : ''}</div>
                    <div style="display:flex;gap:4px;margin-top:4px;flex-wrap:wrap;">
                        <span class="badge">Тв. ${mineral.hardness}</span>
                        <span class="badge">${mineral.luster || ''}</span>
                        ${isFav ? '<span class="badge badge-primary">⭐ Избранное</span>' : ''}
                        <button class="btn btn-sm btn-ghost" style="padding:2px 8px;font-size:12px;" onclick="event.stopPropagation(); GuideScreen.editMineral('${mineral.id}')">✏️</button>
                    </div>
                </div>
                <div style="font-size:20px;color:var(--color-text-muted);">›</div>
            </div>
        `;
    },

    _renderRockItem(rock) {
        return `
            <div class="card card-horizontal" onclick="GuideScreen.openRock('${rock.id}')">
                <div class="card-image-sm" style="background: linear-gradient(135deg, #D1D5DB, #9CA3AF); display:flex; align-items:center; justify-content:center; font-size:28px;">
                    🪨
                </div>
                <div class="card-content">
                    <div class="card-title">${rock.name}</div>
                    <div class="card-desc">${rock.type} • ${rock.texture || ''}</div>
                    <div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap;">
                        <span class="badge">${rock.hardness || ''}</span>
                        <span class="badge">${rock.color || ''}</span>
                    </div>
                </div>
                <div style="font-size:20px;color:var(--color-text-muted);">›</div>
            </div>
        `;
    },

    _renderTermItem(term) {
        return `
            <div class="card card-horizontal" onclick="GuideScreen.openTerm('${term.id}')">
                <div class="card-image-sm" style="background: linear-gradient(135deg, #E0E7FF, #C7D2FE); display:flex; align-items:center; justify-content:center; font-size:28px;">
                    📖
                </div>
                <div class="card-content">
                    <div class="card-title">${term.term}</div>
                    <div class="card-desc">${truncateText(term.definition || '', 80)}</div>
                    <div style="display:flex;gap:6px;margin-top:4px;">
                        <span class="badge">${term.category || ''}</span>
                    </div>
                </div>
                <div style="font-size:20px;color:var(--color-text-muted);">›</div>
            </div>
        `;
    },

    _attachEvents() {
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this._currentTab = tab.dataset.tab;
                this._searchTerm = document.getElementById('guide-search-input').value || '';
                this._updateList();
            });
        });

        const searchInput = document.getElementById('guide-search-input');
        searchInput.addEventListener('input', (e) => {
            this._searchTerm = e.target.value;
            this._updateList();
        });
    },

    _updateList() {
        const list = document.getElementById('guide-list');
        list.innerHTML = this._renderItems(this._currentTab, this._searchTerm);
    },

    openMineral(id) {
        const mineral = getMineralById(id);
        if (mineral) {
            Router.navigate('mineral', { id: mineral.id });
        }
    },

    openRock(id) {
        const rock = getRockById(id);
        if (rock) {
            const container = document.getElementById('screen-container');
            container.innerHTML = `
                <div class="screen active" id="screen-mineral">
                    <button class="btn btn-ghost btn-sm" style="margin-bottom:var(--spacing-md);" onclick="Router.navigate('guide')">
                        ← Назад
                    </button>
                    <div class="mineral-hero">
                        <div style="width:100%;aspect-ratio:16/9;background:linear-gradient(135deg,#D1D5DB,#9CA3AF);display:flex;align-items:center;justify-content:center;font-size:64px;">
                            🪨
                        </div>
                        <div class="mineral-overlay">
                            <h2>${rock.name}</h2>
                            <p>${rock.type} • ${rock.texture || ''}</p>
                        </div>
                    </div>
                    <div style="margin-bottom:var(--spacing-md);">
                        <p>${rock.description || ''}</p>
                    </div>
                    <div class="property-grid">
                        <div class="property-item"><div class="prop-label">Цвет</div><div class="prop-value">${rock.color || '—'}</div></div>
                        <div class="property-item"><div class="prop-label">Текстура</div><div class="prop-value">${rock.texture || '—'}</div></div>
                        <div class="property-item"><div class="prop-label">Состав</div><div class="prop-value">${rock.composition || '—'}</div></div>
                        <div class="property-item"><div class="prop-label">Твёрдость</div><div class="prop-value">${rock.hardness || '—'}</div></div>
                    </div>
                    ${rock.fact ? `<div class="card card-glass"><strong>✨ Интересный факт:</strong> ${rock.fact}</div>` : ''}
                </div>
            `;
        }
    },

    openTerm(id) {
        const term = getTermById(id);
        if (term) {
            const container = document.getElementById('screen-container');
            container.innerHTML = `
                <div class="screen active" id="screen-mineral">
                    <button class="btn btn-ghost btn-sm" style="margin-bottom:var(--spacing-md);" onclick="Router.navigate('guide')">
                        ← Назад
                    </button>
                    <div class="card card-glass" style="text-align:center;padding:var(--spacing-xl);">
                        <div style="font-size:48px;margin-bottom:var(--spacing-md);">📖</div>
                        <h2 style="font-size:var(--font-size-2xl);color:var(--color-primary);">${term.term}</h2>
                        <span class="badge" style="margin:var(--spacing-sm) 0;">${term.category || ''}</span>
                        <p style="font-size:var(--font-size-md);margin:var(--spacing-md) 0;">${term.definition || ''}</p>
                        ${term.example ? `<div class="card" style="background:var(--color-background);"><strong>Пример:</strong> ${term.example}</div>` : ''}
                    </div>
                </div>
            `;
        }
    },

    editMineral(id) {
        const mineral = getMineralById(id);
        if (!mineral) {
            Toast.show('Минерал не найден', 'error');
            return;
        }

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal-sheet">
                <div class="modal-handle"></div>
                <h3 style="margin-bottom:var(--spacing-md);">✏️ Редактировать минерал</h3>
                <form id="edit-mineral-form">
                    <div class="form-group">
                        <label>Название</label>
                        <input type="text" class="form-control" name="name" value="${mineral.name}" required />
                    </div>
                    <div class="form-group">
                        <label>Формула</label>
                        <input type="text" class="form-control" name="formula" value="${mineral.formula || ''}" />
                    </div>
                    <div class="form-group">
                        <label>Цвет</label>
                        <input type="text" class="form-control" name="color" value="${mineral.color || ''}" />
                    </div>
                    <div class="form-group">
                        <label>Твёрдость (1-10)</label>
                        <input type="number" class="form-control" name="hardness" value="${mineral.hardness || ''}" min="1" max="10" />
                    </div>
                    <div class="form-group">
                        <label>Блеск</label>
                        <input type="text" class="form-control" name="luster" value="${mineral.luster || ''}" />
                    </div>
                    <div class="form-group">
                        <label>Прозрачность</label>
                        <input type="text" class="form-control" name="transparency" value="${mineral.transparency || ''}" />
                    </div>
                    <div class="form-group">
                        <label>Описание</label>
                        <textarea class="form-control" name="description">${mineral.description || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Происхождение</label>
                        <input type="text" class="form-control" name="origin" value="${mineral.origin || ''}" />
                    </div>
                    <div class="form-group">
                        <label>Где встречается</label>
                        <input type="text" class="form-control" name="occurrence" value="${mineral.occurrence || ''}" />
                    </div>
                    <div class="form-group">
                        <label>Интересный факт</label>
                        <input type="text" class="form-control" name="fact" value="${mineral.fact || ''}" />
                    </div>
                    <div class="form-group">
                        <label>Изображение (эмодзи)</label>
                        <input type="text" class="form-control" name="image" value="${mineral.image || '💎'}" />
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">💾 Сохранить</button>
                        <button type="button" class="btn btn-ghost" onclick="this.closest('.modal-overlay').remove()">Отмена</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(overlay);

        overlay.querySelector('#edit-mineral-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const updated = {
                id: mineral.id,
                name: formData.get('name'),
                formula: formData.get('formula'),
                color: formData.get('color'),
                hardness: parseFloat(formData.get('hardness')) || 0,
                luster: formData.get('luster'),
                transparency: formData.get('transparency'),
                cleavage: mineral.cleavage || '',
                fracture: mineral.fracture || '',
                streak: mineral.streak || '',
                description: formData.get('description'),
                origin: formData.get('origin'),
                occurrence: formData.get('occurrence'),
                fact: formData.get('fact'),
                image: formData.get('image') || '💎',
                category: mineral.category,
                magnetic: mineral.magnetic || false,
                acidReaction: mineral.acidReaction || false,
                favorite: mineral.favorite || false
            };

            const index = MINERALS.findIndex(m => m.id === mineral.id);
            if (index !== -1) {
                MINERALS[index] = updated;
                Storage.set('geopocket_minerals_override', MINERALS);
                overlay.remove();
                Toast.show('✅ Минерал обновлён', 'success');
                this._updateList();
            }
        });
    }
};