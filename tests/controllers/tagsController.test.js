const TagsController = require('../../renderer/controllers/tagsController');
const Tag = require('../../renderer/models/tag');
const dbUtils = require('../../renderer/utils/dbUtils');

describe('TagsController - Database Operations', () => {
    beforeAll(async () => {
        Tag.setDatabase('taskflow_test_tags.sqlite'); // Set the dedicated test database
        dbUtils.connect('taskflow_test_tags.sqlite'); // Connect to the test database
    });

    test('It should create and retrieve a tag', async () => {
        const uniqueTagName = `Test Tag ${Date.now()}`;
        const spy = jest.spyOn(Tag, 'createTag');

        const tagId = await TagsController.createTag(uniqueTagName, '#FF5733');

        expect(spy).toHaveBeenCalledWith(uniqueTagName, '#FF5733');
        expect(tagId).toBeDefined();

        const tag = await TagsController.getTagById(tagId);
        expect(tag).not.toBeNull();
        expect(tag.name).toBe(uniqueTagName);
        expect(tag.color).toBe('#FF5733');

        spy.mockRestore();
    });

    test('It should update a tag', async () => {
        const uniqueTagName = `Updatable Tag ${Date.now()}`;
        const tagId = await TagsController.createTag(uniqueTagName, '#00FF00');

        const spy = jest.spyOn(Tag, 'updateTag');
        const updated = await TagsController.updateTag(tagId, { color: '#0000FF' });

        expect(spy).toHaveBeenCalledWith(tagId, { color: '#0000FF' });
        expect(updated.success).toBeTruthy();

        const updatedTag = await TagsController.getTagById(tagId);
        expect(updatedTag.color).toBe('#0000FF');

        spy.mockRestore();
    });

    test('It should delete a tag', async () => {
        const uniqueTagName = `Tag To Delete ${Date.now()}`;
        const tagId = await TagsController.createTag(uniqueTagName, '#123456');

        const spy = jest.spyOn(Tag, 'deleteTag');
        const deleted = await TagsController.deleteTag(tagId);

        expect(spy).toHaveBeenCalledWith(tagId);
        expect(deleted).toBeTruthy();

        const deletedTag = await TagsController.getTagById(tagId);
        expect(deletedTag).toBeNull();

        spy.mockRestore();
    });

    test('It should return null for a non-existing tag', async () => {
        const spy = jest.spyOn(Tag, 'getTagById');
        const tag = await TagsController.getTagById(99999);

        expect(spy).toHaveBeenCalledWith(99999);
        expect(tag).toBeNull();

        spy.mockRestore();
    });

    test('It should return false when updating a non-existing tag', async () => {
        const spy = jest.spyOn(Tag, 'updateTag');
        const result = await TagsController.updateTag(99999, { color: '#ABCDEF' });

        expect(spy).toHaveBeenCalledWith(99999, { color: '#ABCDEF' });
        expect(result.success).toBeFalsy();

        spy.mockRestore();
    });

    test('It should return false when deleting a non-existing tag', async () => {
        const spy = jest.spyOn(Tag, 'deleteTag');
        const result = await TagsController.deleteTag(99999);

        expect(spy).toHaveBeenCalledWith(99999);
        expect(result).toBeFalsy();

        spy.mockRestore();
    });

    test('It should retrieve all tags', async () => {
        const uniqueTagNameA = `Tag A ${Date.now()}`;
        const uniqueTagNameB = `Tag B ${Date.now()}`;

        await TagsController.createTag(uniqueTagNameA, '#F1C40F');
        await TagsController.createTag(uniqueTagNameB, '#9B59B6');

        const spy = jest.spyOn(Tag, 'getAllTags');
        const tags = await TagsController.getAllTags();

        expect(spy).toHaveBeenCalled();
        expect(tags.length).toBeGreaterThanOrEqual(2);

        spy.mockRestore();
    });

    test('It should handle errors when creating a tag with an invalid name', async () => {
        const spy = jest.spyOn(Tag, 'createTag').mockImplementation(() => {
            throw new Error('Invalid tag name');
        });

        await expect(TagsController.createTag('', '#FFFFFF'))
            .rejects.toThrow('Failed to create tag');

        spy.mockRestore();
    });

    test.skip('It should handle database connection failure gracefully', async () => {
        dbUtils.close(); // Simulate database connection failure
    
        await new Promise(resolve => setTimeout(resolve, 300)); // Ensure disconnection
    
        let errorCaught = false;
        try {
            await TagsController.createTag('Database Fail Tag', '#FFFFFF');
        } catch (error) {
            errorCaught = true;
        }

        expect(errorCaught).toBeTruthy(); // Ensure an error was caught

        dbUtils.connect('taskflow_test_tags.sqlite'); // Restore database connection for further tests
    });

    afterAll(async () => {
        dbUtils.close();
    });
});