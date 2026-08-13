databaseChangeLog = {
    changeSet(author: "juralio", id: 1581601886154 - 1) {
        sql('''
            UPDATE user_inbox_notification SET read = true WHERE read is null
        ''')

        sql('''
            UPDATE user_inbox_notification SET dismissed = false WHERE dismissed is null
        ''')
    }
}
