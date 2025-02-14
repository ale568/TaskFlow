class Alert {
    constructor(id, title, project_id, type, priority, date, resolved = 0, fromDb = false) {
        // Validazione del titolo
        if (!title) throw new Error('Invalid title');
        // Validazione del project_id
        if (project_id == null || typeof project_id !== 'number') throw new Error('Invalid project_id');
        // Validazione del resolved
        if (!fromDb && ![0, 1].includes(resolved)) throw new Error('Invalid resolved value');
        if (fromDb && resolved !== null && ![0, 1].includes(resolved)) throw new Error('Invalid resolved value');

        this.id = id;
        this.title = title;
        this.project_id = project_id;
        this.type = type;
        this.priority = priority;
        this.date = date;
        this.resolved = resolved;
    }

    update(fields) {
        // Validazione del titolo
        if (fields.title !== undefined && !fields.title) throw new Error('Invalid title');
        // Validazione del project_id
        if (fields.project_id !== undefined && (fields.project_id == null || typeof fields.project_id !== 'number')) throw new Error('Invalid project_id');
        // Validazione del resolved
        if (fields.resolved !== undefined && ![0, 1].includes(fields.resolved)) throw new Error('Invalid resolved value');

        // Mantieni i valori esistenti se un campo è undefined
        this.title = fields.title !== undefined ? fields.title : this.title;
        this.project_id = fields.project_id !== undefined ? fields.project_id : this.project_id;
        this.type = fields.type !== undefined ? fields.type : this.type;
        this.priority = fields.priority !== undefined ? fields.priority : this.priority;
        this.date = fields.date !== undefined ? fields.date : this.date;
        this.resolved = fields.resolved !== undefined ? fields.resolved : this.resolved;
    }

    toDbObject() {
        return {
            id: this.id,
            title: this.title,
            project_id: this.project_id,
            type: this.type,
            priority: this.priority,
            date: this.date,
            resolved: this.resolved !== undefined ? this.resolved : 0
        };
    }

    static createFromDbRow(row) {
        // Imposta resolved a null se è null o mancante nei dati del database
        const resolved = row.resolved !== undefined && row.resolved !== null ? row.resolved : null;
        return new Alert(row.id, row.title, row.project_id, row.type, row.priority, row.date, resolved, true);
    }
}

module.exports = Alert;