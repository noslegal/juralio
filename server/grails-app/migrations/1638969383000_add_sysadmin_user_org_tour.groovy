databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1638969383000 - 1) {
        sql('''
            ALTER TABLE tour
            ADD sysadmin_user_creation_org BOOLEAN NOT NULL DEFAULT false
        ''')
    }
}
