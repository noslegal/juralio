databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1615214260000 - 1) {
        sql('''
  		    ALTER TABLE experimental_options ADD COLUMN dispute_platform BOOLEAN NOT NULL DEFAULT true;
        ''')
    }
}
