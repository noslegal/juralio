databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1669243060000-1) {
      sql('''
  		    ALTER TABLE instance_settings ADD COLUMN enable_user_confirmation BOOLEAN NOT NULL DEFAULT false;
        ''')
    }
}
