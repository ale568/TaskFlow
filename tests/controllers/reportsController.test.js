const reportsController = require('../../renderer/controllers/reportsController');
const Project = require('../../renderer/models/project');
const Activity = require('../../renderer/models/activity');
const Tag = require('../../renderer/models/tag');

describe('Reports Controller', () => {

    let project1, project2, activity1, activity2, activity3;

    beforeEach(() => {      // Create some test projects and activities

        project1 = new Project('Project1');
        project2 = new Project('Project2');

        activity1 = new Activity('Task1', 200, 'Project1');
        activity2 = new Activity('Task2', 350, 'Project1');
        activity3 = new Activity('Task3', 400, 'Project2');

        project1.addActivity(activity1);
        project1.addActivity(activity2);
        project2.addActivity(activity3);
    });


    test('It should generate a total time report per project', () => {
        const report = reportsController.getTotalTimeProject([project1, project2]);
        expect(report['Project1']).toBe(550);
        expect(report['Project2']).toBe(400);
    });

    test('It should filter activities for a specific project', () => {
        const filteredActivities = reportsController.getActivitiesByProject('Project1', [project1, project2]);
        expect(filteredActivities.length).toBe(2);
        expect(filteredActivities).toContain(activity1);
        expect(filteredActivities).toContain(activity2);
    });

    test('It should filter activities for a specific tag', () => {
        const tag = new Tag(1, 'Urgent', '#FF0000');
        activity1.tag = tag;
        activity3.tag = tag;

        const filteredActivities = reportsController.getActivitiesByTag(tag, [project1, project2]);
        expect(filteredActivities.length).toBe(2);
        expect(filteredActivities).toContain(activity1);
        expect(filteredActivities).toContain(activity3);
    });
});