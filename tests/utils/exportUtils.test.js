const fs = require('fs');
const { dialog } = require('electron');
const ExportUtils = require('../../renderer/utils/exportUtils');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

jest.mock('fs');
jest.mock('electron', () => ({
    dialog: {
        showSaveDialog: jest.fn(),
    },
}));
jest.mock('exceljs'); // Full mock of exceljs
jest.mock('pdfkit'); // Full mock of PDFKit

describe('ExportUtils Tests', () => {
    const mockData = [
        { date: '2024-02-26', project: 'Project A', task: 'Task 1', hoursWorked: '3h' },
        { date: '2024-02-27', project: 'Project B', task: 'Task 2', hoursWorked: '2h' }
    ];
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('It should call showSaveDialog and return correct file path', async () => {
        dialog.showSaveDialog.mockResolvedValue({ filePath: '/mock/path/file.csv' });

        const filePath = await ExportUtils.showSaveDialog('csv');
        expect(filePath).toBe('/mock/path/file.csv');
        expect(dialog.showSaveDialog).toHaveBeenCalledWith({
            title: 'Save Exported File',
            defaultPath: expect.stringMatching(/timesheet_\d{4}-\d{2}-\d{2}.*\.csv/),
            filters: [{ name: 'CSV Files', extensions: ['csv'] }],
        });
    });

    test('It should export data to CSV correctly', () => {
        const filePath = '/mock/path/file.csv';
        ExportUtils.exportCSV(mockData, filePath);

        expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
        expect(fs.writeFileSync).toHaveBeenCalledWith(
            filePath,
            expect.stringContaining('date,project,task,hoursWorked') // Generic Check, Avoid False Negatives
        );
    });

    test('It should export data to JSON correctly', () => {
        const filePath = '/mock/path/file.json';
        ExportUtils.exportJSON(mockData, filePath);

        expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
        expect(fs.writeFileSync).toHaveBeenCalledWith(filePath, JSON.stringify(mockData, null, 4));
    });

    test('It should export data to TXT correctly', () => {
        const filePath = '/mock/path/file.txt';
        ExportUtils.exportTXT(mockData, filePath);

        expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
        expect(fs.writeFileSync).toHaveBeenCalledWith(
            filePath,
            expect.stringContaining('Timesheet Report') // Generic Check to Avoid Format Errors
        );
    });

    test('It should export data to XLSX correctly', async () => {
        const filePath = '/mock/path/file.xlsx';
        const mockWorkbook = {
            addWorksheet: jest.fn().mockReturnValue({
                columns: [],
                addRow: jest.fn(),
            }),
            xlsx: {
                writeFile: jest.fn().mockResolvedValue(),
            },
        };

        ExcelJS.Workbook.mockImplementation(() => mockWorkbook);

        await ExportUtils.exportXLSX(mockData, filePath);

        expect(mockWorkbook.addWorksheet).toHaveBeenCalledWith('Timesheet Report');
        expect(mockWorkbook.xlsx.writeFile).toHaveBeenCalledWith(filePath);
    });

    test('It should export data to PDF correctly', () => {
        const filePath = '/mock/path/file.pdf';
    
        const mockPipe = jest.fn();
        const mockEnd = jest.fn();
        const mockText = jest.fn().mockReturnThis();
        const mockMoveDown = jest.fn().mockReturnThis();
        const mockFont = jest.fn().mockReturnThis();  // Assicura che restituisca `this`
        const mockFontSize = jest.fn().mockReturnThis();
    
        PDFDocument.mockImplementation(() => ({
            pipe: mockPipe,
            end: mockEnd,
            text: mockText,
            moveDown: mockMoveDown,
            font: mockFont,
            fontSize: mockFontSize,
        }));
    
        ExportUtils.exportPDF(mockData, filePath);
    
        expect(mockPipe).toHaveBeenCalled();
        expect(mockFont).toHaveBeenCalledTimes(1);  // Assicura che sia stato chiamato almeno una volta
        expect(mockFont).toHaveBeenCalledWith('Helvetica');  // Verifica il font impostato
        expect(mockFontSize).toHaveBeenCalledWith(18);
        expect(mockText).toHaveBeenCalledWith('Timesheet Report', { align: 'center' });
        expect(mockEnd).toHaveBeenCalled();
    });    

    test('It should handle unsupported formats gracefully', async () => {
        console.error = jest.fn();
        await ExportUtils.exportData('unsupported', mockData);
        expect(console.error).toHaveBeenCalledWith('Unsupported export format:', 'unsupported');
    });

    test('It should skip export when no file path is selected', async () => {
        dialog.showSaveDialog.mockResolvedValue({ filePath: null });
        await ExportUtils.exportData('csv', mockData);
        expect(fs.writeFileSync).not.toHaveBeenCalled();
    });   

    test('It should not proceed if no file path is selected', async () => {
        dialog.showSaveDialog.mockResolvedValue({ filePath: null });
    
        await ExportUtils.exportData('csv', mockData);
    
        expect(fs.writeFileSync).not.toHaveBeenCalled(); // Assicura che non venga scritto nulla
    });
    
    test('It should handle errors when writing to a file', () => {
        fs.writeFileSync.mockImplementation(() => {
            throw new Error('File system error');
        });
    
        expect(() => ExportUtils.exportCSV(mockData, '/mock/path/file.csv')).toThrow('File system error');
    });    

});