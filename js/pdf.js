const PDFExporter = {
    async exportDiary(entries) {
        try {
            await this._loadPdfMake();

            const docDefinition = {
                content: [],
                defaultStyle: {
                    font: 'Roboto',
                    fontSize: 10
                },
                styles: {
                    header: { fontSize: 22, bold: true, color: '#3B82F6', alignment: 'center' },
                    subheader: { fontSize: 12, color: '#64748B', alignment: 'center' },
                    date: { fontSize: 10, color: '#94A3B8', alignment: 'center', margin: [0, 0, 0, 10] },
                    entryTitle: { fontSize: 14, bold: true, margin: [0, 4, 0, 2] },
                    entryMeta: { fontSize: 9, color: '#94A3B8' },
                    entryDesc: { fontSize: 10, margin: [0, 2, 0, 4] },
                    entryPlace: { fontSize: 9, color: '#94A3B8', margin: [0, 2, 0, 0] },
                    separator: { margin: [0, 6, 0, 6] }
                }
            };

            // Заголовок
            docDefinition.content.push(
                { text: 'GeoPocket', style: 'header' },
                { text: 'Карманный геолог — Дневник находок', style: 'subheader' },
                { text: `Экспорт: ${new Date().toLocaleDateString('ru-RU')}`, style: 'date' },
                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, color: '#E2E8F0' }] }
            );

            if (!entries || entries.length === 0) {
                docDefinition.content.push({ text: 'Нет записей в дневнике', alignment: 'center', margin: [0, 40, 0, 0] });
            } else {
                for (const entry of entries) {
                    const title = entry.mineralName || 'Находка';
                    const dateTime = formatDateTime(entry.date || Date.now());
                    const gps = (entry.lat && entry.lng) ? `📍 ${entry.lat.toFixed(5)}, ${entry.lng.toFixed(5)}` : '';
                    const desc = entry.description || '';
                    const place = entry.place ? `📍 ${entry.place}` : '';

                    const card = {
                        margin: [0, 6, 0, 6],
                        table: {
                            widths: ['*'],
                            body: [
                                [
                                    {
                                        text: title,
                                        style: 'entryTitle'
                                    }
                                ],
                                [
                                    {
                                        stack: [
                                            { text: dateTime, style: 'entryMeta' },
                                            gps ? { text: gps, style: 'entryMeta' } : null,
                                            desc ? { text: desc, style: 'entryDesc' } : null,
                                            place ? { text: place, style: 'entryPlace' } : null
                                        ].filter(Boolean)
                                    }
                                ]
                            ]
                        },
                        layout: {
                            fillColor: '#F8FAFC',
                            hLineWidth: () => 0,
                            vLineWidth: () => 0,
                            paddingLeft: 4,
                            paddingRight: 4,
                            paddingTop: 4,
                            paddingBottom: 4
                        }
                    };
                    docDefinition.content.push(card);
                    docDefinition.content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, color: '#E2E8F0' }] });
                }
            }

            docDefinition.content.push({ text: 'Создано в GeoPocket — Карманный геолог', alignment: 'center', margin: [0, 20, 0, 0], fontSize: 8, color: '#94A3B8' });

            // Генерируем PDF
            const pdfDoc = pdfMake.createPdf(docDefinition);

            // Получаем Blob и скачиваем вручную (надёжнее, чем .download())
            const blob = await new Promise((resolve, reject) => {
                pdfDoc.getBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error('Не удалось создать PDF'));
                });
            });

            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'geopocket_diary_export.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(link.href), 5000);

            return true;
        } catch (error) {
            Toast.show('❌ Ошибка при создании PDF: ' + error.message, 'error');
            return false;
        }
    },

    async _loadPdfMake() {
        return new Promise((resolve, reject) => {
            if (typeof window.pdfMake !== 'undefined') {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js';
            script.onload = () => {
                const fontScript = document.createElement('script');
                fontScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.js';
                fontScript.onload = () => resolve();
                fontScript.onerror = () => reject(new Error('Не удалось загрузить шрифты pdfmake'));
                document.head.appendChild(fontScript);
            };
            script.onerror = () => reject(new Error('Не удалось загрузить pdfmake'));
            document.head.appendChild(script);
        });
    },

    exportSingleEntry(entry) {
        const entries = [entry];
        return this.exportDiary(entries);
    }
};