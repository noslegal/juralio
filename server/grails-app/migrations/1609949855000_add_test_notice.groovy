databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: "1609949855000-1") {
        sql('''
            update notice 
            set featured = false
        ''')

        sql('''
            insert into notice (image_key, version, title, subtitle, live_start, live_end, weight, featured, image_name)
            values ('juralio/noticeboard', 0, 'Task workflow status', 'Task colours show their status - not started, in progress or done. When a task''s status is updated, a change in the status of its subtasks or parent tasks will be suggested automatically if necessary to keep things consistent.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, false, 'task-workflow-status-jan21.svg')
        ''')
    }
}
