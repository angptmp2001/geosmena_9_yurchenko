/* ============================================
   screens/mineral.js
   ============================================ */
const MineralScreen = {
    render(data) {
        const mineral = data && data.id ? getMineralById(data.id) : null;
        if (!mineral) {
            Router.navigate('guide');
            return;
        }

        const isFav = isFavorite(mineral.id);
        const container = document.getElementById('screen-container');

        container.innerHTML = `
            <div class="screen active" id="screen-mineral">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--spacing-md);">
                    <button class="btn btn-ghost btn-sm" onclick="Router.navigate('guide')">← Назад</button>
                    <div style="display:flex;gap:var(--spacing-sm);">
                        <button class="btn-icon" onclick="MineralScreen.toggleFavorite('${mineral.id}')" title="Избранное">
                            ${isFav ? '⭐' : '☆'}
                        </button>
                        <button class="btn-icon" onclick="MineralScreen.addToDiary('${mineral.id}')" title="Добавить в дневник">📝</button>
                    </div>
                </div>

                <div class="mineral-hero">
                    <div style="width:100%;aspect-ratio:16/9;background:linear-gradient(135deg,#E2E8F0,#CBD5E1);display:flex;align-items:center;justify-content:center;font-size:64px;">
                        💎
                    </div>
                    <div class="mineral-overlay">
                        <h2>${mineral.name}</h2>
                        <p>${mineral.formula || ''} • Тв. ${mineral.hardness}</p>
                    </div>
                </div>

                <div style="margin-bottom:var(--spacing-md);">
                    <p>${mineral.description || 'Нет описания'}</p>
                </div>

                <div class="property-grid">
                    <div class="property-item"><div class="prop-label">Цвет</div><div class="prop-value">${mineral.color || '—'}</div></div>
                    <div class="property-item"><div class="prop-label">Блеск</div><div class="prop-value">${mineral.luster || '—'}</div></div>
                    <div class="property-item"><div class="prop-label">Прозрачность</div><div class="prop-value">${mineral.transparency || '—'}</div></div>
                    <div class="property-item"><div class="prop-label">Спайность</div><div class="prop-value">${mineral.cleavage || '—'}</div></div>
                    <div class="property-item"><div class="prop-label">Излом</div><div class="prop-value">${mineral.fracture || '—'}</div></div>
                    <div class="property-item"><div class="prop-label">Цвет черты</div><div class="prop-value">${mineral.streak || '—'}</div></div>
                    <div class="property-item"><div class="prop-label">Магнитится</div><div class="prop-value">${mineral.magnetic ? '✅ Да' : '❌ Нет'}</div></div>
                    <div class="property-item"><div class="prop-label">Реакция на кислоту</div><div class="prop-value">${mineral.acidReaction ? '✅ Да' : '❌ Нет'}</div></div>
                </div>

                ${mineral.origin ? `
                    <div class="card card-glass">
                        <strong>🏔️ Происхождение:</strong> ${mineral.origin}
                    </div>
                ` : ''}

                ${mineral.occurrence ? `
                    <div class="card card-glass">
                        <strong>📍 Где встречается:</strong> ${mineral.occurrence}
                    </div>
                ` : ''}

                ${mineral.fact ? `
                    <div class="card" style="background:rgba(59,130,246,0.06);border-color:var(--color-primary);">
                        <strong>✨ Интересный факт:</strong> ${mineral.fact}
                    </div>
                ` : ''}

                <div style="display:flex;gap:var(--spacing-sm);margin-top:var(--spacing-md);flex-wrap:wrap;">
                    <button class="btn btn-primary" onclick="MineralScreen.addToDiary('${mineral.id}')">📝 В дневник</button>
                    <button class="btn btn-outline" onclick="MineralScreen.toggleFavorite('${mineral.id}')">
                        ${isFav ? '⭐ В избранном' : '☆ В избранное'}
                    </button>
                    <button class="btn btn-ghost" onclick="MineralScreen.shareMineral('${mineral.id}')">📤 Поделиться</button>
                </div>
            </div>
        `;
    },

    toggleFavorite(id) {
        toggleFavorite(id);
        const mineral = getMineralById(id);
        if (mineral) {
            this.render({ id: mineral.id });
            Toast.show('⭐ Избранное обновлено', 'success');
        }
    },

    addToDiary(id) {
        const mineral = getMineralById(id);
        if (mineral) {
            Router.navigate('diary');
            setTimeout(() => {
                DiaryScreen.triggerAdd({ mineralName: mineral.name });
            }, 350);
        }
    },

    shareMineral(id) {
        const mineral = getMineralById(id);
        if (!mineral) return;

        const text = `💎 ${mineral.name}\nФормула: ${mineral.formula || '—'}\nТвёрдость: ${mineral.hardness}\n${mineral.description || ''}\n\n— GeoPocket, Карманный геолог`;

        if (navigator.share) {
            navigator.share({
                title: mineral.name,
                text: text
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(text).then(() => {
                Toast.show('📋 Скопировано в буфер обмена', 'info');
            }).catch(() => {
                Toast.show('Не удалось поделиться', 'error');
            });
        }
    }
};