const moment = require('moment-timezone');
const DateTimeFormatUtils = require('./dateTimeFormatUtils');

class FilterUtils {
    /**
     * Filters an array of data based on the provided criteria.
     * @param {Array} data - The dataset to filter.
     * @param {Object} filters - An object defining filtering criteria.
     * @returns {Array} - The filtered dataset.
     */
    static applyFilters(data, filters) {
        return data.filter(item => {
            return Object.keys(filters).every(key => {
                if (!filters[key]) return true; // Skip undefined filters
                if (Array.isArray(filters[key])) {
                    return filters[key].includes(item[key]); // Match against an array of values
                }
                if (typeof filters[key] === 'function') {
                    return filters[key](item[key]); // Apply custom function filter
                }
                return item[key] === filters[key]; // Exact match
            });
        });
    }

    /**
     * Predefined filters for Projects.
     * @param {Array} projects - The project dataset.
     * @param {Object} criteria - The filtering criteria.
     * @returns {Array} - The filtered projects.
     */
    static filterProjects(projects, criteria) {
        return this.applyFilters(projects, {
            status: criteria.status || null, // "active", "archived"
            name: criteria.name ? name => name.includes(criteria.name) : null,
        });
    }

    /**
     * Predefined filters for Alerts.
     * @param {Array} alerts - The alerts dataset.
     * @param {Object} criteria - The filtering criteria.
     * @returns {Array} - The filtered alerts.
     */
    static filterAlerts(alerts, criteria) {

        return alerts.filter(alert => {
    
            const matchProject = criteria.project 
                ? Number(alert.project_id) === Number(criteria.project) 
                : true;
    
            const matchPriority = criteria.priority 
                ? alert.priority.trim().toLowerCase() === criteria.priority.trim().toLowerCase() 
                : true;
    
            const matchType = criteria.type 
                ? alert.type.toString().trim().replace(/\s+/g, ' ').toLowerCase() === 
                  criteria.type.toString().trim().replace(/\s+/g, ' ').toLowerCase()
                : true;
            
            const matchDate = criteria.dateRange
                ? moment(alert.date, DateTimeFormatUtils.DATE_FORMATS.ISO, true).isBetween(
                      moment(criteria.dateRange.start, DateTimeFormatUtils.DATE_FORMATS.ISO, true),
                      moment(criteria.dateRange.end, DateTimeFormatUtils.DATE_FORMATS.ISO, true),
                      null,
                      '[]'
                  )
                : true;
    
            return matchProject && matchPriority && matchType && matchDate;
        });
    }    

    /**
     * Predefined filters for Timesheets.
     * @param {Array} timesheets - The timesheet dataset.
     * @param {Object} criteria - The filtering criteria.
     * @returns {Array} - The filtered timesheets.
     */
    static filterTimesheets(timesheets, criteria) {
        return this.applyFilters(timesheets, {
            project: criteria.project || null,
            date: criteria.date
                ? date => new Date(date).toISOString().startsWith(criteria.date)
                : null,
            tag: criteria.tag || null,
        });
    }

    /**
     * Predefined filters for Reports.
     * @param {Array} reports - The reports dataset.
     * @param {Object} criteria - The filtering criteria.
     * @returns {Array} - The filtered reports.
     */
    static filterReports(reports, criteria) {
        return reports.filter(report => {
    
            const rawDate = report.date; // Access date explicitly
    
            if (!rawDate) {
                return false;
            }
    
            const reportDate = moment(rawDate, DateTimeFormatUtils.DATE_FORMATS.ISO, true);
            const startDate = moment(criteria.dateRange.start, DateTimeFormatUtils.DATE_FORMATS.ISO, true);
            const endDate = moment(criteria.dateRange.end, DateTimeFormatUtils.DATE_FORMATS.ISO, true);
    
            return reportDate.isValid() && reportDate.isBetween(startDate, endDate, null, '[]');
        });
    }    
    
}

module.exports = FilterUtils;