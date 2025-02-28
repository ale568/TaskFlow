const fs = require('fs');
const path = require('path');
const { dialog } = require('electron');
const Database = require('better-sqlite3');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

class ExportUtils {
    /**
     * Main function to export data in various formats.
     * @param {string} format - The export format (csv, json, txt, xlsx, pdf).
     * @param {Array} data - The data to be exported.
     */
    static async exportData(format, data) {
        const filePath = await this.showSaveDialog(format);
        if (!filePath) return;

        switch (format) {
            case 'csv':
                this.exportCSV(data, filePath);
                break;
            case 'json':
                this.exportJSON(data, filePath);
                break;
            case 'txt':
                this.exportTXT(data, filePath);
                break;
            case 'xlsx':
                this.exportXLSX(data, filePath);
                break;
            case 'pdf':
                this.exportPDF(data, filePath);
                break;
            default:
                console.error('Unsupported export format:', format);
        }
    }

    /**
     * Show save dialog and return selected file path.
     * @param {string} format - The export format.
     * @returns {Promise<string|null>} - File path or null if cancelled.
     */
    static async showSaveDialog(format) {
        const { filePath } = await dialog.showSaveDialog({
            title: 'Save Exported File',
            defaultPath: `timesheet_${new Date().toISOString().replace(/[:.]/g, '-')}.${format}`,
            filters: [{ name: `${format.toUpperCase()} Files`, extensions: [format] }],
        });
        return filePath || null;
    }

    /**
     * Export data to CSV using SQLite's built-in functionality.
     * @param {Array} data - The data to be exported.
     * @param {string} filePath - The file path where data should be saved.
     */
    static exportCSV(data, filePath) {
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(row => Object.values(row).join(',')).join('\n');
        fs.writeFileSync(filePath, `${headers}\n${rows}`);
        console.log(`CSV exported: ${filePath}`);
    }

    /**
     * Export data to JSON file.
     * @param {Array} data - The data to be exported.
     * @param {string} filePath - The file path where data should be saved.
     */
    static exportJSON(data, filePath) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
        console.log(`JSON exported: ${filePath}`);
    }

    /**
     * Export data to TXT file.
     * @param {Array} data - The data to be exported.
     * @param {string} filePath - The file path where data should be saved.
     */
    static exportTXT(data, filePath) {
        let content = `Timesheet Report\n\n`;
        content += `Date       | Project         | Task         | Hours Worked\n`;
        content += `--------------------------------------------------------\n`;
        data.forEach(row => {
            content += `${row.date.padEnd(12)} | ${row.project.padEnd(15)} | ${row.task.padEnd(15)} | ${row.hoursWorked}\n`;
        });
        fs.writeFileSync(filePath, content);
        console.log(`TXT exported: ${filePath}`);
    }

    /**
     * Export data to Excel (.xlsx) format.
     * @param {Array} data - The data to be exported.
     * @param {string} filePath - The file path where data should be saved.
     */
    static async exportXLSX(data, filePath) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Timesheet Report');

        worksheet.columns = Object.keys(data[0]).map(key => ({ header: key, key }));

        data.forEach(row => worksheet.addRow(row));

        await workbook.xlsx.writeFile(filePath);
        console.log(`Excel exported: ${filePath}`);
    }

    /**
     * Export data to PDF format.
     * @param {Array} data - The data to be exported.
     * @param {string} filePath - The file path where data should be saved.
     */
    static exportPDF(data, filePath) {
        const doc = new PDFDocument();
        doc.pipe(fs.createWriteStream(filePath));

        doc.font('Helvetica');
        doc.fontSize(18).text('Timesheet Report', { align: 'center' });
        doc.moveDown();

        doc.fontSize(12);
        data.forEach(row => {
            doc.text(`${row.date} | ${row.project} | ${row.task} | ${row.hoursWorked}`);
        });

        doc.end();
        console.log(`PDF exported: ${filePath}`);
    }
}

module.exports = ExportUtils;