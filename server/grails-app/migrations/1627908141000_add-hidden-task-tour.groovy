databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1627908141000 - 1) {
        sql('''
            ALTER TABLE tour
            ADD hidden_task BOOLEAN NOT NULL DEFAULT false
        ''')
    }
}
