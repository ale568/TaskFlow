const fs = require('fs');
const path = require('path');
const { dialog } = require('electron');
const Database = require('better-sqlite3');
const ExcelJS = require('exceljs');

const printer = require('./pdfmakeFonts');


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
        if (!data || !data.length) {
            console.warn('No data to export.');
            return;
        }
    
        // 1. Tabella attività
        const activityTable = [
            ['Date', 'Project', 'Task', 'Hours Worked'],
            ...data.map(row => [
                row.date,
                row.project,
                row.task,
                row.hoursWorked
            ])
        ];
    
        // 2. Costruzione mappa per task → giorno → minuti
        const taskMap = {};
        const parseDuration = (str) => {
            const match = str.match(/(?:(\d+)h)?\s*(?:(\d+)m)?/);
            const h = match?.[1] ? parseInt(match[1]) : 0;
            const m = match?.[2] ? parseInt(match[2]) : 0;
            return h * 60 + m;
        };
    
        data.forEach(row => {
            const day = new Date(row.date).getDate();
            const task = row.task;
            const minutes = parseDuration(row.hoursWorked);
    
            if (!taskMap[task]) taskMap[task] = {};
            taskMap[task][day] = (taskMap[task][day] || 0) + minutes;
        });
    
        const formatMins = (mins) => {
            if (!mins) return '';
            const h = Math.floor(mins / 60);
            const m = mins % 60;
            return `${h ? h + 'h ' : ''}${m ? m + 'm' : ''}`.trim();
        };
    
        const days = Array.from({ length: 31 }, (_, i) => i + 1);
        const half = Math.ceil(days.length / 2);
        const firstHalf = days.slice(0, half);
        const secondHalf = days.slice(half);
    
        const buildGridTable = (daysChunk) => {
            const body = [];
        
            // Header
            body.push([
                { text: 'Σ', bold: true, fillColor: '#f0f0f0' },
                ...daysChunk.map(d => ({
                    text: d.toString(),
                    bold: true,
                    fillColor: '#eaf6f6',
                    fontSize: 11
                }))
            ]);
        
            for (const [task, dayMap] of Object.entries(taskMap)) {
                const total = Object.values(dayMap).reduce((a, b) => a + b, 0);
                const row = [
                    { text: formatMins(total), bold: true, fontSize: 11 }
                ];
                daysChunk.forEach(d => {
                    const mins = dayMap[d] || 0;
                    row.push({
                        text: formatMins(mins),
                        alignment: 'center',
                        fontSize: 11
                    });
                });
                body.push(row);
            }
        
            return {
                table: {
                    headerRows: 1,
                    widths: ['auto', ...daysChunk.map(() => 'auto')],
                    body
                },
                layout: {
                    paddingLeft: () => 6,
                    paddingRight: () => 6,
                    paddingTop: () => 4,
                    paddingBottom: () => 4,
                    fillColor: (rowIndex) => rowIndex === 0 ? '#f8f8f8' : null,
                    hLineWidth: () => 0.7,
                    vLineWidth: () => 0.7
                },
                margin: [0, 10, 0, 20]
            };
        };        
    
        // 3. Documento finale
        const docDefinition = {
            content: [
                {
                    text: 'TaskFlow – Timesheet Report',
                    style: 'header',
                    alignment: 'center',
                    margin: [0, 0, 0, 20]
                },
                {
                    text: 'Time Entries',
                    style: 'subheader',
                    margin: [0, 0, 0, 5]
                },
                {
                    table: {
                        headerRows: 1,
                        widths: ['auto', '*', '*', 'auto'],
                        body: activityTable
                    },
                    layout: 'lightHorizontalLines',
                    margin: [0, 0, 0, 20]
                },
                {
                    text: 'Hours Per Day',
                    style: 'subheader',
                    margin: [0, 10, 0, 5]
                },
                buildGridTable(firstHalf),
                buildGridTable(secondHalf)
            ],
            styles: {
                header: {
                    fontSize: 18,
                    bold: true
                },
                subheader: {
                    fontSize: 14,
                    bold: true
                }
            },
            defaultStyle: {
                font: 'Roboto'
            }
        };
    
        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        pdfDoc.pipe(fs.createWriteStream(filePath));
        pdfDoc.end();
    
        console.log(`📄 PDF esportato correttamente in: ${filePath}`);
    }    
 
    /**
     * Export simple project report (label + hours) to PDF.
     * @param {Object} payload - Contains metadata and entries.
     * @param {string} payload.period - The selected period (day/week/month/year).
     * @param {string} payload.date - The selected ISO date.
     * @param {Array<{ label: string, hours: string }>} payload.entries - Data rows.
     * @param {string} filePath - Where to save the PDF.
     */
    static exportProjectReportToPDF({ period, date, entries, chartImage }, filePath) {
        if (!entries || !entries.length) {
            console.warn("No report data to export.");
            return;
        }
    
        const tableData = [
            ['Label', 'Hours Worked'],
            ...entries.map(row => [row.label, row.hours])
        ];
    
        const docDefinition = {
            content: [
                {
                    text: 'TaskFlow – Project Report',
                    style: 'header',
                    alignment: 'center',
                    margin: [0, 0, 0, 20]
                },
                {
                    text: `Period: ${period.toUpperCase()}     Date: ${date}`,
                    style: 'subheader',
                    margin: [0, 0, 0, 10]
                },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', 'auto'],
                        body: tableData
                    },
                    layout: 'lightHorizontalLines',
                    margin: [0, 0, 0, 20]
                },
                chartImage
                    ? {
                        image: chartImage,
                        width: 500,
                        alignment: 'center',
                        margin: [0, 10, 0, 0]
                    }
                    : { text: 'No chart available', italics: true }
            ],
            styles: {
                header: {
                    fontSize: 18,
                    bold: true
                },
                subheader: {
                    fontSize: 12,
                    bold: true
                }
            },
            defaultStyle: {
                font: 'Roboto'
            }
        };
    
        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        pdfDoc.pipe(fs.createWriteStream(filePath));
        pdfDoc.end();
    
        console.log(`📄 Report PDF esportato: ${filePath}`);
    }
    

}

module.exports = ExportUtils;