class Report {
    constructor(id, project_id = 1, total_hours = 0, startDate, endDate) {
        this.validateId(id);
        this.validateProjectId(project_id);
        this.validateTotalHours(total_hours);
        this.validateDateRange(startDate, endDate);

        this.id = id;
        this.project_id = project_id;
        this.total_hours = total_hours;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    update(fields) {
        if (fields.project_id !== undefined) {
            this.validateProjectId(fields.project_id);
            this.project_id = fields.project_id;
        }
        if (fields.total_hours !== undefined) {
            this.validateTotalHours(fields.total_hours);
            this.total_hours = fields.total_hours;
        }
        if (fields.startDate !== undefined) {
            this.validateDate(fields.startDate);
            if (this.endDate && new Date(fields.startDate) >= new Date(this.endDate)) {
                throw new Error('Invalid endDate');
            }
            this.startDate = fields.startDate;
        }
        if (fields.endDate !== undefined) {
            this.validateDate(fields.endDate);
            if (this.startDate && new Date(this.startDate) >= new Date(fields.endDate)) {
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
            startDate: this.startDate || null,
            endDate: this.endDate || null
        };
    }

    static createFromDbRow(row) {
        if (!row || typeof row !== 'object') {
            throw new Error('Invalid database row');
        }
        return new Report(
            row.id || null,
            row.project_id || null,
            row.total_hours || null,
            row.startDate || null,
            row.endDate || null
        );
    }

    validateId(id) {
        if (!Number.isInteger(id) || id <= 0) {
            throw new Error('Invalid id');
        }
    }

    validateProjectId(project_id) {
        if (!Number.isInteger(project_id) || project_id <= 0) {
            throw new Error('Invalid project_id');
        }
    }

    validateTotalHours(total_hours) {
        if (!Number.isInteger(total_hours) || total_hours < 0) {
            throw new Error('Invalid total_hours');
        }
    }

    validateDate(dateString) {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateString.match(regex)) {
            throw new Error('Invalid date format');
        }
        const date = new Date(dateString);
        const timestamp = date.getTime();
        if (typeof timestamp !== 'number' || Number.isNaN(timestamp)) {
            throw new Error('Invalid date');
        }
        if (dateString !== date.toISOString().split('T')[0]) {
            throw new Error('Invalid date');
        }
    }

    validateDateRange(startDate, endDate) {
        if (startDate !== undefined) {
            this.validateDate(startDate);
        }
        if (endDate !== undefined) {
            this.validateDate(endDate);
        }
        if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
            throw new Error('Invalid date range');
        }
    }
}

module.exports = Report;