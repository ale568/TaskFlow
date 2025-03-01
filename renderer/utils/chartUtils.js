const Chart = require('chart.js/auto');
const fs = require('fs');

/**
 * Generates a chart inside a given canvas element.
 * @param {string} canvasId - The ID of the canvas element.
 * @param {string} type - Chart type (bar, line, pie, etc.).
 * @param {Object} data - Chart data (labels, datasets).
 * @param {Object} options - Chart configuration options.
 * @returns {Chart} The created Chart.js instance.
 */
function generateChart(canvasId, type, data, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`❌ Canvas with ID "${canvasId}" not found.`);
        return null;
    }

    return new Chart(canvas, {
        type,
        data,
        options: { ...getChartDefaults(type), ...options }
    });
}

/**
 * Exports a chart as an image file.
 * @param {string} canvasId - The ID of the canvas element.
 * @param {string} filename - The name of the output file.
 */
function exportChartAsImage(canvasId, filename = 'chart.png') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`❌ Canvas with ID "${canvasId}" not found.`);
        return;
    }

    const image = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    fs.writeFileSync(filename, image.split(',')[1], 'base64');
    console.log(`✅ Chart exported as ${filename}`);
}

/**
 * Returns default chart options for each type.
 * @param {string} type - Chart type (bar, line, pie, etc.).
 * @returns {Object} Default options.
 */
function getChartDefaults(type) {
    const defaults = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: true, position: 'top' },
        }
    };

    if (type === 'bar' || type === 'line') {
        defaults.scales = { y: { beginAtZero: true } };
    }

    return defaults;
}

module.exports = { generateChart, exportChartAsImage, getChartDefaults };