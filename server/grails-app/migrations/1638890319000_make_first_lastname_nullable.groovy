databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1638890319000 - 1) {

        sql('''
            ALTER TABLE app_user ALTER COLUMN firstname DROP NOT NULL
        ''')
        sql('''
            ALTER TABLE app_user ALTER COLUMN lastname DROP NOT NULL
        ''')
    }
}
