databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1655117195000 - 1) {
        sql("""
  		    ALTER TABLE matter ADD COLUMN is_personal BOOLEAN NOT NULL DEFAULT false;
        """)
    }
}
