databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1636104431000 - 1) {
        sql('''
            ALTER TABLE experimental_options
            DROP COLUMN microsoft_login
        ''')
    }
}
