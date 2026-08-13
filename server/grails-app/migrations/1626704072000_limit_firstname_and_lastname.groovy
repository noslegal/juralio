databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1626704072000 - 1) {
        sql('''
            UPDATE app_user
            SET firstname = LEFT(firstname, 35)
            WHERE LENGTH(firstname) > 35
        ''')

        sql('''
            UPDATE app_user
            SET lastname = LEFT(lastname, 35)
            WHERE LENGTH(lastname) > 35
        ''')

        sql('''
            ALTER TABLE app_user
            ADD CONSTRAINT firstname_limitchars CHECK (char_length(firstname) <= 35)
        ''')

        sql('''
            ALTER TABLE app_user
            ADD CONSTRAINT lastname_limitchars CHECK (char_length(lastname) <= 35)
        ''')

    }
}
