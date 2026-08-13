databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1673266285000-1) {
        sql('''
            ALTER TABLE tour
            ADD add_to_subtasks BOOLEAN NOT NULL DEFAULT false
        ''')
    }
}
