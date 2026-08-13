databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1614870253000 - 1) {
        sql '''
            ALTER TABLE matter ADD is_neutral_matter BOOLEAN DEFAULT false
        '''
    }
}
