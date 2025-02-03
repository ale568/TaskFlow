const Tag = require('../../renderer/models/tag');

describe('Tag', () => {

    test('It should create a tag with an id, a name and a color', () => {
        const tag = new Tag(1, 'Urgent', '#FF0000');
        expect(tag.id).toBe(1);
        expect(tag.name).toBe('Urgent');
        expect(tag.color).toBe('#FF0000');
    });

    test('It should throw an error if the name is an empty string', () => {
        expect(() => new Tag(2, '', '#FF0000')).toThrow('Tag\'s name cannot be empty');
    });

    test('It should throw an error if the color is not a valid hexadecimal format', () => {
        expect(() => new Tag(3, 'Important', 'red')).toThrow('Color\'s format is not valid');
    });

    test('It should allow to change tag\'s name', () => {
        const tag = new Tag(4, 'Job', '#00FF00');
        tag.setName('Research');
        expect(tag.name).toBe('Research');
    });

    test('It should allow to change tag\'s color', () => {
        const tag = new Tag(5, 'Job', '#00FF00');
        tag.setColor('#0000FF');
        expect(tag.color).toBe('#0000FF');
    });
});