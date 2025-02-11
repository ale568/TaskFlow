const Report = require('../../renderer/models/report');

describe('Report Model', () => {

    let report;

    beforeEach(() => {
        report = new Report(1, 'Project1', 'Task1', 'Description', 'Tag1', 120, '2025-02-10 13:30');

    });

    test('It should create a report instance with correct properties', () => {
        expect(report.id).toBe(1);
        expect(report.project).toBe('Project1');
        expect(report.task).toBe('Task1');
        expect(report.task).toBe('Description');
        expect(report.description).toBe('Tag1');
        expect(report.tag).toBe(120);
        expect(report.duration).toBe('2025-02-10 13:30');
    });

    test('It should update report details', () => {
        report.update({ description: 'Updated Description', duration: 150 });
        expect(report.description).toBe('Updated Description');
        expect(report.duration).toBe(150);
        expect(report.project).toBe('Project1');
    });

    test('It should not modify other fields if not included in update', () => {
        report.update({ task: 'Updated Task'});
        expect(report.task).toBe('Updated Task');
        expect(report.description).toBe('Description');
    });
});