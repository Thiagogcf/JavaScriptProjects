document.addEventListener('DOMContentLoaded', function() {
    const resultantData = localStorage.getItem('resultantData');
    const svgResultant = document.getElementById('resultContainer');
    svgResultant.innerHTML = resultantData;

    const applyFourierBtn = document.getElementById('applyFourier');
    applyFourierBtn.addEventListener('click', applyFourierTransform);
});

function applyFourierTransform() {
    const svgResultant = document.getElementById('resultContainer').querySelector('svg');
    const pathElement = svgResultant.querySelector('path');

    if (pathElement) {
        const pathData = pathElement.getAttribute('d');
        const dataPoints = getDataPointsFromPathData(pathData);

        // Apply Fourier Transform to dataPoints
        const fourierData = fourierTransform(dataPoints);

        // Create a new SVG element for the frequency spectrum
        const svgSpectrum = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgSpectrum.setAttribute('width', '800');
        svgSpectrum.setAttribute('height', '400');

        // Draw the frequency spectrum
        const maxFreq = Math.max(...fourierData.map(({ freq }) => freq));
        const maxAmp = Math.max(...fourierData.map(({ amp }) => amp));

        fourierData.forEach(({ freq, amp }) => {
            const x = (freq / maxFreq) * 800;
            const y = 400 - (amp / maxAmp) * 400;
            const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            bar.setAttribute('x', x);
            bar.setAttribute('y', y);
            bar.setAttribute('width', 800 / fourierData.length);
            bar.setAttribute('height', (amp / maxAmp) * 400);
            bar.setAttribute('fill', 'blue');
            svgSpectrum.appendChild(bar);
        });

        // Append the frequency spectrum SVG to the result container
        const resultContainer = document.getElementById('resultContainer');
        resultContainer.appendChild(svgSpectrum);

        const applyFourierBtn = document.getElementById('applyFourier');
        applyFourierBtn.textContent = 'Remove Noise';
        applyFourierBtn.removeEventListener('click', applyFourierTransform);
        applyFourierBtn.addEventListener('click', removeNoise);
    }
}

function removeNoise() {
    const svgResultant = document.getElementById('resultContainer').querySelector('svg');
    const pathElement = svgResultant.querySelector('path');

    if (pathElement) {
        const pathData = pathElement.getAttribute('d');
        const dataPoints = getDataPointsFromPathData(pathData);

        // Remove noise from dataPoints
        const denoisedData = removeNoiseFromData(dataPoints);

        // Update the SVG with the denoised data
        drawSineWave(svgResultant, denoisedData, 'green');

        const applyFourierBtn = document.getElementById('applyFourier');
        applyFourierBtn.textContent = 'Identify Frequencies';
        applyFourierBtn.removeEventListener('click', removeNoise);
        applyFourierBtn.addEventListener('click', identifyFrequencies);
    }
}

function identifyFrequencies() {
    const svgResultant = document.getElementById('resultContainer').querySelector('svg');
    const pathElement = svgResultant.querySelector('path');

    if (pathElement) {
        const pathData = pathElement.getAttribute('d');
        const dataPoints = getDataPointsFromPathData(pathData);

        // Identify frequencies in dataPoints
        const frequencies = identifyFrequenciesInData(dataPoints);

        // Add labels for identified frequencies
        frequencies.forEach((freq, index) => {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', 10);
            text.setAttribute('y', 20 + index * 20);
            text.textContent = `Frequency: ${freq}`;
            text.setAttribute('fill', 'red');
            svgResultant.appendChild(text);
        });

        const applyFourierBtn = document.getElementById('applyFourier');
        applyFourierBtn.style.display = 'none';
    }
}

