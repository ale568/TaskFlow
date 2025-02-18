const storageUtils = require('../utils/storageUtils');

class Tag {
    constructor(id, name, color) {
        this.id = id;
        this.name = name;
        this.color = color;
    }

    static async createTag(name, color) {
        const tagData = await storageUtils.createTag(name, color);
        return tagData ? new Tag(...Object.values(tagData)) : null;
    }

    static async getTagById(tagId) {
        const tagData = await storageUtils.getTagById(tagId);
        return tagData ? new Tag(...Object.values(tagData)) : null;
    }

    static async getAllTags() {
        const tags = await storageUtils.getAllTags();
        return tags.map(data => new Tag(...Object.values(data)));
    }

    static async updateTag(id, updates) {
        return await storageUtils.updateTag(id, updates);
    }

    static async deleteTag(id) {
        return await storageUtils.deleteTag(id);
    }
}

module.exports = Tag;
