databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1658933861000 - 1) {
        sql '''
        ALTER TABLE organisation
        ADD COLUMN frozen_date TIMESTAMP WITHOUT TIME ZONE
      '''
    }
}
