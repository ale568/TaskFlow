const projectController = require('../../renderer/controllers/projectsController');
const Project = require('../../renderer/models/project');
const Activity = require('../../renderer/models/activity');

describe('Projects Controller', () => {

    test('It should create a project and return it', () => {
        const project = projectController.createProject('Test Project', 'Test Description');
        expect(project).toBeInstanceOf(Project);
        expect(project.name).toBe('Test Project');
        expect(project.description).toBe('Test Description');
    });

    test('It should add an activity to a project', () => {
        const project = new Project('Test Project');
        const activity = new Activity('Coding', 500);
        projectController.addActivityToProject(project, activity);
        expect(project.activities.length).toBe(1);
        expect(project.activities[0]).toBe(activity);
    });

    test('It should calculate the total time\'s project', () => {
        const project = new Project('Test Project');
        projectController.addActivityToProject(project, new Activity('Coding', 400));
        projectController.addActivityToProject(project, new Activity('Meeting', 400));
        const totalTime = projectController.getProjectTotalTime(project);
        expect(totalTime).toBe(800);
    });
});