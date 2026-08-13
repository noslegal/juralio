databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1630497714000 - 1) {
        sql('''
      ALTER TABLE task_template
      ALTER COLUMN name TYPE VARCHAR(70)
        ''')
    }
}
