databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1674840399000-1) {
        sql('''
          CREATE TABLE IF NOT EXISTS deleted_matter_log(id SERIAL PRIMARY KEY, version BIGINT, matter_id BIGINT UNIQUE NOT NULL, organisation_id BIGINT NOT NULL, matter_name VARCHAR(255) NOT NULL, matter_client VARCHAR(255) NOT NULL, deleted_by VARCHAR(255) NOT NULL, marked_for_deletion TIMESTAMP NOT NULL, permanently_deleted TIMESTAMP);
        ''')
    }
}