// Helper functions (implement these according to your requirements)
function getDataPointsFromPathData(pathData) {
    const dataPoints = [];
    const pathCommands = pathData.split(/(?=[LMC])/);

    let currentX = 0;
    let currentY = 0;

    pathCommands.forEach(command => {
        const [instruction, ...coordinates] = command.split(' ');
        const [x, y] = coordinates.map(parseFloat);

        switch (instruction) {
            case 'M':
                currentX = x;
                currentY = y;
                break;
            case 'L':
                dataPoints.push({ x: currentX, y: currentY });
                currentX = x;
                currentY = y;
                break;
            case 'C':
                // Assuming 'C' is followed by 6 coordinates (2 control points and 1 end point)
                const [controlX1, controlY1, controlX2, controlY2, endX, endY] = coordinates.map(parseFloat);
                const curvePoints = getCurvePoints(currentX, currentY, controlX1, controlY1, controlX2, controlY2, endX, endY);
                dataPoints.push(...curvePoints);
                currentX = endX;
                currentY = endY;
                break;
        }
    });

    return dataPoints;
}

function getCurvePoints(startX, startY, controlX1, controlY1, controlX2, controlY2, endX, endY, numPoints = 10) {
    const points = [];
    for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints;
        const x = (1 - t) ** 3 * startX + 3 * (1 - t) ** 2 * t * controlX1 + 3 * (1 - t) * t ** 2 * controlX2 + t ** 3 * endX;
        const y = (1 - t) ** 3 * startY + 3 * (1 - t) ** 2 * t * controlY1 + 3 * (1 - t) * t ** 2 * controlY2 + t ** 3 * endY;
        points.push({ x, y });
    }
    return points;
}

function fourierTransform(dataPoints) {
    const N = dataPoints.length;
    const fourierData = [];

    for (let k = 0; k < N; k++) {
        let re = 0;
        let im = 0;
        for (let n = 0; n < N; n++) {
            const angle = (2 * Math.PI * k * n) / N;
            re += dataPoints[n].y * Math.cos(angle);
            im -= dataPoints[n].y * Math.sin(angle);
        }
        re = re / N;
        im = im / N;
        const freq = k;
        const amp = Math.sqrt(re * re + im * im);
        const phase = Math.atan2(im, re);
        fourierData[k] = { re, im, freq, amp, phase };
    }

    return fourierData;
}

function removeNoiseFromData(dataPoints) {
    const fourierData = fourierTransform(dataPoints);
    const filteredData = fourierData.filter(({ amp }) => amp > 10); // Adjust the threshold as needed
    const denoisedData = [];

    for (let i = 0; i < dataPoints.length; i++) {
        let y = 0;
        for (let j = 0; j < filteredData.length; j++) {
            const { re, im, freq } = filteredData[j];
            const angle = (2 * Math.PI * freq * i) / dataPoints.length;
            y += re * Math.cos(angle) + im * Math.sin(angle);
        }
        denoisedData.push({ x: dataPoints[i].x, y });
    }

    return denoisedData;
}

function identifyFrequenciesInData(dataPoints) {
    const fourierData = fourierTransform(dataPoints);
    const frequencies = fourierData
        .filter(({ amp }) => amp > 10) // Adjust the threshold as needed
        .map(({ freq }) => freq);

    return frequencies;
}

function drawSineWave(svg, dataPoints, color = 'blue') {
    const width = svg.width.baseVal.value;
    const height = svg.height.baseVal.value;

    if (!Array.isArray(dataPoints) || dataPoints.length === 0) {
        // If dataPoints is not an array or is empty, don't draw the sine wave
        return;
    }

    const validDataPoints = dataPoints.filter(point => point.hasOwnProperty('x') && point.hasOwnProperty('y') && !isNaN(point.y));

    if (validDataPoints.length === 0) {
        // If there are no valid data points, don't draw the sine wave
        return;
    }

    const maxY = Math.max(...validDataPoints.map(point => Math.abs(point.y)));

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    let d = `M ${validDataPoints[0].x} ${height / 2 - (validDataPoints[0].y / maxY) * (height / 2)}`;

    validDataPoints.forEach((point, index) => {
        if (index > 0) {
            const scaledY = (point.y / maxY) * (height / 2);
            d += ` L ${point.x} ${height / 2 - scaledY}`;
        }
    });

    path.setAttribute('d', d);
    path.setAttribute('stroke', color);
    path.setAttribute('fill', 'none');

    // Remove existing path elements
    const existingPaths = svg.querySelectorAll('path');
    existingPaths.forEach(path => svg.removeChild(path));

    svg.appendChild(path);
}
