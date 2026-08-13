databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1676290033000-1) {
          sql('''
           Alter table user_status_event alter column performed_by_id DROP NOT NULL;
        ''')
    }
}
