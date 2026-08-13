databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1651665601000 - 1) {
        sql('''
            ALTER TABLE first_time_user_experience
            ADD has_seen_templates BOOLEAN NOT NULL DEFAULT false
        ''')
    }
}
