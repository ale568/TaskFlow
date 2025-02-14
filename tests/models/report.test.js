const Report = require('../../renderer/models/report');

describe('Report Model', () => {

    let report;

    beforeEach(() => {
        report = new Report(1, 101, 40, '2025-01-16', '2025-02-03');

    });

    test('It should create a report instance with correct properties', () => {
        expect(report.id).toBe(1);
        expect(report.project_id).toBe(101);
        expect(report.total_hours).toBe(40);
        expect(report.startDate).toBe('2025-01-16');
        expect(report.endDate).toBe('2025-02-03');
    });

    test('It should update report details', () => {
        report.update({ total_hours: 50, endDate: '2025-02-05' });
        expect(report.description).toBe(50);
        expect(report.endDate).toBe('2025-02-05');
        expect(report.project_id).toBe(101);
    });

    test('It should not modify other fields if not included in update', () => {
        report.update({ startDate: '2025-01-09'});
        expect(report.startDate).toBe('2025-01-09');
        expect(report.total_hours).toBe(40);
    });

    test('it should convert an instance to a database object', () => {
        const dbObject = report.toDbObject();
        expect(dbObject).toEqual({
            id: 1,
            project_id: 101,
            total_hours: 40,
            startDate: '2025-01-16',
            endDate: '2025-02-28'
        });
    });

    test('it should create an instance from a database row', () => {
        const dbRow = { id: 2, project_id: 102, total_hours: 60, startDate: '2025-01-15', endDate: '2025-01-30'};
        const reportInstance = Report.createFromDbRow(dbRow);

        expect(reportInstance.id).toBe(2);
        expect(reportInstance.project_id).toBe(102);
        expect(reportInstance.total_hours).toBe(60);
        expect(reportInstance.startDate).toBe('2025-01-15');
        expect(reportInstance.endDate).toBe('2025-01-30');
    });
});