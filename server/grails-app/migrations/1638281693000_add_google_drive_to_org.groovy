databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1638281693000 - 1) {
        sql '''
            ALTER TABLE organisation ADD google_drive_enabled BOOLEAN DEFAULT false
        '''
    }
}
