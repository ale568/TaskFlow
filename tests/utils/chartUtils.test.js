const { generateBarChart, generatePiechart} = require('../../renderer/utils/chartUtils');

describe('ChartUtils', () => {

    test('It should generate a bar chart with correct structure', () => {
        const data = { 'Project A': 10, 'Project B': 20};
        const chart = generateBarChart(data, 'Projects');

        expect(chart).toHaveProperty('type', 'bar');
        expect(chart.data.labels).toEqual(Object.keys(data));
        expect(chart.data.datasets[0].data).toEqual(Object.values(data));
    });

    test('It should generate a pie chart with correct structure', () => {
        const data = { 'Tag1': 5, 'Tag2': 15};
        const chart = generatePiechart(data);

        expect(chart).toHaveProperty('type', 'pie');
        expect(chart.data.labels).toEqual(Object.keys(data));
        expect(chart.data.datasets[0].data).toEqual(Object.values(data)); 
    });
});