databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1620294939000 - 1) {
        sql('''
            UPDATE post SET type='Link' WHERE type='Image'
        ''')
        sql('''
            UPDATE post SET type='Link' WHERE type='Video'
        ''')
    }
}
