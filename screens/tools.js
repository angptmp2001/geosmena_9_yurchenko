const ToolsScreen = {
    render() {
        const container = document.getElementById('screen-container');

        container.innerHTML = `
            <div class="screen active" id="screen-tools">
                <h2 style="margin-bottom:var(--spacing-md);">🧭 Инструменты</h2>

                <div class="tools-grid">
                    <div class="tool-card" onclick="ToolsScreen.openIdentifier()">
                        <div class="tool-icon">🔍</div>
                        <div class="tool-name">Определитель минералов</div>
                        <div class="tool-desc">Определи по свойствам</div>
                    </div>
                    <div class="tool-card" onclick="ToolsScreen.openMohs()">
                        <div class="tool-icon">📏</div>
                        <div class="tool-name">Шкала Мооса</div>
                        <div class="tool-desc">Твёрдость минералов</div>
                    </div>
                    <div class="tool-card" onclick="ToolsScreen.openCompass()">
                        <div class="tool-icon">🧭</div>
                        <div class="tool-name">Компас</div>
                        <div class="tool-desc">Определение сторон света</div>
                    </div>
                    <div class="tool-card" onclick="ToolsScreen.openFlashlight()">
                        <div class="tool-icon">🔦</div>
                        <div class="tool-name">Фонарик</div>
                        <div class="tool-desc">Освещение в полевых условиях</div>
                    </div>
                    <div class="tool-card" onclick="ToolsScreen.openMagnifier()">
                        <div class="tool-icon">🔬</div>
                        <div class="tool-name">Лупа</div>
                        <div class="tool-desc">Увеличение для деталей</div>
                    </div>
                    <div class="tool-card" onclick="ToolsScreen.openCoordConverter()">
                        <div class="tool-icon">🌍</div>
                        <div class="tool-name">Конвертер координат</div>
                        <div class="tool-desc">Преобразование форматов</div>
                    </div>
                </div>

                <div id="tool-content" style="margin-top:var(--spacing-lg);"></div>
            </div>
        `;
    },

    openIdentifier() {
        const container = document.getElementById('tool-content');
        if (!container) return;

        const steps = [
            { id: 'color', label: 'Какой цвет?', options: ['Белый', 'Розовый', 'Красный', 'Жёлтый', 'Зелёный', 'Синий', 'Фиолетовый', 'Чёрный', 'Серый', 'Бесцветный'] },
            { id: 'luster', label: 'Какой блеск?', options: ['Стеклянный', 'Металлический', 'Перламутровый', 'Шелковистый', 'Смоляной', 'Жирный'] },
            { id: 'transparency', label: 'Прозрачность?', options: ['Прозрачный', 'Полупрозрачный', 'Непрозрачный'] },
            { id: 'hardness', label: 'Твёрдость (по Моосу)?', options: ['1-2', '3-4', '5-6', '7-8', '9-10'] },
            { id: 'magnetic', label: 'Магнитится?', options: ['Да', 'Нет'] },
            { id: 'acid', label: 'Реакция на кислоту?', options: ['Бурная', 'Слабая', 'Нет'] }
        ];

        let currentStep = 0;
        const answers = {};

        container.innerHTML = `
            <div class="card card-glass" id="identifier-wizard">
                <div class="wizard-progress" id="wizard-progress">
                    ${steps.map((s, i) => `<div class="step-dot ${i === 0 ? 'active' : ''}" data-step="${i}"></div>`).join('')}
                </div>
                <div id="wizard-step-container">
                    ${steps.map((s, i) => `
                        <div class="wizard-step ${i === 0 ? 'active' : ''}" data-step="${i}">
                            <h3 style="margin-bottom:var(--spacing-md);">${s.label}</h3>
                            <div class="chip-group">
                                ${s.options.map(opt => `
                                    <button class="chip" data-value="${opt}" onclick="ToolsScreen._wizardSelect('${s.id}', '${opt}', ${i})">${opt}</button>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                    <div class="wizard-step" data-step="${steps.length}">
                        <div class="wizard-result" id="wizard-result">
                            <div style="font-size:48px;margin-bottom:var(--spacing-md);">🔍</div>
                            <h3>Результат определения</h3>
                            <div id="wizard-result-content" style="margin:var(--spacing-md) 0;">
                                <p style="color:var(--color-text-muted);">Выберите свойства минерала</p>
                            </div>
                            <button class="btn btn-primary" onclick="ToolsScreen._wizardReset()">🔄 Начать заново</button>
                        </div>
                    </div>
                </div>
                <div style="display:flex;justify-content:space-between;margin-top:var(--spacing-lg);">
                    <button class="btn btn-sm btn-ghost" onclick="ToolsScreen._wizardPrev()" id="wizard-prev">← Назад</button>
                    <span id="wizard-step-counter" style="color:var(--color-text-muted);font-size:var(--font-size-sm);">Шаг 1 из ${steps.length}</span>
                    <button class="btn btn-sm btn-primary" onclick="ToolsScreen._wizardNext()" id="wizard-next">Далее →</button>
                </div>
            </div>
        `;

        this._wizardState = { steps, currentStep: 0, answers: {} };
        this._updateWizardUI();
    },

    _wizardSelect(stepId, value, stepIndex) {
        this._wizardState.answers[stepId] = value;
        const dots = document.querySelectorAll('.wizard-progress .step-dot');
        if (dots[stepIndex]) dots[stepIndex].classList.add('done');
        setTimeout(() => {
            if (stepIndex < this._wizardState.steps.length - 1) {
                this._wizardState.currentStep = stepIndex + 1;
                this._updateWizardUI();
            } else {
                this._wizardState.currentStep = this._wizardState.steps.length;
                this._updateWizardUI();
                this._calculateResult();
            }
        }, 400);
    },

    _wizardNext() {
        const total = this._wizardState.steps.length;
        if (this._wizardState.currentStep < total) {
            this._wizardState.currentStep++;
            this._updateWizardUI();
        }
        if (this._wizardState.currentStep === total) {
            this._calculateResult();
        }
    },

    _wizardPrev() {
        if (this._wizardState.currentStep > 0) {
            this._wizardState.currentStep--;
            this._updateWizardUI();
        }
    },

    _wizardReset() {
        this._wizardState.currentStep = 0;
        this._wizardState.answers = {};
        const dots = document.querySelectorAll('.wizard-progress .step-dot');
        dots.forEach(d => d.classList.remove('done', 'active'));
        if (dots[0]) dots[0].classList.add('active');
        this._updateWizardUI();
        const resultContent = document.getElementById('wizard-result-content');
        if (resultContent) {
            resultContent.innerHTML = '<p style="color:var(--color-text-muted);">Выберите свойства минерала</p>';
        }
    },

    _updateWizardUI() {
        const steps = document.querySelectorAll('.wizard-step');
        const dots = document.querySelectorAll('.wizard-progress .step-dot');
        const current = this._wizardState.currentStep;
        const total = this._wizardState.steps.length;

        steps.forEach((step, i) => step.classList.toggle('active', i === current));
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === current);
            if (i < current) dot.classList.add('done');
            else dot.classList.remove('done');
        });

        const counter = document.getElementById('wizard-step-counter');
        if (counter) {
            counter.textContent = current < total ? `Шаг ${current + 1} из ${total}` : 'Результат';
        }

        const prevBtn = document.getElementById('wizard-prev');
        if (prevBtn) prevBtn.style.display = current === 0 ? 'none' : 'inline-flex';

        const nextBtn = document.getElementById('wizard-next');
        if (nextBtn) {
            if (current >= total) {
                nextBtn.style.display = 'none';
            } else {
                nextBtn.style.display = 'inline-flex';
                nextBtn.textContent = current === total - 1 ? '🔍 Определить' : 'Далее →';
            }
        }
    },

    _calculateResult() {
        const answers = this._wizardState.answers;
        const resultContent = document.getElementById('wizard-result-content');
        if (!resultContent) return;

        let bestMatch = null;
        let bestScore = 0;

        for (const mineral of MINERALS) {
            let score = 0;
            if (answers.color) {
                const colorLower = answers.color.toLowerCase();
                const mineralColor = mineral.color.toLowerCase();
                if (mineralColor.includes(colorLower)) score += 20;
                if (mineralColor.split(',').some(c => c.trim().toLowerCase() === colorLower)) score += 30;
            }
            if (answers.luster && mineral.luster) {
                if (mineral.luster.toLowerCase().includes(answers.luster.toLowerCase())) score += 20;
            }
            if (answers.transparency && mineral.transparency) {
                if (mineral.transparency.toLowerCase().includes(answers.transparency.toLowerCase())) score += 15;
            }
            if (answers.hardness && mineral.hardness) {
                const hRange = answers.hardness.split('-').map(Number);
                if (hRange.length === 2) {
                    if (mineral.hardness >= hRange[0] && mineral.hardness <= hRange[1]) score += 20;
                } else if (mineral.hardness === hRange[0]) score += 15;
            }
            if (answers.magnetic !== undefined) {
                const isMag = answers.magnetic === 'Да';
                if (mineral.magnetic === isMag) score += 10;
            }
            if (answers.acid !== undefined) {
                const hasAcid = answers.acid !== 'Нет';
                if (mineral.acidReaction === hasAcid) score += 10;
            }

            if (score > bestScore) {
                bestScore = score;
                bestMatch = mineral;
            }
        }

        if (bestMatch && bestScore > 20) {
            const confidence = Math.min(Math.round((bestScore / 100) * 100), 95);
            resultContent.innerHTML = `
                <div style="font-size:32px;margin:var(--spacing-md) 0;">💎</div>
                <h3 style="color:var(--color-primary);font-size:var(--font-size-xl);">${bestMatch.name}</h3>
                <p style="color:var(--color-text-secondary);">${bestMatch.formula || ''}</p>
                <div style="display:flex;gap:var(--spacing-sm);justify-content:center;flex-wrap:wrap;margin:var(--spacing-md) 0;">
                    <span class="badge badge-primary">Тв. ${bestMatch.hardness}</span>
                    <span class="badge">${bestMatch.luster || ''}</span>
                    <span class="badge">${bestMatch.color || ''}</span>
                </div>
                <p style="font-size:var(--font-size-sm);color:var(--color-text-muted);">${bestMatch.description || ''}</p>
                <div style="margin-top:var(--spacing-md);">
                    <span class="badge">Точность: ${confidence}%</span>
                </div>
                <div style="margin-top:var(--spacing-md);display:flex;gap:var(--spacing-sm);justify-content:center;">
                    <button class="btn btn-sm btn-primary" onclick="Router.navigate('mineral', {id:'${bestMatch.id}'})">📖 Подробнее</button>
                    <button class="btn btn-sm btn-secondary" onclick="MineralScreen.addToDiary('${bestMatch.id}')">📝 В дневник</button>
                </div>
            `;
        } else {
            resultContent.innerHTML = `
                <div style="font-size:48px;margin:var(--spacing-md) 0;">🤔</div>
                <p style="color:var(--color-text-secondary);">Не удалось определить минерал по выбранным свойствам.</p>
                <p style="font-size:var(--font-size-sm);color:var(--color-text-muted);">Попробуйте уточнить свойства или обратитесь к справочнику.</p>
                <button class="btn btn-sm btn-ghost" style="margin-top:var(--spacing-md);" onclick="ToolsScreen._wizardReset()">🔄 Попробовать снова</button>
            `;
        }
    },

    openMohs() {
        const container = document.getElementById('tool-content');
        if (!container) return;

        const scale = [
            { num: 1, name: 'Тальк', desc: 'Мягкий, жирный на ощупь' },
            { num: 2, name: 'Гипс', desc: 'Царапается ногтем' },
            { num: 3, name: 'Кальцит', desc: 'Царапается медной монетой' },
            { num: 4, name: 'Флюорит', desc: 'Царапается ножом' },
            { num: 5, name: 'Апатит', desc: 'Царапается стеклом' },
            { num: 6, name: 'Полевой шпат', desc: 'Царапает стекло' },
            { num: 7, name: 'Кварц', desc: 'Царапает сталь' },
            { num: 8, name: 'Топаз', desc: 'Царапает кварц' },
            { num: 9, name: 'Корунд', desc: 'Царапает топаз' },
            { num: 10, name: 'Алмаз', desc: 'Самый твёрдый минерал' }
        ];

        container.innerHTML = `
            <div class="card card-glass">
                <h3>📏 Шкала Мооса</h3>
                <p style="font-size:var(--font-size-sm);color:var(--color-text-muted);margin-bottom:var(--spacing-md);">
                    Определение твёрдости по способности царапать другие минералы
                </p>
                ${scale.map(item => `
                    <div style="display:flex;align-items:center;gap:var(--spacing-md);padding:var(--spacing-sm) 0;border-bottom:1px solid var(--color-border);">
                        <span style="font-weight:800;font-size:var(--font-size-xl);color:var(--color-primary);min-width:32px;">${item.num}</span>
                        <div>
                            <div style="font-weight:600;">${item.name}</div>
                            <div style="font-size:var(--font-size-xs);color:var(--color-text-muted);">${item.desc}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    openCompass() {
        const container = document.getElementById('tool-content');
        if (!container) return;

        container.innerHTML = `
            <div class="card card-glass" style="text-align:center;">
                <div style="font-size:64px;margin:var(--spacing-md) 0;">🧭</div>
                <h3>Компас</h3>
                <p style="color:var(--color-text-muted);font-size:var(--font-size-sm);">
                    Используйте встроенный компас устройства
                </p>
                <div id="compass-data" style="margin:var(--spacing-md) 0;padding:var(--spacing-md);background:var(--color-background);border-radius:var(--radius-small);">
                    <p style="font-size:var(--font-size-sm);">⏳ Ожидание данных...</p>
                </div>
                <button class="btn btn-primary" onclick="ToolsScreen._startCompass()">🔄 Обновить</button>
            </div>
        `;

        this._startCompass();
    },

    _startCompass() {
        const dataEl = document.getElementById('compass-data');
        if (!dataEl) return;

        if (!window.DeviceOrientationEvent) {
            dataEl.innerHTML = '<p style="color:var(--color-error);">Компас не поддерживается</p>';
            return;
        }

        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(state => {
                    if (state === 'granted') {
                        this._startCompassListener(dataEl);
                    } else {
                        dataEl.innerHTML = '<p style="color:var(--color-warning);">Разрешение на компас не получено</p>';
                    }
                })
                .catch(() => {
                    dataEl.innerHTML = '<p style="color:var(--color-error);">Ошибка запроса разрешения</p>';
                });
        } else {
            this._startCompassListener(dataEl);
        }
    },

    _startCompassListener(dataEl) {
        let firstReading = true;
        const handler = (event) => {
            let heading = event.webkitCompassHeading || event.alpha;
            if (heading !== null && heading !== undefined) {
                const dirs = ['С', 'СВ', 'В', 'ЮВ', 'Ю', 'ЮЗ', 'З', 'СЗ'];
                const index = Math.round(heading / 45) % 8;
                dataEl.innerHTML = `
                    <div style="font-size:48px;margin-bottom:var(--spacing-sm);">🧭</div>
                    <div style="font-size:var(--font-size-2xl);font-weight:800;color:var(--color-primary);">${Math.round(heading)}°</div>
                    <div style="font-size:var(--font-size-xl);">${dirs[index]}</div>
                `;
                if (firstReading) firstReading = false;
            }
        };
        window.addEventListener('deviceorientation', handler);
        window._compassHandler = handler;

        setTimeout(() => {
            if (dataEl.innerHTML.includes('⏳') || dataEl.innerHTML.includes('Ожидание')) {
                dataEl.innerHTML = '<p style="color:var(--color-warning);">Данные компаса не получены. Попробуйте обновить страницу.</p>';
            }
        }, 4000);
    },

    openFlashlight() {
        const container = document.getElementById('tool-content');
        if (!container) return;

        let isOn = false;

        container.innerHTML = `
            <div class="card card-glass" style="text-align:center;">
                <div style="font-size:64px;margin:var(--spacing-md) 0;" id="flashlight-icon">🔦</div>
                <h3>Фонарик</h3>
                <p style="color:var(--color-text-muted);font-size:var(--font-size-sm);">
                    Используйте светодиод устройства
                </p>
                <div style="margin:var(--spacing-lg) 0;">
                    <button class="btn btn-lg btn-primary" id="flashlight-toggle" style="width:120px;height:120px;border-radius:50%;font-size:32px;">
                        🔦
                    </button>
                </div>
                <p style="font-size:var(--font-size-sm);color:var(--color-text-muted);" id="flashlight-status">Выключен</p>
            </div>
        `;

        const toggleBtn = document.getElementById('flashlight-toggle');
        const statusEl = document.getElementById('flashlight-status');

        toggleBtn.addEventListener('click', () => {
            isOn = !isOn;
            if (isOn) {
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
                        .then(stream => {
                            const track = stream.getVideoTracks()[0];
                            if (track) {
                                const capabilities = track.getCapabilities();
                                if (capabilities.torch) {
                                    track.applyConstraints({ advanced: [{ torch: true }] });
                                    toggleBtn.textContent = '🔦';
                                    toggleBtn.style.background = 'var(--color-secondary)';
                                    statusEl.textContent = 'Включен';
                                } else {
                                    Toast.show('Фонарик не поддерживается', 'warning');
                                    isOn = false;
                                }
                            }
                            window._flashlightStream = stream;
                        })
                        .catch(() => {
                            Toast.show('Нет доступа к камере', 'error');
                            isOn = false;
                        });
                } else {
                    Toast.show('Фонарик не поддерживается', 'warning');
                    isOn = false;
                }
            } else {
                if (window._flashlightStream) {
                    window._flashlightStream.getTracks().forEach(t => t.stop());
                    window._flashlightStream = null;
                }
                toggleBtn.textContent = '🔦';
                toggleBtn.style.background = 'var(--color-primary)';
                statusEl.textContent = 'Выключен';
            }
        });
    },

    openMagnifier() {
        const container = document.getElementById('tool-content');
        if (!container) return;

        container.innerHTML = `
            <div class="card card-glass" style="text-align:center;">
                <div style="font-size:64px;margin:var(--spacing-md) 0;">🔬</div>
                <h3>Лупа</h3>
                <p style="color:var(--color-text-muted);font-size:var(--font-size-sm);">
                    Увеличение с помощью камеры
                </p>
                <div style="margin:var(--spacing-md) 0;position:relative;overflow:hidden;border-radius:var(--radius-small);background:var(--color-background);">
                    <video id="magnifier-video" autoplay playsinline style="width:100%;height:auto;max-height:400px;object-fit:cover;"></video>
                    <div id="magnifier-overlay" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:48px;opacity:0.3;pointer-events:none;">
                        🔍
                    </div>
                </div>
                <button class="btn btn-primary" id="magnifier-toggle">📷 Включить камеру</button>
                <p style="font-size:var(--font-size-xs);color:var(--color-text-muted);margin-top:var(--spacing-sm);">
                    Поднесите объект к камере для увеличения
                </p>
            </div>
        `;

        let stream = null;
        const video = document.getElementById('magnifier-video');
        const toggleBtn = document.getElementById('magnifier-toggle');

        toggleBtn.addEventListener('click', () => {
            if (stream) {
                stream.getTracks().forEach(t => t.stop());
                stream = null;
                video.srcObject = null;
                toggleBtn.textContent = '📷 Включить камеру';
                toggleBtn.style.background = 'var(--color-primary)';
                return;
            }

            navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
            }).then(s => {
                stream = s;
                video.srcObject = stream;
                toggleBtn.textContent = '⏹️ Выключить';
                toggleBtn.style.background = 'var(--color-error)';
            }).catch(() => {
                Toast.show('Нет доступа к камере', 'error');
            });
        });
    },

    openCoordConverter() {
        const container = document.getElementById('tool-content');
        if (!container) return;

        container.innerHTML = `
            <div class="card card-glass">
                <h3>🌍 Конвертер координат</h3>
                <p style="font-size:var(--font-size-sm);color:var(--color-text-muted);margin-bottom:var(--spacing-md);">
                    Преобразование между десятичными градусами и градусами/минутами/секундами
                </p>

                <div class="form-group">
                    <label>Десятичные градусы (например: 55.751244)</label>
                    <input type="text" class="form-control" id="coord-decimal" placeholder="55.751244" />
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:var(--spacing-sm);">
                    <div class="form-group">
                        <label>Градусы</label>
                        <input type="number" class="form-control" id="coord-deg" placeholder="55" />
                    </div>
                    <div class="form-group">
                        <label>Минуты</label>
                        <input type="number" class="form-control" id="coord-min" placeholder="45" />
                    </div>
                    <div class="form-group">
                        <label>Секунды</label>
                        <input type="number" class="form-control" id="coord-sec" placeholder="4" />
                    </div>
                </div>

                <div style="display:flex;gap:var(--spacing-sm);margin-top:var(--spacing-md);">
                    <button class="btn btn-primary" onclick="ToolsScreen._convertCoord()">🔄 Конвертировать</button>
                    <button class="btn btn-ghost" onclick="ToolsScreen._getCoordFromGPS()">📍 Из GPS</button>
                </div>

                <div id="coord-result" style="margin-top:var(--spacing-md);padding:var(--spacing-md);background:var(--color-background);border-radius:var(--radius-small);display:none;"></div>
            </div>
        `;
    },

    _convertCoord() {
        const decimalInput = document.getElementById('coord-decimal');
        const degInput = document.getElementById('coord-deg');
        const minInput = document.getElementById('coord-min');
        const secInput = document.getElementById('coord-sec');
        const resultEl = document.getElementById('coord-result');

        const decimal = parseFloat(decimalInput.value);
        const deg = parseInt(degInput.value);
        const min = parseInt(minInput.value);
        const sec = parseFloat(secInput.value);

        if (!isNaN(decimal)) {
            const d = Math.floor(Math.abs(decimal));
            const m = Math.floor((Math.abs(decimal) - d) * 60);
            const s = ((Math.abs(decimal) - d - m / 60) * 3600);
            const sign = decimal < 0 ? '-' : '';
            resultEl.style.display = 'block';
            resultEl.innerHTML = `
                <strong>Десятичные → DMS:</strong><br />
                ${sign}${d}° ${m}' ${s.toFixed(2)}"<br />
                <span style="font-size:var(--font-size-xs);color:var(--color-text-muted);">(${sign}${d}° ${m}′ ${s.toFixed(2)}″)</span>
            `;
            degInput.value = d;
            minInput.value = m;
            secInput.value = s.toFixed(2);
            return;
        }

        if (!isNaN(deg) && !isNaN(min) && !isNaN(sec)) {
            const decimalVal = deg + min / 60 + sec / 3600;
            resultEl.style.display = 'block';
            resultEl.innerHTML = `
                <strong>DMS → Десятичные:</strong><br />
                ${decimalVal.toFixed(6)}°<br />
                <span style="font-size:var(--font-size-xs);color:var(--color-text-muted);">(${deg}° ${min}′ ${sec}″ → ${decimalVal.toFixed(6)})</span>
            `;
            decimalInput.value = decimalVal.toFixed(6);
            return;
        }

        Toast.show('Введите корректные координаты', 'warning');
    },

    _getCoordFromGPS() {
        Toast.show('⏳ Определение местоположения...', 'info');
        getGeoPosition().then(pos => {
            const decimalInput = document.getElementById('coord-decimal');
            if (decimalInput) {
                decimalInput.value = pos.lat.toFixed(6);
                this._convertCoord();
            }
            Toast.show('📍 Координаты получены', 'success');
        }).catch(() => {
            Toast.show('Не удалось определить местоположение', 'error');
        });
    }
};