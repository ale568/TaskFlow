const Tag = require('../../renderer/models/tag');
const dbUtils = require('../../renderer/utils/dbUtils');

describe('Tag Model - Database Integration', () => {
    beforeAll(async () => {
        await dbUtils.runQuery('DELETE FROM tags'); // Pulizia database prima dei test
    });

    test('It should create a new tag in the database', async () => {
        const newTag = await Tag.createTag('Urgent', '#FF0000');
        expect(newTag).toBeInstanceOf(Tag);
        expect(newTag.name).toBe('Urgent');
        expect(newTag.color).toBe('#FF0000');
    });

    test('It should retrieve a tag by ID', async () => {
        const tag = await Tag.createTag('Work', '#00FF00');
        const fetchedTag = await Tag.getTagById(tag.id);
        expect(fetchedTag).toBeInstanceOf(Tag);
        expect(fetchedTag.name).toBe('Work');
    });

    test('It should return null for a non-existing tag ID', async () => {
        const tag = await Tag.getTagById(99999);
        expect(tag).toBeNull();
    });

    test('It should load all tags from the database', async () => {
        await Tag.createTag('Personal', '#0000FF');
        const tags = await Tag.loadAllTags();
        expect(Array.isArray(tags)).toBe(true);
        expect(tags.length).toBeGreaterThanOrEqual(1);
    });

    test('It should return an empty array if no tags exist', async () => {
        await dbUtils.runQuery('DELETE FROM tags');
        const tags = await Tag.loadAllTags();
        expect(tags).toEqual([]);
    });

    test('It should update an existing tag', async () => {
        const tag = await Tag.createTag('Home', '#FFFF00');
        const updatedTag = await Tag.updateTag(tag.id, 'Updated', '#FFFFFF');
        expect(updatedTag.name).toBe('Updated');
        expect(updatedTag.color).toBe('#FFFFFF');
    });

    test('It should throw an error if updating a non-existing tag', async () => {
        await expect(Tag.updateTag(99999, 'Fake', '#FFFFFF')).rejects.toThrow('Tag not found');
    });

    test('It should delete a tag successfully', async () => {
        const tag = await Tag.createTag('ToDelete', '#123456');
        const deleted = await Tag.deleteTag(tag.id);
        expect(deleted).toBe(true);
    });

    test('It should return false if deleting a non-existing tag', async () => {
        const deleted = await Tag.deleteTag(99999);
        expect(deleted).toBe(false);
    });

    test('It should throw an error if tag name is empty', async () => {
        await expect(Tag.createTag('', '#FFFFFF')).rejects.toThrow('Invalid tag name');
    });

    test('It should throw an error if color format is incorrect', async () => {
        await expect(Tag.createTag('Test', 'red')).rejects.toThrow('Invalid tag color');
    });

    test('It should throw an error if tag ID is invalid', async () => {
        await expect(Tag.getTagById(null)).rejects.toThrow('Invalid tag ID');
    });

    test('It should throw an error if tag ID is negative', async () => {
        await expect(Tag.getTagById(-5)).rejects.toThrow('Invalid tag ID');
    });
});
