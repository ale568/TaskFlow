const TagsController = require('../../renderer/controllers/tagsController');
const Tag = require('../../renderer/models/tag');
const dbUtils = require('../../renderer/utils/dbUtils');
const loggingUtils = require('../../renderer/utils/loggingUtils');

jest.mock('../../renderer/utils/loggingUtils');

describe('TagsController - Database Operations', () => {
    beforeAll(async () => {
        Tag.setDatabase('taskflow_test_tags.sqlite'); // Set the dedicated test database
        dbUtils.connect('taskflow_test_tags.sqlite'); // Connect to the test database
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('It should create and retrieve a tag with logging', async () => {
        const uniqueTagName = `Test Tag ${Date.now()}`;
        const spy = jest.spyOn(Tag, 'createTag');

        const tagId = await TagsController.createTag(uniqueTagName, '#FF5733');

        expect(spy).toHaveBeenCalledWith(uniqueTagName, '#FF5733');
        expect(tagId).toBeDefined();
        expect(loggingUtils.logMessage).toHaveBeenCalledWith('info', expect.stringContaining('Tag created'), 'CONTROLLERS');

        const tag = await TagsController.getTagById(tagId);
        expect(tag).not.toBeNull();
        expect(tag.name).toBe(uniqueTagName);
        expect(tag.color).toBe('#FF5733');

        spy.mockRestore();
    });

    test('It should update a tag with logging', async () => {
        const uniqueTagName = `Updatable Tag ${Date.now()}`;
        const tagId = await TagsController.createTag(uniqueTagName, '#00FF00');

        const spy = jest.spyOn(Tag, 'updateTag');
        const updated = await TagsController.updateTag(tagId, { color: '#0000FF' });

        expect(spy).toHaveBeenCalledWith(tagId, { color: '#0000FF' });
        expect(updated.success).toBeTruthy();
        expect(loggingUtils.logMessage).toHaveBeenCalledWith('info', expect.stringContaining('Tag updated'), 'CONTROLLERS');

        spy.mockRestore();
    });

    test('It should delete a tag with logging', async () => {
        const uniqueTagName = `Tag To Delete ${Date.now()}`;
        const tagId = await TagsController.createTag(uniqueTagName, '#123456');

        const spy = jest.spyOn(Tag, 'deleteTag');
        const deleted = await TagsController.deleteTag(tagId);

        expect(spy).toHaveBeenCalledWith(tagId);
        expect(deleted).toBeTruthy();
        expect(loggingUtils.logMessage).toHaveBeenCalledWith('info', expect.stringContaining('Tag deleted'), 'CONTROLLERS');

        spy.mockRestore();
    });

    test('It should log a warning when retrieving a non-existing tag', async () => {
        const spy = jest.spyOn(Tag, 'getTagById');
        const tag = await TagsController.getTagById(99999);

        expect(spy).toHaveBeenCalledWith(99999);
        expect(tag).toBeNull();
        expect(loggingUtils.logMessage).toHaveBeenCalledWith('warn', expect.stringContaining('Tag not found'), 'CONTROLLERS');

        spy.mockRestore();
    });

    test('It should log an error when failing to create a tag', async () => {
        Tag.createTag = jest.fn().mockRejectedValue(new Error('Database error'));

        await expect(TagsController.createTag('', '#FFFFFF')).rejects.toThrow('Failed to create tag');
        expect(loggingUtils.logMessage).toHaveBeenCalledWith('error', expect.stringContaining('Error creating tag'), 'CONTROLLERS');
    });

    test('It should log an error when failing to retrieve tags', async () => {
        Tag.getAllTags = jest.fn().mockRejectedValue(new Error('Database error'));

        await expect(TagsController.getAllTags()).rejects.toThrow('Failed to retrieve tags');
        expect(loggingUtils.logMessage).toHaveBeenCalledWith('error', expect.stringContaining('Error retrieving tags'), 'CONTROLLERS');
    });

    test('It should log an error when failing to update a tag', async () => {
        Tag.updateTag = jest.fn().mockRejectedValue(new Error('Database error'));

        await expect(TagsController.updateTag(99999, { color: '#ABCDEF' })).rejects.toThrow('Failed to update tag');
        expect(loggingUtils.logMessage).toHaveBeenCalledWith('error', expect.stringContaining('Error updating tag'), 'CONTROLLERS');
    });

    test('It should log an error when failing to delete a tag', async () => {
        Tag.deleteTag = jest.fn().mockRejectedValue(new Error('Database error'));

        await expect(TagsController.deleteTag(99999)).rejects.toThrow('Failed to delete tag');
        expect(loggingUtils.logMessage).toHaveBeenCalledWith('error', expect.stringContaining('Error deleting tag'), 'CONTROLLERS');
    });

    afterAll(async () => {
        dbUtils.close();
    });
});