databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1675355220000-1) {
            sql('''
              UPDATE app_user
              SET trial_reminder_sent = false
            ''')
    }
}
