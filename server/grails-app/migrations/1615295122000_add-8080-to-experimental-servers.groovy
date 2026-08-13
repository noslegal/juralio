databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1615295122000 - 1) {
        sql('''
            insert into experimental_server (url,version)
            values ('http://localhost:8080/',1)
        ''')
    }
}
