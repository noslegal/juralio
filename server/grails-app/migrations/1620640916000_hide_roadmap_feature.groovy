databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1620640916000 - 1) {
        sql('''
            ALTER TABLE experimental_options ADD COLUMN roadmap BOOLEAN NOT NULL DEFAULT false;
        ''')

        sql('''
            INSERT INTO experimental_options (microsoft_login, version, dispute_platform, internal_external_users, roadmap)
            VALUES (true, 1, true, true, true);
        ''')

        sql('''
            UPDATE experimental_options
            SET roadmap = false
            WHERE id = 1;
        ''')
    }
}
