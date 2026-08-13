databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1669301268000-1) {
        sql('''
  		    ALTER TABLE organisation ADD COLUMN confirmed_user_count BIGINT NOT NULL DEFAULT 0;
          ALTER TABLE app_user ADD COLUMN confirmation_status VARCHAR(15) DEFAULT NULL;
        ''')
    }
}
