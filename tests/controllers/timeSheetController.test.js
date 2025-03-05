const TimeSheetController = require('../../renderer/controllers/timeSheetController');
const TimeEntry = require('../../renderer/models/timeEntry');
const exportUtils = require('../../renderer/utils/exportUtils');
const filterUtils = require('../../renderer/utils/filterUtils');
const dialogUtils = require('../../renderer/utils/dialogUtils');
const loggingUtils = require('../../renderer/utils/loggingUtils');
const dbUtils = require('../../renderer/utils/dbUtils');

jest.mock('../../renderer/models/timeEntry');
jest.mock('../../renderer/utils/exportUtils');
jest.mock('../../renderer/utils/filterUtils');
jest.mock('../../renderer/utils/dialogUtils');
jest.mock('../../renderer/utils/loggingUtils');

describe('TimeSheetController - Database Operations', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('It should retrieve all time entries', async () => {
        const mockEntries = [
            { id: 1, project_id: 101, task: 'Task A', startTime: '2024-02-21T10:00:00' },
            { id: 2, project_id: 102, task: 'Task B', startTime: '2024-02-22T12:00:00' }
        ];
        TimeEntry.getAllTimeEntries.mockResolvedValue(mockEntries);
        filterUtils.filterTimesheets.mockReturnValue(mockEntries);

        const entries = await TimeSheetController.getTimeEntries();
        expect(entries).toEqual(mockEntries);
        expect(filterUtils.filterTimesheets).toHaveBeenCalledWith(mockEntries, {});
        expect(loggingUtils.logMessage).toHaveBeenCalledWith('info', 'Retrieved 2 time entries.', 'CONTROLLERS');
    });

    test('It should filter time entries by project ID', async () => {
        const mockEntries = [
            { id: 1, project_id: 101, task: 'Task A', startTime: '2024-02-21T10:00:00' },
            { id: 2, project_id: 102, task: 'Task B', startTime: '2024-02-22T12:00:00' }
        ];
        TimeEntry.getAllTimeEntries.mockResolvedValue(mockEntries);
        filterUtils.filterTimesheets.mockReturnValue([mockEntries[0]]);

        const filteredEntries = await TimeSheetController.getTimeEntries({ projectId: 101 });
        expect(filteredEntries.length).toBe(1);
        expect(filteredEntries[0].task).toBe('Task A');
        expect(filterUtils.filterTimesheets).toHaveBeenCalledWith(mockEntries, { projectId: 101 });
    });

    test('It should filter time entries by date range', async () => {
        const mockEntries = [
            { id: 1, project_id: 101, task: 'Task A', startTime: '2024-02-21T10:00:00' },
            { id: 2, project_id: 102, task: 'Task B', startTime: '2024-02-23T12:00:00' }
        ];
        TimeEntry.getAllTimeEntries.mockResolvedValue(mockEntries);
        filterUtils.filterTimesheets.mockReturnValue([mockEntries[0]]);

        const filteredEntries = await TimeSheetController.getTimeEntries({ startDate: '2024-02-20', endDate: '2024-02-22' });
        expect(filteredEntries.length).toBe(1);
        expect(filteredEntries[0].task).toBe('Task A');
        expect(filterUtils.filterTimesheets).toHaveBeenCalledWith(mockEntries, { startDate: '2024-02-20', endDate: '2024-02-22' });
    });

    test('It should throw an error if no time entries are available for export', async () => {
        TimeEntry.getAllTimeEntries.mockResolvedValue([]);
        filterUtils.filterTimesheets.mockReturnValue([]);

        await expect(TimeSheetController.exportTimeEntries('csv'))
            .rejects.toThrow('Failed to export time entries');

            expect(loggingUtils.logMessage).toHaveBeenCalledWith('error', expect.stringContaining('Error exporting time entries: No time entries available for export.'), 'CONTROLLERS');

    });

    test('It should export time entries as CSV', async () => {
        const mockEntries = [
            { id: 1, project_id: 101, task: 'Task A', startTime: '2024-02-21T10:00:00' }
        ];
        TimeEntry.getAllTimeEntries.mockResolvedValue(mockEntries);
        filterUtils.filterTimesheets.mockReturnValue(mockEntries);
        dialogUtils.showSaveDialog.mockResolvedValue('/path/to/file.csv');

        await TimeSheetController.exportTimeEntries('csv');
        expect(exportUtils.exportCSV).toHaveBeenCalledWith(mockEntries, '/path/to/file.csv');
        expect(loggingUtils.logMessage).toHaveBeenCalledWith('info', 'Time entries exported successfully to /path/to/file.csv', 'CONTROLLERS');
    });

    test('It should export time entries as TXT', async () => {
        const mockEntries = [
            { id: 2, project_id: 102, task: 'Task B', startTime: '2024-02-22T12:00:00' }
        ];
        TimeEntry.getAllTimeEntries.mockResolvedValue(mockEntries);
        filterUtils.filterTimesheets.mockReturnValue(mockEntries);
        dialogUtils.showSaveDialog.mockResolvedValue('/path/to/file.txt');

        await TimeSheetController.exportTimeEntries('txt');
        expect(exportUtils.exportTXT).toHaveBeenCalledWith(mockEntries, '/path/to/file.txt');
    });

    test('It should export time entries as JSON', async () => {
        const mockEntries = [
            { id: 3, project_id: 103, task: 'Task C', startTime: '2024-02-23T14:00:00' }
        ];
        TimeEntry.getAllTimeEntries.mockResolvedValue(mockEntries);
        filterUtils.filterTimesheets.mockReturnValue(mockEntries);
        dialogUtils.showSaveDialog.mockResolvedValue('/path/to/file.json');

        await TimeSheetController.exportTimeEntries('json');
        expect(exportUtils.exportJSON).toHaveBeenCalledWith(mockEntries, '/path/to/file.json');
    });

    test('It should export time entries as PDF', async () => {
        const mockEntries = [
            { id: 4, project_id: 104, task: 'Task D', startTime: '2024-02-24T16:00:00' }
        ];
        TimeEntry.getAllTimeEntries.mockResolvedValue(mockEntries);
        filterUtils.filterTimesheets.mockReturnValue(mockEntries);
        dialogUtils.showSaveDialog.mockResolvedValue('/path/to/file.pdf');

        await TimeSheetController.exportTimeEntries('pdf');
        expect(exportUtils.exportPDF).toHaveBeenCalledWith(mockEntries, '/path/to/file.pdf');
    });

    test('It should export time entries as XLSX', async () => {
        const mockEntries = [
            { id: 5, project_id: 105, task: 'Task E', startTime: '2024-02-25T18:00:00' }
        ];
        TimeEntry.getAllTimeEntries.mockResolvedValue(mockEntries);
        filterUtils.filterTimesheets.mockReturnValue(mockEntries);
        dialogUtils.showSaveDialog.mockResolvedValue('/path/to/file.xlsx');

        await TimeSheetController.exportTimeEntries('xlsx');
        expect(exportUtils.exportXLSX).toHaveBeenCalledWith(mockEntries, '/path/to/file.xlsx');
    });

    test('It should not export if no file is selected', async () => {
        const mockEntries = [
            { id: 6, project_id: 106, task: 'Task F', startTime: '2024-02-26T20:00:00' }
        ];
        TimeEntry.getAllTimeEntries.mockResolvedValue(mockEntries);
        filterUtils.filterTimesheets.mockReturnValue(mockEntries);
        dialogUtils.showSaveDialog.mockResolvedValue(null);

        await TimeSheetController.exportTimeEntries('csv');
        expect(exportUtils.exportCSV).not.toHaveBeenCalled();
    });

    test.skip('It should handle database connection failure gracefully', async () => {
        dbUtils.close();

        let errorCaught = false;
        try {
            await TimeSheetController.getTimeEntries();
        } catch (error) {
            errorCaught = true;
        }

        expect(errorCaught).toBeTruthy();

        dbUtils.connect('taskflow_test_reports.sqlite');
    });

    afterAll(async () => {
        dbUtils.close();
    });
});