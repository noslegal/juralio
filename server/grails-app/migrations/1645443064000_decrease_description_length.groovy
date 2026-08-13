databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1645443064000 - 1) {
        sql("ALTER TABLE task ALTER COLUMN description TYPE character varying(500)")
    }
}