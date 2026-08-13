databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: "1644593639000-1") {
        sql('''        
        CREATE TEMPORARY TABLE temp_task_recency(id SERIAL PRIMARY KEY, user_id bigint, matter_id bigint,  task_id bigint, version bigint, last_visit timestamp);        
        
        INSERT INTO temp_task_recency (user_id, matter_id, task_id)
        SELECT distinct user_id, matter_id, task_id FROM task_recency;
        
        UPDATE temp_task_recency SET version = 0, last_visit = now();
        
        DELETE FROM task_recency;
        
        INSERT INTO task_recency (id, user_id, matter_id, task_id, version, last_visit)
        SELECT id, user_id, matter_id, task_id, version, last_visit FROM temp_task_recency;
        
        DROP TABLE temp_task_recency;
        ''')
    }
    changeSet(author: "juralio (generated)", id: "1644593639000-2") {
        sql('''        
        CREATE TEMPORARY TABLE temp_project_recency(id SERIAL PRIMARY KEY, user_id bigint, project_id bigint, version bigint, last_visit timestamp);        
        
        INSERT INTO temp_project_recency (user_id, project_id)
        SELECT distinct user_id, project_id FROM project_recency;
        
        UPDATE temp_project_recency SET version = 0, last_visit = now();
        
        DELETE FROM project_recency;
        
        INSERT INTO project_recency (id, user_id, project_id, version, last_visit)
        SELECT id, user_id, project_id, version, last_visit FROM temp_project_recency;
        
        DROP TABLE temp_project_recency;
        ''')
    }
    changeSet(author: "juralio (generated)", id: "1644593639000-3") {
        sql('''        
        CREATE TEMPORARY TABLE temp_project_visit_recency(id SERIAL PRIMARY KEY, user_id bigint, project_id bigint, version bigint, last_visit timestamp);        
        
        INSERT INTO temp_project_visit_recency (user_id, project_id)
        SELECT distinct user_id, project_id FROM project_visit_recency;
        
        UPDATE temp_project_visit_recency SET version = 0, last_visit = now();
        
        DELETE FROM project_visit_recency;
        
        INSERT INTO project_visit_recency (id, user_id, project_id, version, last_visit)
        SELECT id, user_id, project_id, version, last_visit FROM temp_project_visit_recency;
        
        DROP TABLE temp_project_visit_recency;
        ''')
    }
    changeSet(author: "juralio (generated)", id: "1644593639000-4") {
        sql('''        
        CREATE TEMPORARY TABLE temp_project_template_recency(id SERIAL PRIMARY KEY, user_id bigint, project_template_id bigint, version bigint, last_visit timestamp);        
        
        INSERT INTO temp_project_template_recency (user_id, project_template_id)
        SELECT distinct user_id, project_template_id FROM project_template_recency;
        
        UPDATE temp_project_template_recency SET version = 0, last_visit = now();
        
        DELETE FROM project_template_recency;
        
        INSERT INTO project_template_recency (id, user_id, project_template_id, version, last_visit)
        SELECT id, user_id, project_template_id, version, last_visit FROM temp_project_template_recency;
        
        DROP TABLE temp_project_template_recency;
        ''')
    }
    changeSet(author: "juralio (generated)", id: "1644593639000-5") {
        sql('''
        ALTER TABLE IF EXISTS public.task_recency
        ADD CONSTRAINT task_recency_user_id_matter_id_task_id_key UNIQUE (user_id, matter_id, task_id);
        ''')
    }
    changeSet(author: "juralio (generated)", id: "1644593639000-6") {
        sql('''
        ALTER TABLE IF EXISTS public.project_recency
        ADD CONSTRAINT project_recency_user_id_project_id_key UNIQUE (user_id, project_id);
        ''')
    }
    changeSet(author: "juralio (generated)", id: "1644593639000-7") {
        sql('''
        ALTER TABLE IF EXISTS public.project_visit_recency
        ADD CONSTRAINT project_visit_recency_user_id_project_id_key UNIQUE (user_id, project_id);
        ''')
    }
    changeSet(author: "juralio (generated)", id: "1644593639000-8") {
        sql('''
        ALTER TABLE IF EXISTS public.project_template_recency
        ADD CONSTRAINT project_template_recency_user_id_project_template_id_key UNIQUE (user_id, project_template_id);
        ''')
    }
}
