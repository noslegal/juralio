databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1669886109000-1) {
        sql('''
            ALTER TABLE instance_settings ADD COLUMN enable_url_validation BOOLEAN NOT NULL DEFAULT true;
        ''')
    }
}
