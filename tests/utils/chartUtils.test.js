/**
 * @jest-environment jsdom
 */

const Chart = require('chart.js/auto');
const fs = require('fs');
const chartUtils = require('../../renderer/utils/chartUtils');

jest.mock('chart.js/auto');
jest.mock('fs');

describe('ChartUtils Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        document.body.innerHTML = '<canvas id="testCanvas"></canvas>'; // Simula un elemento canvas nel DOM
    });

    test('It should generate a chart', () => {
        const mockChartInstance = { destroy: jest.fn() };
        Chart.mockImplementation(() => mockChartInstance);

        const data = { labels: ['A', 'B', 'C'], datasets: [{ label: 'Test', data: [10, 20, 30] }] };
        const chart = chartUtils.generateChart('testCanvas', 'bar', data);

        expect(Chart).toHaveBeenCalled();
        expect(chart).not.toBeNull();
    });

    test('It should return null if canvas does not exist', () => {
        document.body.innerHTML = ''; // Rimuove il canvas
        const data = { labels: ['A', 'B', 'C'], datasets: [{ label: 'Test', data: [10, 20, 30] }] };

        const chart = chartUtils.generateChart('nonExistentCanvas', 'bar', data);
        expect(chart).toBeNull();
    });

    test('It should export a chart as an image', () => {
        const mockToDataURL = jest.fn(() => 'data:image/png;base64,mockdata');
        document.getElementById('testCanvas').toDataURL = mockToDataURL;

        chartUtils.exportChartAsImage('testCanvas', 'mockChart.png');

        expect(mockToDataURL).toHaveBeenCalled();
        expect(fs.writeFileSync).toHaveBeenCalledWith('mockChart.png', 'mockdata', 'base64');
    });

    test('It should return default chart options for bar and line charts', () => {
        const defaults = chartUtils.getChartDefaults('bar');
        expect(defaults).toHaveProperty('responsive', true);
        expect(defaults).toHaveProperty('scales.y.beginAtZero', true);
    });

    test('It should return default chart options for pie charts', () => {
        const defaults = chartUtils.getChartDefaults('pie');
        expect(defaults).toHaveProperty('responsive', true);
        expect(defaults).not.toHaveProperty('scales');
    });
});