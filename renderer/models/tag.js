const dbUtils = require('../utils/dbUtils');

class Tag {
    constructor(id, name, color) {
        if (!name || typeof name !== 'string' || name.trim() === '') {
            throw new Error('Invalid tag name');
        }
        if (!color || typeof color !== 'string' || !/^#[0-9A-F]{6}$/i.test(color)) {
            throw new Error('Invalid tag color');
        }

        this.id = id;
        this.name = name;
        this.color = color;
    }

    static async createTag(name, color) {
        try {
            const query = `INSERT INTO tags (name, color) VALUES (?, ?)`;
            const result = await dbUtils.runQuery(query, [name, color]);

            if (result.success) {
                return new Tag(result.lastInsertRowid, name, color);
            }
            throw new Error('Failed to create tag');
        } catch (error) {
            throw new Error(`Database error: ${error.message}`);
        }
    }

    static async updateTag(id, name, color) {
        try {
            if (!id || typeof id !== 'number' || id <= 0) {
                throw new Error('Invalid tag ID');
            }

            const query = `UPDATE tags SET name = ?, color = ? WHERE id = ?`;
            const result = await dbUtils.runQuery(query, [name, color, id]);

            if (result.changes > 0) {
                return new Tag(id, name, color);
            }
            throw new Error('Tag not found or no changes applied');
        } catch (error) {
            throw new Error(`Database error: ${error.message}`);
        }
    }

    static async deleteTag(id) {
        try {
            if (!id || typeof id !== 'number' || id <= 0) {
                throw new Error('Invalid tag ID');
            }

            const query = `DELETE FROM tags WHERE id = ?`;
            const result = await dbUtils.runQuery(query, [id]);

            return result.changes > 0;
        } catch (error) {
            throw new Error(`Database error: ${error.message}`);
        }
    }

    static async loadAllTags() {
        try {
            const query = `SELECT * FROM tags`;
            const rows = await dbUtils.runQuery(query);

            return rows.length > 0 ? rows.map(row => new Tag(row.id, row.name, row.color)) : [];
        } catch (error) {
            throw new Error(`Database error: ${error.message}`);
        }
    }

    static async getTagById(id) {
        try {
            if (!id || typeof id !== 'number' || id <= 0) {
                throw new Error('Invalid tag ID');
            }

            const query = `SELECT * FROM tags WHERE id = ?`;
            const rows = await dbUtils.runQuery(query, [id]);

            return rows.length > 0 ? new Tag(rows[0].id, rows[0].name, rows[0].color) : null;
        } catch (error) {
            throw new Error(`Database error: ${error.message}`);
        }
    }
}

module.exports = Tag;
