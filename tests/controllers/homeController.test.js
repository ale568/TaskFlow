const homeController = require('../../renderer/controllers/homeController');
const Activity = require('../../renderer/models/activity');
const Project = require('../../renderer/models/project');

describe('Home Controller', () => {

    let project1, project2, activity1, activity2, activity3;

    beforeEach(() => {

        project1 = new Project('Project1');
        project2 = new Project('Project2');

        activity1 = new Activity('Task1', 100, 'Project1');
        activity2 = new Activity('Task2', 200, 'Project1');
        activity3 = new Activity('Task3', 600, 'Project2');

        project1.addActivity(activity1);
        project1.addActivity(activity2);
        project2.addActivity(activity3);
    });

    test('It should load recent activities', () => {
        const recentactivities = homeController.getRecentActivities([project1, project2]);
        expect(recentactivities.legth).toBe(3);
        expect(recentactivities).toContain(activity1);
        expect(recentactivities).toContain(activity2);
        expect(recentactivities).toContain(activity3);
    });

    test('It should get recent projects', () => {
        const activeProjects = homeController.getActiveProjects([project1, project2]);
        expect(activeProjects.length).toBe(2);
        expect(activeProjects).toContain(project1);
        expect(activeProjects).toContain(project2);
    });
});