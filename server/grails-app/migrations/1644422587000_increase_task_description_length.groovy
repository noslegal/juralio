databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1644422587000 - 1) {
        sql("ALTER TABLE task ALTER COLUMN description TYPE character varying(2400)")
    }
}
