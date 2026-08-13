databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1674730834000-1) {
        sql('''
  		    ALTER TABLE instance_settings ADD COLUMN emphasise_sso_login BOOLEAN NOT NULL DEFAULT false;
        ''')
    }
}
