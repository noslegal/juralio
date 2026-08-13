databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1658479367000 - 1) {
        sql '''
        ALTER TABLE organisation
        ADD COLUMN is_frozen BOOLEAN NOT NULL DEFAULT false
      '''
    }
}
