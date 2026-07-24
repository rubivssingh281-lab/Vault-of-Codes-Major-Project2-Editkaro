        Chart.defaults.color = '#b3bcc4';
        Chart.defaults.font.family = "'IBM Plex Mono', monospace";
        Chart.defaults.font.size = 11;

        const toastEl = document.getElementById('toast');
        let toastTimer;

        function showToast(msg) {
            clearTimeout(toastTimer);
            toastEl.textContent = msg;
            toastEl.classList.add('show');
            toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1800);
        }

        function addRipple(e, el) {
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            const rect = el.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
            el.appendChild(ripple);
            ripple.addEventListener('animationend', () => ripple.remove());
        }

        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                addRipple(e, this);
            });
        });

        const brandLogo = document.getElementById('brandLogo');
        brandLogo.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            showToast('↑ Back to top');
        });
        brandLogo.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                showToast('↑ Back to top');
            }
        });

        const revealEls = document.querySelectorAll('.reveal');
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        revealEls.forEach(el => revealObserver.observe(el));

        const districts = [
            { name: "Aurangabad (Chh. Sambhajinagar)", x: 160, y: 90, r: 26, rain: -22, temp: 1.9, soil: 0.36 },
            { name: "Jalna", x: 230, y: 95, r: 20, rain: -15, temp: 1.6, soil: 0.40 },
            { name: "Beed", x: 175, y: 160, r: 24, rain: -28, temp: 2.1, soil: 0.30 },
            { name: "Latur", x: 230, y: 215, r: 22, rain: -19, temp: 1.7, soil: 0.38 },
            { name: "Osmanabad (Dharashiv)", x: 170, y: 225, r: 21, rain: -24, temp: 1.8, soil: 0.33 },
            { name: "Nanded", x: 300, y: 190, r: 23, rain: -9, temp: 1.2, soil: 0.49 },
            { name: "Parbhani", x: 280, y: 130, r: 20, rain: -12, temp: 1.4, soil: 0.45 },
            { name: "Hingoli", x: 320, y: 110, r: 17, rain: -6, temp: 1.0, soil: 0.53 },
        ];

        let currentLayer = 'rain';
        let highlightedDistrict = null;
        let legendFilterColor = null;
        const layerMeta = {
            rain: {
                label: 'Rainfall anomaly',
                unit: '%',
                key: 'rain',
                scale: v => v < -20 ? '#c96a3a' : v < -10 ? '#d9a441' : '#34d9c4',
                legend: [
                    ['< -20% (severe deficit)', '#c96a3a'],
                    ['-20% to -10% (moderate)', '#d9a441'],
                    ['> -10% (near normal)', '#34d9c4']
                ],
            },
            temp: {
                label: 'Temperature anomaly',
                unit: '°C',
                key: 'temp',
                scale: v => v > 1.8 ? '#c96a3a' : v > 1.3 ? '#d9a441' : '#34d9c4',
                legend: [
                    ['> 1.8°C (high)', '#c96a3a'],
                    ['1.3–1.8°C (elevated)', '#d9a441'],
                    ['< 1.3°C (normal)', '#34d9c4']
                ],
            },
            soil: {
                label: 'Soil moisture index',
                unit: '',
                key: 'soil',
                scale: v => v < 0.35 ? '#c96a3a' : v < 0.45 ? '#d9a441' : '#34d9c4',
                legend: [
                    ['< 0.35 (dry)', '#c96a3a'],
                    ['0.35–0.45 (low)', '#d9a441'],
                    ['> 0.45 (adequate)', '#34d9c4']
                ],
            },
        };

        const svg = document.getElementById('districtMap');

        function getDistrictColor(d) {
            return layerMeta[currentLayer].scale(d[layerMeta[currentLayer].key]);
        }

        function renderMap() {
            svg.innerHTML = '';
            const outline = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            outline.setAttribute('d', 'M60,40 L420,30 L470,160 L430,300 L300,340 L120,310 L40,180 Z');
            outline.setAttribute('fill', '#0d1419');
            outline.setAttribute('stroke', '#22303a');
            outline.setAttribute('stroke-width', '1.5');
            svg.appendChild(outline);

            const scan = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            scan.setAttribute('x1', '260');
            scan.setAttribute('y1', '190');
            scan.setAttribute('x2', '260');
            scan.setAttribute('y2', '30');
            scan.setAttribute('class', 'scan-line');
            svg.appendChild(scan);

            districts.forEach(d => {
                const meta = layerMeta[currentLayer];
                const val = d[meta.key];
                const color = meta.scale(val);
                const isHighlighted = highlightedDistrict === d.name;
                const isDimmed = legendFilterColor !== null && color !== legendFilterColor && !isHighlighted;

                const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                g.setAttribute('class', 'dist-marker' +
                    (isHighlighted ? ' dist-highlighted' : '') +
                    (isDimmed ? ' dist-dimmed' : ''));
                g.style.cursor = 'pointer';
                g.setAttribute('data-district', d.name);

                const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                c.setAttribute('class', 'ring');
                c.setAttribute('cx', d.x);
                c.setAttribute('cy', d.y);
                c.setAttribute('r', isHighlighted ? d.r + 4 : d.r);
                c.setAttribute('fill', color);
                c.setAttribute('fill-opacity', isHighlighted ? '0.55' : '0.28');
                c.setAttribute('stroke', color);
                c.setAttribute('stroke-width', isHighlighted ? '3' : '1.5');
                g.appendChild(c);

                const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                dot.setAttribute('class', 'core');
                dot.setAttribute('cx', d.x);
                dot.setAttribute('cy', d.y);
                dot.setAttribute('r', isHighlighted ? 5 : 3);
                dot.setAttribute('fill', color);
                dot.style.transformBox = 'fill-box';
                dot.style.transformOrigin = 'center';
                dot.style.animationDelay = (Math.random() * 2).toFixed(2) + 's';
                g.appendChild(dot);

                const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                label.setAttribute('x', d.x);
                label.setAttribute('y', d.y + d.r + 13);
                label.setAttribute('text-anchor', 'middle');
                label.setAttribute('font-family', "'IBM Plex Mono'");
                label.setAttribute('font-size', '9');
                label.setAttribute('fill', '#b3bcc4');
                label.textContent = d.name.split(' ')[0];
                g.appendChild(label);

                g.addEventListener('mouseenter', () => showInfo(d));
                g.addEventListener('click', (e) => {
                    e.stopPropagation();
                    handleDistrictClick(d);
                });
                svg.appendChild(g);
            });
        }

        function handleDistrictClick(d) {
            if (highlightedDistrict === d.name) {
                highlightedDistrict = null;
                updateDistrictChips(null);
                showToast('Highlight cleared');
            } else {
                highlightedDistrict = d.name;
                updateDistrictChips(d.name);
                showToast('📍 ' + d.name.split(' ')[0] + ' highlighted');
            }
            showInfo(d);
            renderMap();
        }

        function updateDistrictChips(activeName) {
            document.querySelectorAll('.district-chip').forEach(chip => {
                if (chip.dataset.district === activeName) {
                    chip.classList.add('chip-active');
                } else {
                    chip.classList.remove('chip-active');
                }
            });
        }

        function showInfo(d) {
            const meta = layerMeta[currentLayer];
            const box = document.getElementById('districtInfo');
            box.style.opacity = 0;
            box.classList.add('info-updated');
            setTimeout(() => box.classList.remove('info-updated'), 600);
            setTimeout(() => {
                box.innerHTML =
                    `<b>${d.name}</b> — ${meta.label}: <b>${d[meta.key]>0 && currentLayer!=='soil' ? '+' : ''}${d[meta.key]}${meta.unit}</b>
               &nbsp;|&nbsp; rainfall ${d.rain}% · temp +${d.temp}°C · soil moisture ${d.soil}`;
                box.style.opacity = 1;
            }, 120);
        }

        function renderLegend() {
            const meta = layerMeta[currentLayer];
            document.getElementById('legendBox').innerHTML = meta.legend.map(([label, color]) =>
                `<div class="legend-row${legendFilterColor===color?' legend-active':''}" data-legend-color="${color}" tabindex="0">
              <span class="legend-swatch" style="background:${color}"></span>${label}
            </div>`
            ).join('');

            document.querySelectorAll('.legend-row').forEach(row => {
                row.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const clickedColor = this.dataset.legendColor;
                    if (legendFilterColor === clickedColor) {
                        legendFilterColor = null;
                        showToast('Filter cleared — showing all');
                    } else {
                        legendFilterColor = clickedColor;
                        const labelText = this.textContent.trim();
                        showToast('Filter: ' + labelText);
                    }
                    renderMap();
                    renderLegend();
                });
                row.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.click();
                    }
                });
            });
        }

        document.querySelectorAll('.toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.toggle').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentLayer = btn.dataset.layer;
                legendFilterColor = null;
                highlightedDistrict = null;
                updateDistrictChips(null);
                renderMap();
                renderLegend();
                document.getElementById('districtInfo').textContent =
                    'Hover or tap a district to inspect its current fused climate state.';
                showToast('Layer: ' + layerMeta[currentLayer].label);
            });
        });

        document.getElementById('mapContainer').addEventListener('dblclick', function(e) {
            if (e.target.closest('.dist-marker')) return;
            highlightedDistrict = null;
            legendFilterColor = null;
            updateDistrictChips(null);
            renderMap();
            renderLegend();
            document.getElementById('districtInfo').textContent =
                'Hover or tap a district to inspect its current fused climate state.';
            showToast('Map reset');
        });

        document.querySelectorAll('.district-chip').forEach(chip => {
            chip.addEventListener('click', function(e) {
                e.stopPropagation();
                const distName = this.dataset.district;
                const d = districts.find(dd => dd.name === distName);
                if (d) {
                    if (highlightedDistrict === distName) {
                        highlightedDistrict = null;
                        updateDistrictChips(null);
                        showToast('Highlight cleared');
                    } else {
                        highlightedDistrict = distName;
                        updateDistrictChips(distName);
                        showToast('📍 ' + distName.split(' ')[0] + ' highlighted');
                    }
                    showInfo(d);
                    renderMap();
                }
            });
            chip.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });

        renderMap();
        renderLegend();

        document.querySelectorAll('.tele-row').forEach(row => {
            row.addEventListener('click', function() {
                this.classList.add('flash-highlight');
                setTimeout(() => this.classList.remove('flash-highlight'), 700);
                const teleType = this.dataset.tele;
                const valueEl = this.querySelector('.tele-value');
                const labelEl = this.querySelector('.tele-label');
                const valText = valueEl ? valueEl.textContent.trim() : '';
                const labelText = labelEl ? labelEl.textContent.replace(/^\s+|\s+$/g, '') : '';
                if (teleType && valText) {
                    showToast(labelText + ': ' + valText);
                }
            });
            row.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });

        document.querySelectorAll('.stage').forEach(stage => {
            stage.addEventListener('click', function() {
                document.querySelectorAll('.stage').forEach(s => s.classList.remove('stage-active'));
                this.classList.add('stage-active');
                const tag = this.querySelector('.stage-tag').textContent;
                showToast('Selected: ' + tag);
                setTimeout(() => this.classList.remove('stage-active'), 2500);
            });
        });

        document.querySelectorAll('.road-row').forEach(row => {
            row.addEventListener('click', function() {
                const wasActive = this.classList.contains('road-active');
                document.querySelectorAll('.road-row').forEach(r => r.classList.remove(
                    'road-active'));
                if (!wasActive) {
                    this.classList.add('road-active');
                    const phase = this.querySelector('.road-phase').textContent;
                    showToast('Selected: ' + phase);
                }
            });
            row.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });

        document.querySelectorAll('.status-row').forEach(row => {
            row.addEventListener('click', function() {
                const label = this.querySelector('span:first-child').textContent;
                const value = this.querySelector('span:last-child').textContent;
                showToast(label + ': ' + value);
            });
            row.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });

        document.querySelectorAll('.impact-card').forEach(card => {
            card.addEventListener('click', function() {
                const wasPinned = this.classList.contains('card-pinned');
                document.querySelectorAll('.impact-card').forEach(c => c.classList.remove(
                    'card-pinned'));
                if (!wasPinned) {
                    this.classList.add('card-pinned');
                }
                const vEl = this.querySelector('.v');
                if (vEl) {
                    vEl.classList.remove('flash');
                    void vEl.offsetWidth;
                    vEl.classList.add('flash');
                }
                const key = this.querySelector('.k').textContent;
                const val = this.querySelector('.v').textContent;
                showToast(key + ': ' + val);
            });
            card.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });

        let rainBandsVisible = true;
        let tempBandsVisible = true;
        const rainChartCard = document.getElementById('rainChartCard');
        const tempChartCard = document.getElementById('tempChartCard');

        function toggleBands(chartInstance, cardEl, visibleFlag) {
            const newVis = !visibleFlag;
            const bandDatasets = chartInstance.data.datasets.filter((ds, i) => i < 2);
            bandDatasets.forEach(ds => {
                ds.hidden = !newVis;
            });
            chartInstance.update();
            if (newVis) {
                cardEl.style.borderColor = 'var(--line)';
            } else {
                cardEl.style.borderColor = 'var(--teal-dim)';
            }
            return newVis;
        }

        const rainSlider = document.getElementById('rainSlider');
        const tempSlider = document.getElementById('tempSlider');
        const rainVal = document.getElementById('rainVal');
        const tempVal = document.getElementById('tempVal');

        const baseline = { soil: 0.41, drought: 42, water: 0 };

        let whatIfChart;
        let rainChartInst, tempChartInst;

        function initWhatIfChart() {
            const ctx = document.getElementById('whatIfChart');
            whatIfChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Soil moisture', 'Drought risk', 'Crop stress', 'Reservoir inflow'],
                    datasets: [{
                        label: 'Baseline',
                        data: [0.41, 42, 30, 0],
                        backgroundColor: '#22303a',
                    }, {
                        label: 'Scenario',
                        data: [0.41, 42, 30, 0],
                        backgroundColor: '#34d9c4',
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { labels: { color: '#b3bcc4' } } },
                    scales: {
                        x: { grid: { color: '#1a242b' } },
                        y: { grid: { color: '#1a242b' } },
                    },
                    onClick: function(e, elements) {
                        if (elements.length > 0) {
                            const idx = elements[0].index;
                            const labels = ['Soil moisture', 'Drought risk', 'Crop stress',
                                'Reservoir inflow'
                            ];
                            const vals = whatIfChart.data.datasets[1].data;
                            showToast(labels[idx] + ': ' + (typeof vals[idx] === 'number' ?
                                vals[idx].toFixed(1) : vals[idx]));
                        }
                    },
                },
            });
        }
        initWhatIfChart();

        function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

        function updateWhatIf() {
            const rain = parseFloat(rainSlider.value);
            const temp = parseFloat(tempSlider.value);
            rainVal.textContent = (rain > 0 ? '+' : '') + rain + '%';
            tempVal.textContent = (temp >= 0 ? '+' : '') + temp.toFixed(1) + '°C';

            const soil = clamp(0.41 + rain * 0.004 - temp * 0.03, 0.05, 0.85);
            const drought = clamp(42 - rain * 0.6 + temp * 8, 0, 100);
            const cropStressScore = clamp(30 - rain * 0.5 + temp * 9, 0, 100);
            const cropLabel = cropStressScore < 30 ? 'Low' : cropStressScore < 60 ? 'Moderate' : 'High';
            const water = clamp(rain * 1.3 - temp * 4, -80, 80);

            document.getElementById('impSoil').textContent = soil.toFixed(2);
            document.getElementById('impDrought').textContent = Math.round(drought);
            document.getElementById('impDrought').className = 'v ' + (drought > baseline.drought ? 'up' :
                drought < baseline.drought ? 'down' : '');
            document.getElementById('impCrop').textContent = cropLabel;
            document.getElementById('impCrop').className = 'v ' + (cropLabel === 'High' ? 'up' : cropLabel ===
                'Low' ? 'down' : '');
            document.getElementById('impWater').textContent = (water >= 0 ? '+' : '') + Math.round(water) + '%';
            document.getElementById('impWater').className = 'v ' + (water < 0 ? 'up' : 'down');

            ['impSoil', 'impDrought', 'impCrop', 'impWater'].forEach(id => {
                const el = document.getElementById(id);
                el.classList.remove('flash');
                void el.offsetWidth;
                el.classList.add('flash');
            });

            whatIfChart.data.datasets[1].data = [soil, drought, cropStressScore, water];
            whatIfChart.update();
        }
        rainSlider.addEventListener('input', updateWhatIf);
        tempSlider.addEventListener('input', updateWhatIf);
        updateWhatIf();

        document.getElementById('whatIfChartBox').addEventListener('click', function(e) {
            if (e.target.tagName === 'CANVAS') return;
            const ds = whatIfChart.data.datasets[1];
            ds.backgroundColor = ds.backgroundColor === '#34d9c4' ? '#d9a441' : '#34d9c4';
            whatIfChart.update();
            showToast('Chart highlight toggled');
        });

        function genSeries(n, base, noise, trend) {
            const obs = [],
                pred = [],
                upper = [],
                lower = [];
            for (let i = 0; i < n; i++) {
                const t = base + trend * i + (Math.sin(i / 2) * noise);
                const o = i < n * 0.55 ? +(t + (Math.random() - 0.5) * noise * 0.6).toFixed(1) : null;
                const p = +(t + (Math.random() - 0.5) * noise * 0.3).toFixed(1);
                obs.push(o);
                pred.push(p);
                upper.push(+(p + noise * 0.5).toFixed(1));
                lower.push(+(p - noise * 0.5).toFixed(1));
            }
            return { obs, pred, upper, lower };
        }

        const days = Array.from({ length: 14 }, (_, i) => 'D' + (i + 1));
        const rainData = genSeries(14, 6, 4, -0.15);
        const tempData = genSeries(14, 31, 1.4, 0.08);

        function buildForecastChart(canvasId, series, color, unit) {
            const ctx = document.getElementById(canvasId);
            const chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: days,
                    datasets: [
                        { label: 'Upper band', data: series.upper, borderWidth: 0, pointRadius: 0, fill: '+1',
                            backgroundColor: color + '22', order: 3 },
                        { label: 'Lower band', data: series.lower, borderWidth: 0, pointRadius: 0, fill: false,
                            backgroundColor: color + '22', order: 3 },
                        { label: 'Predicted', data: series.pred, borderColor: color, backgroundColor: color,
                            borderDash: [4, 3], pointRadius: 2, tension: 0.35, order: 1 },
                        { label: 'Observed', data: series.obs, borderColor: '#e9e4d8',
                            backgroundColor: '#e9e4d8', pointRadius: 3, tension: 0.35, order: 0 },
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: {
                                filter: (item) => item.text === 'Predicted' || item.text === 'Observed',
                                color: '#b3bcc4'
                            }
                        }
                    },
                    scales: {
                        x: { grid: { color: '#1a242b' } },
                        y: { grid: { color: '#1a242b' }, title: { display: true, text: unit, color: '#b3bcc4' } },
                    },
                },
            });
            return chart;
        }
        rainChartInst = buildForecastChart('rainChart', rainData, '#34d9c4', 'mm/day');
        tempChartInst = buildForecastChart('tempChart', tempData, '#c96a3a', '°C');

        rainChartCard.addEventListener('click', function(e) {
            if (e.target.tagName === 'CANVAS') return;
            rainBandsVisible = toggleBands(rainChartInst, rainChartCard, rainBandsVisible);
            showToast(rainBandsVisible ? 'Bands shown' : 'Bands hidden');
        });
        rainChartCard.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                rainChartCard.click();
            }
        });

        tempChartCard.addEventListener('click', function(e) {
            if (e.target.tagName === 'CANVAS') return;
            tempBandsVisible = toggleBands(tempChartInst, tempChartCard, tempBandsVisible);
            showToast(tempBandsVisible ? 'Bands shown' : 'Bands hidden');
        });
        tempChartCard.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                tempChartCard.click();
            }
        });
