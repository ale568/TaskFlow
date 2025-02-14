const Project = require('../../renderer/models/project');
const Activity = require('../../renderer/models/activity');

describe('Project Model', () => {

    test('It should create a project with a name and an optional description', () => {
        const project1 = new Project('Project Alpha', 'This is a test project');
        const project2 = new Project('Project Beta');

        expect(project1.name).toBe('Project Alpha');
        expect(project1.description).toBe('This is a test project');

        expect(project2.name).toBe('Project Beta');
        expect(project2.description).toBeNull();
    });

    test('It should throw an error if name is missing or empty', () => {
        expect(() => new Project()).toThrow('Project name is required');
        expect(() => new Project('')).toThrow('Project name is required');
    });

    test('It should add an activity to the project', () => {
        const project = new Project('Project Gamma');
        const activity = new Activity(1, 'Design UI', 300);

        project.addActivity(activity);

        expect(project.activities.length).toBe(1);
        expect(project.activities[0]).toBe(activity);
    });

    test('It should calculate the total time of all activities in the project', () => {
        const project = new Project('Project Delta');
        project.addActivity(new Activity(1, 'Task1', 200));
        project.addActivity(new Activity(2, 'Task2', 300));

        expect(project.getTotalTime()).toBe(500);
    });

    test('It should return 0 if there are no activities', () => {
        const project = new Project('Project Epsilon');
        expect(project.getTotalTime()).toBe(0);
    });

    test('It should handle avtivities with undefined or null durations', () => {
        const project = new Project('Project Zeta');
        project.addActivity(new Activity(1, 'Task1', 200));
        project.addActivity(new Activity(2, 'Task2', 0));
        project.addActivity(new Activity(3, 'Task3', 0));

        expect(project.getTotalTime()).toBe(200);
    });
});