databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1581427382658 - 1) {
        sql('''
            UPDATE inbox_notification SET type = 'PostCreated' WHERE type = 'NoteCreated'
        ''')

        sql('''
            UPDATE inbox_notification SET type = 'PostMarkedFinal' WHERE type = 'NoteMarkedFinal'
        ''')
    }
}
