const Report = require('../../renderer/models/report');

describe('Report Model - Database Integration', () => {
    test('It should create a new report in the database', async () => {
        const report = await Report.createReport(5, 20, '2025-02-10', '2025-02-15');
        expect(report).toBeInstanceOf(Report);
        expect(report.project_id).toBe(5);
        expect(report.total_hours).toBe(20);
        expect(report.startDate).toBe('2025-02-10');
        expect(report.endDate).toBe('2025-02-15');
    });

    test('It should retrieve a report by ID', async () => {
        const newReport = await Report.createReport(5, 25, '2025-02-11', '2025-02-16');
        const retrievedReport = await Report.getReportById(newReport.id);
        expect(retrievedReport).toBeInstanceOf(Report);
        expect(retrievedReport.id).toBe(newReport.id);
    });

    test('It should return null for a non-existing report ID', async () => {
        const report = await Report.getReportById(99999);
        expect(report).toBeNull();
    });

    test('It should retrieve all reports of a project', async () => {
        const report1 = await Report.createReport(5, 30, '2025-02-12', '2025-02-17');
        const report2 = await Report.createReport(5, 35, '2025-02-13', '2025-02-18');

        const reports = await Report.getReportsByProjectId(5);
        expect(reports.length).toBeGreaterThanOrEqual(2);
        expect(reports).toEqual(expect.arrayContaining([
            expect.objectContaining({ id: report1.id }),
            expect.objectContaining({ id: report2.id })
        ]));
    });

    test('It should update a report successfully', async () => {
        const report = await Report.createReport(5, 40, '2025-02-14', '2025-02-19');
        const updated = await Report.updateReport(report.id, { total_hours: 50 });

        expect(updated).toBe(true);
        const updatedReport = await Report.getReportById(report.id);
        expect(updatedReport.total_hours).toBe(50);
    });

    test('It should delete a report successfully', async () => {
        const report = await Report.createReport(5, 45, '2025-02-15', '2025-02-20');
        const deleted = await Report.deleteReport(report.id);
        expect(deleted).toBe(true);

        const deletedReport = await Report.getReportById(report.id);
        expect(deletedReport).toBeNull();
    });

    test('It should return false if deleting a non-existing report', async () => {
        const deleted = await Report.deleteReport(99999);
        expect(deleted).toBe(false);
    });
});
