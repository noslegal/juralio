databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1651677811000 - 1) {
        sql('''
            ALTER TABLE first_time_user_experience
            ADD has_seen_template_overview BOOLEAN NOT NULL DEFAULT false
        ''')
    }
}
