databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1669638201000-1) {
      sql('''
          ALTER TABLE app_user ADD COLUMN trial_start_date TIMESTAMP WITHOUT TIME ZONE DEFAULT NULL;
        ''')
    }
}
