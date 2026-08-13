databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1643625284000 - 1) {
        sql('''
            UPDATE matter SET name=SUBSTRING(name, 1, 60)
        ''')
        sql('''
            UPDATE matter SET client_name=SUBSTRING(client_name, 1, 60)
        ''')
        sql('''
            ALTER TABLE matter ALTER COLUMN name TYPE varchar(60)
        ''')
        sql('''
            ALTER TABLE matter ALTER COLUMN client_name TYPE varchar(60)
        ''')

        sql('''
            ALTER TABLE app_user ALTER COLUMN lastname TYPE varchar(35)
        ''')
        sql('''
            ALTER TABLE app_user ALTER COLUMN firstname TYPE varchar(35)
        ''')
    }
}
