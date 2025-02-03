const Tag = require('../models/tag');

class TagsController {
    constructor() {
        this.tags = [];
        this.nextId = 1;
    }

    createTag(name, color) {
        const tag = new Tag(this.nextId++, name, color);
        this.tags.push(tag);
        return tag;
    }

    getTags() {
        return this.tags;
    }

    updateTagName(tag, newName) {
        const foundTag = this.tags.find(t => t.id === tag.id);
        if (foundTag) {
            foundTag.name = newName;
        }
    }

    updateTagColor(tag, newColor) {
        const foundTag = this.tags.find(t => t.id === tag.id);
        if (foundTag) {
            foundTag.color = newColor;
        }
    }

    deleteTag(tag) {
        this.tags = this.tags.filter(t => t.id !== tag.id);
    }
}

module.exports = new TagsController();