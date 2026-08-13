databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1643371776999 - 1) {
        sql('''
        CREATE TEMPORARY TABLE temp_matter_recency(id SERIAL PRIMARY KEY, user_id bigint, matter_id bigint, version bigint, last_visit timestamp);        
        
        INSERT INTO temp_matter_recency (user_id, matter_id)
        SELECT distinct matter_id, user_id FROM matter_recency;
        
        UPDATE temp_matter_recency SET version = 0, last_visit = now();
        
        DELETE FROM matter_recency;
        
        INSERT INTO matter_recency (id, user_id, matter_id, version, last_visit)
        SELECT id, matter_id, user_id, version, last_visit FROM temp_matter_recency;
        
        DROP TABLE temp_matter_recency;
        ''')
    }
}