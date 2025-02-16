const Report = require('../../renderer/models/report');

describe('Report Model - Database Integration', () => {
    test('It should create a new report in the database', async () => {
        const report = await Report.createReport(5, 40, '2025-02-10', '2025-02-16');
        expect(report).toBeInstanceOf(Report);
        expect(report.project_id).toBe(5);
        expect(report.total_hours).toBe(40);
    });

    test('It should retrieve a report by ID', async () => {
        const newReport = await Report.createReport(5, 30, '2025-02-05', '2025-02-15');
        const retrievedReport = await Report.getReportById(newReport.id);
        expect(retrievedReport).toBeInstanceOf(Report);
        expect(retrievedReport.id).toBe(newReport.id);
    });

    test('It should return null for a non-existing report ID', async () => {
        const report = await Report.getReportById(99999);
        expect(report).toBeNull();
    });

    test('It should retrieve all reports of a project', async () => {
        const report1 = await Report.createReport(5, 50, '2025-02-01', '2025-02-10');
        const report2 = await Report.createReport(5, 60, '2025-02-11', '2025-02-20');

        const reports = await Report.getReportsByProjectId(5);
        expect(reports.length).toBeGreaterThanOrEqual(2);
        expect(reports).toEqual(expect.arrayContaining([
            expect.objectContaining({ id: report1.id }),
            expect.objectContaining({ id: report2.id })
        ]));
    });

    test('It should delete a report successfully', async () => {
        const report = await Report.createReport(5, 35, '2025-02-12', '2025-02-18');
        const deleted = await Report.deleteReport(report.id);
        expect(deleted).toBe(true);

        const deletedReport = await Report.getReportById(report.id);
        expect(deletedReport).toBeNull();
    });

    test('It should return false if deleting a non-existing report', async () => {
        const deleted = await Report.deleteReport(99999);
        expect(deleted).toBe(false);
    });

    test('It should throw an error if report ID is invalid', async () => {
        await expect(Report.getReportById(null)).rejects.toThrow('Invalid report ID');
        await expect(Report.getReportById(-1)).rejects.toThrow('Invalid report ID');
    });

    test('It should throw an error for invalid project ID when retrieving reports', async () => {
        await expect(Report.getReportsByProjectId(null)).rejects.toThrow('Invalid project ID');
        await expect(Report.getReportsByProjectId(-1)).rejects.toThrow('Invalid project ID');
    });

    test('It should throw an error for an invalid date range when creating a report', async () => {
        await expect(Report.createReport(5, 20, '2025-02-16', '2025-02-10')).rejects.toThrow('Invalid date range');
    });
});
