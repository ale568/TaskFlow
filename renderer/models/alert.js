class Alert {
    constructor(id, title, project_id, type, priority, date, resolved) {
        if (!title) throw new Error('Invalid title');
        if (project_id == null) throw new Error('Invalid project_id');
        if (![0, 1].includes(resolved)) throw new Error('Invalid resolved value');

        this.id = id;
        this.title = title;
        this.project_id = project_id;
        this.type = type;
        this.priority = priority;
        this.date = date;
        this.resolved = resolved;
    }

    update(fields) {
        if (fields.title !== undefined && !fields.title) throw new Error('Invalid title');
        if (fields.project_id !== undefined && fields.project_id == null) throw new Error('Invalid project_id');
        if (fields.resolved !== undefined && ![0, 1].includes(fields.resolved)) throw new Error('Invalid resolved value');

        Object.assign(this, fields);
    }

    toDbObject() {
        return {
            id: this.id,
            title: this.title,
            project_id: this.project_id,
            type: this.type,
            priority: this.priority,
            date: this.date,
            resolved: this.resolved
        };
    }

    static createFromDbRow(row) {
        return new Alert(row.id, row.title, row.project_id, row.type, row.priority, row.date, row.resolved);
    }
}

module.exports = Alert;