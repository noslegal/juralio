databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1626689751000 - 1) {
        sql('''
            alter table task alter column name type character varying(70);
        ''')
    }
}
