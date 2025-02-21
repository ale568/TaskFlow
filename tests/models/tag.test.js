const Tag = require('../../renderer/models/tag');
const dbUtils = require('../../renderer/utils/dbUtils');

describe('Tag Model - Database Operations', () => {
    beforeAll(async () => {
        Tag.setDatabase('taskflow_test_tags.sqlite'); // Set the dedicated test database
        dbUtils.connect('taskflow_test_tags.sqlite'); // Connect to the test database
        dbUtils.resetDatabase(); // Reset the database before running tests
    });

    beforeEach(async () => {
        await new Promise(resolve => setTimeout(resolve, 100)); // Prevent race conditions
    });

    test('It should create and retrieve a tag', async () => {
        const tagId = await Tag.createTag('Important', '#FF5733');

        expect(tagId).toBeDefined();
        const tag = await Tag.getTagById(tagId);
        expect(tag).not.toBeNull();
        expect(tag.name).toBe('Important');
        expect(tag.color).toBe('#FF5733');
    });

    test('It should update a tag', async () => {
        const tagId = await Tag.createTag('To Update', '#123456');

        const updated = await Tag.updateTag(tagId, { name: 'Updated Tag' });
        expect(updated.success).toBeTruthy();

        const updatedTag = await Tag.getTagById(tagId);
        expect(updatedTag.name).toBe('Updated Tag');
    });

    test('It should delete a tag', async () => {
        const tagId = await Tag.createTag('To Delete', '#654321');

        const deleted = await Tag.deleteTag(tagId);
        expect(deleted).toBeTruthy();

        const deletedTag = await Tag.getTagById(tagId);
        expect(deletedTag).toBeNull();
    });

    test('It should return null for a non-existing tag', async () => {
        const tag = await Tag.getTagById(99999);
        expect(tag).toBeNull();
    });

    test('It should return false when updating a non-existing tag', async () => {
        const result = await Tag.updateTag(99999, { name: 'Non-existent Tag' });
        expect(result.success).toBeFalsy();
    });

    test('It should return false when deleting a non-existing tag', async () => {
        const result = await Tag.deleteTag(99999);
        expect(result).toBeFalsy();
    });

    test('It should retrieve all tags', async () => {
        await Tag.createTag('Tag A', '#A1B2C3');
        await Tag.createTag('Tag B', '#D4E5F6');

        const tags = await Tag.getAllTags();
        expect(tags.length).toBeGreaterThanOrEqual(2);
    });

    afterAll(async () => {
        dbUtils.close();
    });
});