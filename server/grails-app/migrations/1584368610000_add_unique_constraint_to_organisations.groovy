databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1584368610000 - 1) {
        sql('''
            ALTER TABLE organisation
            ADD CONSTRAINT unique_name UNIQUE (name);
        ''')

    }
}
