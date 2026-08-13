databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1616079765000 - 1) {
        sql('''
  		    ALTER TABLE experimental_options ADD COLUMN internal_external_users BOOLEAN NOT NULL DEFAULT true;
        ''')
    }
}