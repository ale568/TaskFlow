const Project = require('../renderer/models/project');
const Activity = require('../renderer/models/activity');

describe('Project', () => {

    test('It should create a project with a name and a description.', () => {
            const project = new Project('Project X', 'Project\'s description');
            expect(project.name).toBe('Project X');
            expect(project.description).toBe('Project\'s description');
    });

    test('It should create a project with a optional description', () => {
            const project = new Project('Project Y');
            expect(project.name).toBe('Project Y');
            expect(project.description).toBe(null);
    });

    test('It should initially have an empty task list', () => {
            const project = new Project('Project Z');
            expect(project.activities).toEqual([]);
    });

    test('It should allow to add an activity to the project', () => {
            const project = new Project('Project T');
            const activity = new Activity('Write a report', 300);
            project.addActivity(activity);
            expect(project.activities.length).toBe(1);
            expect(project.activities[0]).toBe(activity);
    });

    test('It should calculate the total time of the tasks', () => {
            const project = new Project('Project X');
            project.addActivity(new Activity('Write a report', 300));
            project.addActivity(new Activity('Meeting', 400));
            expect(project.getTotalTime()).toBe(700);
    });
});