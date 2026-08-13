databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1675930601000-1) {
        sql('''
  		    ALTER TABLE experimental_options ADD COLUMN disable_task_linking BOOLEAN NOT NULL DEFAULT false;
        ''')
    }
}
