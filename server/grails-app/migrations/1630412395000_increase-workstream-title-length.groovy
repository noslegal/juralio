databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1630412395000 - 1) {
        sql('''
      ALTER TABLE project
      ALTER COLUMN name TYPE VARCHAR(70)
        ''')
        sql('''
      ALTER TABLE project_template
      ALTER COLUMN name TYPE VARCHAR(70)
        ''')
    }
}
