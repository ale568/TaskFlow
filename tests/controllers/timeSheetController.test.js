const TimeSheetController = require('../../renderer/controllers/timeSheetController');
const TimeEntry = require('../../renderer/models/timeEntry');
const exportUtils = require('../../renderer/utils/exportUtils');
const dbUtils = require('../../renderer/utils/dbUtils');
const { dialog } = require('electron');

jest.mock('../../renderer/models/timeEntry');
jest.mock('../../renderer/utils/exportUtils');
jest.mock('electron', () => ({
    dialog: {
        showSaveDialog: jest.fn()
    }
}));

describe('TimeSheetController - Database Operations', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('It should retrieve all time entries', async () => {
        TimeEntry.getAllTimeEntries.mockResolvedValue([
            { id: 1, project_id: 101, task: 'Task A', startTime: '2024-02-21T10:00:00', endTime: '2024-02-21T11:00:00' },
            { id: 2, project_id: 102, task: 'Task B', startTime: '2024-02-22T12:00:00', endTime: '2024-02-22T13:00:00' }
        ]);

        const entries = await TimeSheetController.getTimeEntries();
        expect(entries.length).toBe(2);
        expect(entries[0].task).toBe('Task A');
    });

    test('It should filter time entries by project ID', async () => {
        TimeEntry.getAllTimeEntries.mockResolvedValue([
            { id: 1, project_id: 101, task: 'Task A', startTime: '2024-02-21T10:00:00' },
            { id: 2, project_id: 102, task: 'Task B', startTime: '2024-02-22T12:00:00' }
        ]);

        const filteredEntries = await TimeSheetController.getTimeEntries({ projectId: 101 });
        expect(filteredEntries.length).toBe(1);
        expect(filteredEntries[0].task).toBe('Task A');
    });

    test('It should filter time entries by date range', async () => {
        TimeEntry.getAllTimeEntries.mockResolvedValue([
            { id: 1, project_id: 101, task: 'Task A', startTime: '2024-02-21T10:00:00' },
            { id: 2, project_id: 102, task: 'Task B', startTime: '2024-02-23T12:00:00' }
        ]);

        const filteredEntries = await TimeSheetController.getTimeEntries({ startDate: '2024-02-20', endDate: '2024-02-22' });
        expect(filteredEntries.length).toBe(1);
        expect(filteredEntries[0].task).toBe('Task A');
    });

    test('It should throw an error if no time entries are available for export', async () => {
        TimeEntry.getAllTimeEntries.mockResolvedValue([]);

        await expect(TimeSheetController.exportTimeEntries('csv'))
            .rejects.toThrow('Failed to export time entries');
    });

    test('It should export time entries as CSV', async () => {
        TimeEntry.getAllTimeEntries.mockResolvedValue([
            { id: 1, project_id: 101, task: 'Task A', startTime: '2024-02-21T10:00:00', endTime: '2024-02-21T11:00:00' }
        ]);
        
        dialog.showSaveDialog.mockResolvedValue({ filePath: '/path/to/file.csv' });

        await TimeSheetController.exportTimeEntries('csv');
        expect(exportUtils.exportCSV).toHaveBeenCalledWith(
            expect.any(Array),
            '/path/to/file.csv'
        );
    });

    test('It should export time entries as TXT', async () => {
        TimeEntry.getAllTimeEntries.mockResolvedValue([
            { id: 2, project_id: 102, task: 'Task B', startTime: '2024-02-22T12:00:00', endTime: '2024-02-22T13:00:00' }
        ]);
        
        dialog.showSaveDialog.mockResolvedValue({ filePath: '/path/to/file.txt' });

        await TimeSheetController.exportTimeEntries('txt');
        expect(exportUtils.exportTXT).toHaveBeenCalledWith(
            expect.any(Array),
            '/path/to/file.txt'
        );
    });

    test('It should export time entries as JSON', async () => {
        TimeEntry.getAllTimeEntries.mockResolvedValue([
            { id: 3, project_id: 103, task: 'Task C', startTime: '2024-02-23T14:00:00', endTime: '2024-02-23T15:00:00' }
        ]);
        
        dialog.showSaveDialog.mockResolvedValue({ filePath: '/path/to/file.json' });

        await TimeSheetController.exportTimeEntries('json');
        expect(exportUtils.exportJSON).toHaveBeenCalledWith(
            expect.any(Array),
            '/path/to/file.json'
        );
    });

    test('It should export time entries as PDF', async () => {
        TimeEntry.getAllTimeEntries.mockResolvedValue([
            { id: 4, project_id: 104, task: 'Task D', startTime: '2024-02-24T16:00:00', endTime: '2024-02-24T17:00:00' }
        ]);
        
        dialog.showSaveDialog.mockResolvedValue({ filePath: '/path/to/file.pdf' });

        await TimeSheetController.exportTimeEntries('pdf');
        expect(exportUtils.exportPDF).toHaveBeenCalledWith(
            expect.any(Array),
            '/path/to/file.pdf'
        );
    });

    test('It should export time entries as XLSX', async () => {
        TimeEntry.getAllTimeEntries.mockResolvedValue([
            { id: 5, project_id: 105, task: 'Task E', startTime: '2024-02-25T18:00:00', endTime: '2024-02-25T19:00:00' }
        ]);
        
        dialog.showSaveDialog.mockResolvedValue({ filePath: '/path/to/file.xlsx' });

        await TimeSheetController.exportTimeEntries('xlsx');
        expect(exportUtils.exportXLSX).toHaveBeenCalledWith(
            expect.any(Array),
            '/path/to/file.xlsx'
        );
    });

    test('It should not export if no file is selected', async () => {
        TimeEntry.getAllTimeEntries.mockResolvedValue([
            { id: 6, project_id: 106, task: 'Task F', startTime: '2024-02-26T20:00:00', endTime: '2024-02-26T21:00:00' }
        ]);
        
        dialog.showSaveDialog.mockResolvedValue({ filePath: undefined });

        await TimeSheetController.exportTimeEntries('csv');
        expect(exportUtils.exportCSV).not.toHaveBeenCalled();
    });

    test.skip('It should handle database connection failure gracefully', async () => {
        dbUtils.close(); // Simulate database connection failure

        let errorCaught = false;
        try {
            await TimeSheetController.getTimeEntries();
        } catch (error) {
            errorCaught = true;
        }

        expect(errorCaught).toBeTruthy();

        dbUtils.connect('taskflow_test_reports.sqlite'); // Restore database connection for further tests
    });

    afterAll(async () => {
        dbUtils.close();
    });
});