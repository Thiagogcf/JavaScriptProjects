document.getElementById('addSineWave').addEventListener('click', addSineWave);
document.getElementById('toggleNightMode').addEventListener('click', () => {
    document.body.classList.toggle('night-mode');
});
document.body.classList.toggle('night-mode');
const sineWavesContainer = document.getElementById('sineWavesContainer');
const svgResultant = document.getElementById('resultantSinewave');
let nightMode = false;

function toggleNightMode() {
    nightMode = !nightMode;
    document.body.classList.toggle('night-mode');
}

function addSineWave() {
    const waveContainer = document.createElement('div');
    waveContainer.classList.add('wave-container');
    waveContainer.innerHTML = `
        <svg width="800" height="100"></svg>
        <div class="sliders">
            <input type="range" class="amplitude" min="1" max="100" value="50">
            <input type="number" class="amplitude-value" min="1" max="100" value="50" size="6">
            <button class="auto-slide" data-type="amplitude">Auto-Slide Amp</button>
            <input type="range" class="frequency" min="1" max="50" value="5">
            <input type="number" class="frequency-value" min="1" max="50" value="5" size="6">
            <button class="auto-slide" data-type="frequency">Auto-Slide Freq</button>
            <input type="range" class="phase" min="0" max="360" value="0">
            <input type="number" class="phase-value" min="0" max="360" value="0" size="6">
            <button class="auto-slide" data-type="phase">Auto-Slide Phase</button>
        </div>
    `;
    sineWavesContainer.appendChild(waveContainer);
    setupControls(waveContainer);
    updateWaves();  // Ensure the wave updates as soon as it is added
}

function setupControls(container) {
    const svg = container.querySelector('svg');
    const sliders = container.querySelectorAll('input[type="range"]');
    const numbers = container.querySelectorAll('input[type="number"]');
    const autoSlideBtns = container.querySelectorAll('.auto-slide');

    sliders.forEach((slider, index) => {
        slider.addEventListener('input', () => {
            numbers[index].value = slider.value;
            updateWaves();
        });
    });

    numbers.forEach((number, index) => {
        number.addEventListener('input', () => {
            sliders[index].value = number.value;
            updateWaves();
        });
    });

    autoSlideBtns.forEach(btn => {
        let autoSlideInterval;
        btn.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            const slider = container.querySelector(`.${type}`);
            const number = container.querySelector(`.${type}-value`);
            if (autoSlideInterval) {
                clearInterval(autoSlideInterval);
                autoSlideInterval = null;
                this.textContent = `Auto-Slide ${type.split('-')[0]}`;
            } else {
                const step = 0.5; // Incremento mais suave
                autoSlideInterval = setInterval(() => {
                    let newValue = parseFloat(slider.value) + step;
                    if (newValue > parseFloat(slider.max)) newValue = parseFloat(slider.min);
                    slider.value = newValue.toFixed(2);
                    number.value = newValue.toFixed(2);
                    updateWaves();
                }, 50); // Intervalo mais rápido para transição suave
                this.textContent = `Stop ${type.split('-')[0]}`;
            }
        });
    });
}
// ... (previous code remains the same)

let noiseEnabled = false;

document.getElementById('addNoise').addEventListener('click', () => {
    noiseEnabled = !noiseEnabled;
    document.getElementById('addSineWave').disabled = noiseEnabled;
    updateWaves();
});

document.getElementById('submitResult').addEventListener('click', () => {
    const resultantData = document.getElementById('resultantSinewave').outerHTML;
    const url = `result.html`;
    localStorage.setItem('resultantData', resultantData);
    window.open(url, '_blank');
});

function updateWaves() {
    const dataPoints = new Array(800).fill(0);
    document.querySelectorAll('.wave-container').forEach(container => {
        const svg = container.querySelector('svg');
        const amplitude = parseFloat(container.querySelector('.amplitude').value);
        const frequency = parseFloat(container.querySelector('.frequency').value);
        const phase = parseFloat(container.querySelector('.phase').value);
        const waveData = new Array(800).fill(0).map((_, x) =>
            amplitude * Math.sin((x / 100 * frequency) + (phase * Math.PI / 180))
        );
        drawSineWave(svg, waveData, 'blue');
        waveData.forEach((y, x) => dataPoints[x] += y);
    });

    if (noiseEnabled) {
        const noiseAmplitude = 50;
        const noiseData = new Array(800).fill(0).map(() => (Math.random() - 0.5) * noiseAmplitude);
        noiseData.forEach((y, x) => dataPoints[x] += y);
    }

    drawSineWave(svgResultant, dataPoints, 'red');
}

// ... (remaining code remains the same)

function drawSineWave(svg, dataPoints, color = 'blue') {
    const maxHeight = Math.max(...dataPoints.map(Math.abs)) * 1.1; // Scale to max amplitude + 10%
    const ns = 'http://www.w3.org/2000/svg';
    svg.innerHTML = '';  // Clear previous drawing
    const path = document.createElementNS(ns, 'path');
    let d = `M 0 ${svg.height.baseVal.value / 2}`; // Center the wave vertically

    dataPoints.forEach((y, x) => {
        let normalizedY = (svg.height.baseVal.value / 2) * (1 - y / maxHeight);
        d += ` L ${x} ${normalizedY}`;
    });

    path.setAttribute('d', d);
    path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', '2');
    path.setAttribute('fill', 'none');
    svg.appendChild(path);
}


// Initial setup
addSineWave();  // Add the first sine wave by default
