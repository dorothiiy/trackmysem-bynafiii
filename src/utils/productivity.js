import { differenceInDays, isPast, isToday, isTomorrow } from 'date-fns';

/**
 * Calculates priority score for a task
 * @param {Object} task 
 * @returns {Number} Score (higher is more urgent)
 */
export const calculatePriorityScore = (task) => {
    let score = 0;
    const daysUntilDue = differenceInDays(new Date(task.dueDate), new Date());

    // Due date factor
    if (daysUntilDue < 0) score += 100; // Overdue
    else if (daysUntilDue === 0) score += 80; // Due today
    else if (daysUntilDue <= 2) score += 60; // Due soon
    else if (daysUntilDue <= 7) score += 40; // Due this week
    else score += 10;

    // Priority flag factor
    if (task.priority === 'high') score += 50;
    if (task.priority === 'medium') score += 20;

    // Type factor
    if (task.type === 'exam') score += 30;
    if (task.type === 'assignment') score += 20;

    return score;
};

/**
 * Sorts tasks by calculated priority
 * @param {Array} tasks 
 * @returns {Array} Sorted tasks
 */
export const getSortedTasks = (tasks) => {
    return [...tasks].sort((a, b) => calculatePriorityScore(b) - calculatePriorityScore(a));
};

/**
 * Computes health status for a subject
 * @param {Object} subject 
 * @param {Array} subjectTasks 
 * @returns {String} 'On Track', 'At Risk', or 'Behind'
 */
export const computeSubjectHealth = (subject, subjectTasks = []) => {
    const overdueTasks = subjectTasks.filter(t =>
        !t.isCompleted && isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate))
    );

    if (overdueTasks.length >= 2) return 'Behind';
    if (overdueTasks.length === 1) return 'At Risk';

    // Check specific high priority tasks due soon
    const urgentTasks = subjectTasks.filter(t =>
        !t.isCompleted && t.priority === 'high' && differenceInDays(new Date(t.dueDate), new Date()) <= 2
    );

    if (urgentTasks.length > 2) return 'At Risk';

    return 'On Track';
};

/**
 * Formats a due date for display
 * @param {String} dateString 
 * @returns {String} formatted string (e.g. "Today", "Tomorrow", "In 3 days")
 */
export const formatDueString = (dateString) => {
    const date = new Date(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';

    const diff = differenceInDays(date, new Date());
    if (diff < 0) return 'Overdue';
    if (diff < 7) return `In ${diff} days`;

    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};
