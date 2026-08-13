databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1669726693000-1) {
        sql('''
          CREATE TABLE IF NOT EXISTS email_whitelist(id SERIAL PRIMARY KEY, whitelisted_email VARCHAR(255), version bigint);
        ''')
    }
}
