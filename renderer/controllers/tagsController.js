const Tag = require('../models/tag');
const loggingUtils = require('../utils/loggingUtils');

class TagsController {
    /**
     * Creates a new tag.
     * @param {string} name - The name of the tag.
     * @param {string} color - The color associated with the tag.
     * @returns {Promise<number>} The ID of the newly created tag.
     */
    static async createTag(name, color) {
        try {
            const tagId = await Tag.createTag(name, color);
            loggingUtils.logMessage('info', `Tag created: ${name}`, 'CONTROLLERS');
            return tagId;
        } catch (error) {
            loggingUtils.logMessage('error', `Error creating tag: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to create tag');
        }
    }

    /**
     * Retrieves a tag by ID.
     * @param {number} tagId - The ID of the tag.
     * @returns {Promise<Object|null>} The tag object or null if not found.
     */
    static async getTagById(tagId) {
        try {
            const tag = await Tag.getTagById(tagId);
            if (!tag) {
                loggingUtils.logMessage('warn', `Tag not found: ID ${tagId}`, 'CONTROLLERS');
            }
            return tag;
        } catch (error) {
            loggingUtils.logMessage('error', `Error retrieving tag: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to retrieve tag');
        }
    }

    /**
     * Updates an existing tag.
     * @param {number} tagId - The ID of the tag.
     * @param {Object} updates - The updated fields (e.g., name, color).
     * @returns {Promise<boolean>} True if the update was successful, false otherwise.
     */
    static async updateTag(tagId, updates) {
        try {
            const success = await Tag.updateTag(tagId, updates);
            loggingUtils.logMessage('info', `Tag updated: ID ${tagId}`, 'CONTROLLERS');
            return success;
        } catch (error) {
            loggingUtils.logMessage('error', `Error updating tag: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to update tag');
        }
    }

    /**
     * Deletes a tag.
     * @param {number} tagId - The ID of the tag to delete.
     * @returns {Promise<boolean>} True if the deletion was successful.
     */
    static async deleteTag(tagId) {
        try {
            const success = await Tag.deleteTag(tagId);
            loggingUtils.logMessage('info', `Tag deleted: ID ${tagId}`, 'CONTROLLERS');
            return success;
        } catch (error) {
            loggingUtils.logMessage('error', `Error deleting tag: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to delete tag');
        }
    }

    /**
     * Retrieves all tags.
     * @returns {Promise<Array>} An array of all tags.
     */
    static async getAllTags() {
        try {
            const tags = await Tag.getAllTags();
            loggingUtils.logMessage('info', `Retrieved ${tags.length} tags`, 'CONTROLLERS');
            return tags;
        } catch (error) {
            loggingUtils.logMessage('error', `Error retrieving tags: ${error.message}`, 'CONTROLLERS');
            throw new Error('Failed to retrieve tags');
        }
    }

    static async isTagInUse(tagId) {
        try {
            const inUse = await Tag.isTagInUse(tagId);
            loggingUtils.logMessage('info', `Verifica utilizzo tag ID ${tagId}: ${inUse}`, 'CONTROLLERS');
            return inUse;
        } catch (error) {
            loggingUtils.logMessage('error', `Errore nella verifica utilizzo tag: ${error.message}`, 'CONTROLLERS');
            throw new Error('Errore durante la verifica utilizzo tag');
        }
    }
    
}

module.exports = TagsController;