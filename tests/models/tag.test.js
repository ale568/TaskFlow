const Tag = require('../../renderer/models/tag');
const dbUtils = require('../../renderer/utils/dbUtils');

describe('Tag Model - Database Integration', () => {
    
    beforeAll(async () => {
        await dbUtils.runQuery("DELETE FROM tags");  // Pulisce la tabella prima dei test
    });

    test('It should create a new tag in the database', async () => {
        const newTag = await Tag.createTag('Urgent', '#FF0000');
        expect(newTag).toBeInstanceOf(Tag);
        expect(newTag.name).toBe('Urgent');
        expect(newTag.color).toBe('#FF0000');

        // Verifica che esista nel database
        const tags = await Tag.loadAllTags();
        expect(tags.length).toBe(1);
        expect(tags[0].name).toBe('Urgent');
    });

    test('It should update an existing tag', async () => {
        const tagToUpdate = (await Tag.loadAllTags())[0];
        const updatedTag = await Tag.updateTag(tagToUpdate.id, 'High Priority', '#FFA500');

        expect(updatedTag).toBeInstanceOf(Tag);
        expect(updatedTag.name).toBe('High Priority');
        expect(updatedTag.color).toBe('#FFA500');

        // Verifica l'aggiornamento nel database
        const tags = await Tag.loadAllTags();
        expect(tags[0].name).toBe('High Priority');
    });

    test('It should delete a tag from the database', async () => {
        const tagToDelete = (await Tag.loadAllTags())[0];
        const deletionSuccess = await Tag.deleteTag(tagToDelete.id);

        expect(deletionSuccess).toBe(true);

        // Verifica che non esista più nel database
        const tags = await Tag.loadAllTags();
        expect(tags.length).toBe(0);
    });

    test('It should retrieve all tags from the database', async () => {
        await Tag.createTag('Work', '#00FF00');
        await Tag.createTag('Personal', '#0000FF');

        const tags = await Tag.loadAllTags();
        expect(tags.length).toBe(2);
    });

});
