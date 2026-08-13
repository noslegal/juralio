databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1654689763000 - 1) {
        sql('''
  		    ALTER TABLE project_template ADD COLUMN is_system_template BOOLEAN NOT NULL DEFAULT false;
        ''')
        sql('''
            ALTER TABLE project_template ALTER COLUMN organisation_id DROP NOT NULL
        ''')
    }
}
