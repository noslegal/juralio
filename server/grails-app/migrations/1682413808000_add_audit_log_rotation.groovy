databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1682413808000-1) {
        sql('''
  		    ALTER TABLE instance_settings ADD COLUMN enable_audit_log_rotation BOOLEAN NOT NULL DEFAULT false;
        ''')
    }
}
