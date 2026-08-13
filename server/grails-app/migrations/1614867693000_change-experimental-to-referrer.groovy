databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1614867693000 - 1) {
        // Referer headers carry a trailing slash, so the seeded origins must too.
        sql('''
            update experimental_server
            set url='http://localhost:3000/'
            where url='http://localhost:3000'
        ''')

    }
}
