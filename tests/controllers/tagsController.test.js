const tagsController = require('../../renderer/controllers/tagsController');
const Tag = require('../../renderer/models/tag');

describe('Tags Controller', () => {

    beforeEach(() => {
        tagsController.tags = [];  // Resetta l'array dei tag prima di ogni test
    });
    

    test('It should create a new tag and return it', () => {
        const tag = tagsController.createTag('Urgent', '#FF0000');
        expect(tag).toBeInstanceOf(Tag);
        expect(tag.name).toBe('Urgent');
        expect(tag.color).toBe('#FF0000');
    });

    test('It should retrieve all existing tags', () => {
        tagsController.createTag('Job', '#00FF00');
        tagsController.createTag('Important', '#0000FF');
        const tags = tagsController.getTags();
        expect(tags.length).toBe(2);
        expect(tags[0].name).toBe('Job');
        expect(tags[1].name).toBe('Important');
    });

    test('It should allow updating a tag\'s name', () => {
        const tag = tagsController.createTag('Old Name', '#098765');
        tagsController.updateTagName(tag, 'New Name');
        expect(tag.name).toBe('New Name');
    });

    test('It should allow updating a tag\'s color', () => {
        const tag = tagsController.createTag('Job', '#098765');
        tagsController.updateTagColor(tag, '#123456');
        expect(tag.color).toBe('#123456');
    });

    test('It should delete a tag', () => {
        const tag = tagsController.createTag('Job1', '#FF0000')
        tagsController.deleteTag(tag);
        const tags = tagsController.getTags();
        expect(tags.includes(tags)).toBe(false);
    });
});