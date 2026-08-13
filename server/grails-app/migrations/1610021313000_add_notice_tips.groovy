databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: "1610021313000-1") {
        sql('''
            update notice 
            set featured = false
        ''')

        sql('''
            insert into notice (image_key, version, title, subtitle, live_start, live_end, weight, featured, image_name)
            values ('juralio/noticeboard', 0, 'Project inbox', 'At the top level of timeline, you will see your inbox for the entire project. As you drill down, the inbox will be filtered to cover just the current parent task and its subtasks', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, false, 'project-inbox-jan-21.svg')
        ''')

        sql('''
            insert into notice (image_key, version, title, subtitle, live_start, live_end, weight, featured, image_name)
            values ('juralio/noticeboard', 0, 'Timeline', 'Timeline shows one parent task and its subtasks. The parent task is on the left and slightly bigger. Select a task to navigate up or down the task hierarchy.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, false, 'timeline-jan-21.svg')
        ''')

        sql('''
            insert into notice (image_key, version, title, subtitle, live_start, live_end, weight, featured, image_name)
            values ('juralio/noticeboard', 0, 'Taskmap', 'This gives you an overview of the structure, size and status of the project', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, false, 'taskmap-jan-21.svg')
        ''')

        sql('''
            insert into notice (image_key, version, title, subtitle, live_start, live_end, weight, featured, image_name)
            values ('juralio/noticeboard', 0, 'Tasks and subtasks', 'Tasks can be organised in up to six levels from  A to F. Level B tasks are subtask of level A tasks and so on.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, false, 'tasks-and-subtasks-jan-21.svg')
        ''')
    }
}
