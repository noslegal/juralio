databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1662456448000-1) {
      sql("""
        ALTER TABLE task
        ALTER COLUMN description TYPE text
      """)
    }
}
