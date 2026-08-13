databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1656400555000 - 1) {
        sql('''
  		    ALTER TABLE instance_settings ADD COLUMN enable_payment_platform_integration BOOLEAN NOT NULL DEFAULT false;
        ''')
    }
}
