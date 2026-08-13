databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1624974113000 - 1) {
        sql('''
            UPDATE experimental_options
            SET dispute_platform = false
        ''')
    }
}
