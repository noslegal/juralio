databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1657014673000 - 1) {
        sql('''
    ALTER TABLE organisation ADD has_configured_billing BOOLEAN DEFAULT false
        ''')
    }
}
