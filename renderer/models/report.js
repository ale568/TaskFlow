class Report {
    constructor(id, project_id, total_hours, startDate, endDate) {
        if (!Number.isInteger(id) || id <= 0) {
            throw new Error('Invalid id');
        }
        if (!Number.isInteger(project_id) || project_id <= 0) {
            throw new Error('Invalid project_id');
        }
        if (!Number.isInteger(total_hours) || total_hours < 0) {
            throw new Error('Invalid total_hours');
        }
        if (!this.isValidDate(startDate) || !this.isValidDate(endDate) || new Date(startDate) >= new Date(endDate)) {
            throw new Error('Invalid date range');
        }

        this.id = id;
        this.project_id = project_id;
        this.total_hours = total_hours;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    update(fields) {
        if (fields.project_id !== undefined) {
            if (!Number.isInteger(fields.project_id) || fields.project_id <= 0) {
                throw new Error('Invalid project_id');
            }
            this.project_id = fields.project_id;
        }
        if (fields.total_hours !== undefined) {
            if (!Number.isInteger(fields.total_hours) || fields.total_hours < 0) {
                throw new Error('Invalid total_hours');
            }
            this.total_hours = fields.total_hours;
        }
        if (fields.startDate !== undefined) {
            if (!this.isValidDate(fields.startDate) || new Date(fields.startDate) >= new Date(this.endDate)) {
                throw new Error('Invalid startDate');
            }
            this.startDate = fields.startDate;
        }
        if (fields.endDate !== undefined) {
            if (!this.isValidDate(fields.endDate) || new Date(this.startDate) >= new Date(fields.endDate)) {
                throw new Error('Invalid endDate');
            }
            this.endDate = fields.endDate;
        }
    }

    toDbObject() {
        return {
            id: this.id,
            project_id: this.project_id,
            total_hours: this.total_hours,
            startDate: this.startDate,
            endDate: this.endDate
        };
    }

    static createFromDbRow(row) {
        return new Report(row.id, row.project_id, row.total_hours, row.startDate, row.endDate);
    }

    isValidDate(dateString) {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateString.match(regex)) return false;
        const date = new Date(dateString);
        const timestamp = date.getTime();
        if (typeof timestamp !== 'number' || Number.isNaN(timestamp)) return false;
        return dateString === date.toISOString().split('T')[0];
    }
}

module.exports = Report;