const storageUtils = require('../utils/storageUtils');
const dbUtils = require('../utils/dbUtils');

class Tag {
    // static dbName = 'taskflow_test_tags.sqlite'; // Default test database
    static dbName = 'taskflow.sqlite';

    /**
     * Sets the database to use (for test or production environments).
     * @param {string} databaseName - The database file name.
     */
    static setDatabase(databaseName) {
        this.dbName = databaseName;
    }

    /**
     * Creates a new tag entry in the database.
     * @param {string} name - The name of the tag.
     * @param {string} color - The color associated with the tag.
     * @returns {Promise<number>} The ID of the newly created tag.
     */
    static async createTag(name, color) {
        return await storageUtils.createRecord('tags', { name, color }, this.dbName);
    }

    /**
     * Retrieves a tag by ID.
     * @param {number} tagId - The ID of the tag.
     * @returns {Promise<Object|null>} The tag object or null if not found.
     */
    static async getTagById(tagId) {
        return await storageUtils.getRecordById('tags', tagId, this.dbName);
    }

    /**
     * Updates a tag entry in the database.
     * @param {number} tagId - The ID of the tag.
     * @param {Object} updates - An object containing the fields to update.
     * @returns {Promise<boolean>} True if the update was successful, false otherwise.
     */
    static async updateTag(tagId, updates) {
        return await storageUtils.updateRecord('tags', tagId, updates, this.dbName);
    }

    /**
     * Deletes a tag from the database.
     * @param {number} tagId - The ID of the tag.
     * @returns {Promise<boolean>} True if the deletion was successful, false otherwise.
     */
    static async deleteTag(tagId) {
        return await storageUtils.deleteRecord('tags', tagId, this.dbName);
    }

    /**
     * Retrieves all tags from the database.
     * @returns {Promise<Array>} An array of all tags.
     */
    static async getAllTags() {
        return await storageUtils.getAllRecords('tags', this.dbName);
    }

    static async isTagInUse(tagId) {
        const query = `SELECT COUNT(*) as count FROM time_entries WHERE tag_id = ?`;
    
        try {
            const result = await dbUtils.runQuery(query, [tagId]);
    
            // Poiché runQuery per SELECT ritorna un array
            const count = result?.[0]?.count || 0;
            return count > 0;
        } catch (error) {
            console.error("Errore nella verifica uso tag:", error);
            throw new Error("Errore durante la verifica dell'utilizzo del tag");
        }
    }    
}

module.exports = Tag;