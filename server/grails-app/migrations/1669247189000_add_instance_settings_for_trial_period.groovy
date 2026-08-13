databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1669247189000-1) {
        sql('''
          ALTER TABLE instance_settings ADD COLUMN trial_period BIGINT NOT NULL DEFAULT 21;
        ''')
    }
}
