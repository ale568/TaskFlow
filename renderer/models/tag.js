const dbUtils = require('../utils/dbUtils');

class Tag {
    constructor(id, name, color) {
        this.id = id;
        this.name = name;
        this.color = color;
    }

    // Carica tutti i tag dal database
    static async loadAllTags() {
        const query = `SELECT * FROM tags`;
        const rows = await dbUtils.runQuery(query);
        return rows.map(row => new Tag(row.id, row.name, row.color));
    }

    // Crea un nuovo tag nel database
    static async createTag(name, color) {
        if (!name || !color) {
            throw new Error("Invalid tag data");
        }

        const query = `INSERT INTO tags (name, color) VALUES (?, ?)`;
        const result = await dbUtils.runQuery(query, [name, color]);

        if (result.success) {
            return new Tag(result.lastInsertRowid, name, color);
        } else {
            throw new Error("Failed to insert tag");
        }
    }

    // Aggiorna un tag esistente nel database
    static async updateTag(id, name, color) {
        if (!id || !name || !color) {
            throw new Error("Invalid tag update data");
        }

        const query = `UPDATE tags SET name = ?, color = ? WHERE id = ?`;
        const result = await dbUtils.runQuery(query, [name, color, id]);

        if (result.success) {
            return new Tag(id, name, color);
        } else {
            throw new Error("Failed to update tag");
        }
    }

    // Cancella un tag dal database
    static async deleteTag(id) {
        if (!id) {
            throw new Error("Invalid tag ID");
        }

        const query = `DELETE FROM tags WHERE id = ?`;
        const result = await dbUtils.runQuery(query, [id]);

        return result.success;
    }
}

module.exports = Tag;
