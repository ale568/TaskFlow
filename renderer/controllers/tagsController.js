const fs = require('fs');
const path = require('path');
const Tag = require('../models/tag');

const LOG_FILE = path.resolve(__dirname, '../../logs/controllers.log');

/**
 * Logs messages to a file instead of the terminal.
 * @param {string} message - The log message.
 */
function logToFile(message) {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(LOG_FILE, `[${timestamp}] ${message}\n`);
}

/**
 * Controller for managing tags.
 * Handles CRUD operations for tags.
 */
class TagsController {
    /**
     * Creates a new tag.
     * @param {string} name - The name of the tag.
     * @param {string} color - The color associated with the tag.
     * @returns {Promise<number>} The ID of the newly created tag.
     */
    static async createTag(name, color) {
        try {
            return await Tag.createTag(name, color);
        } catch (error) {
            logToFile(`❌ Error creating tag: ${error.message}`);
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
            return await Tag.getTagById(tagId);
        } catch (error) {
            logToFile(`❌ Error retrieving tag: ${error.message}`);
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
            return await Tag.updateTag(tagId, updates);
        } catch (error) {
            logToFile(`❌ Error updating tag: ${error.message}`);
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
            return await Tag.deleteTag(tagId);
        } catch (error) {
            logToFile(`❌ Error deleting tag: ${error.message}`);
            throw new Error('Failed to delete tag');
        }
    }

    /**
     * Retrieves all tags.
     * @returns {Promise<Array>} An array of all tags.
     */
    static async getAllTags() {
        try {
            return await Tag.getAllTags();
        } catch (error) {
            logToFile(`❌ Error retrieving tags: ${error.message}`);
            throw new Error('Failed to retrieve tags');
        }
    }
}

module.exports = TagsController;