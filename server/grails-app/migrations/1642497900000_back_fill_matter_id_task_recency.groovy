databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1642497900000 - 1) {
        sql('''
          with t as ( select task_recency.id, project.matter_id from task_recency join  task on task.id = task_recency.task_id join project on project.id = task.project_id) update task_recency set matter_id = t.matter_id from t where t.id = task_recency.id  
        ''')
    }
}
