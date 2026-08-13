databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1644241190000 - 1) {
        sql("ALTER TABLE project ALTER COLUMN description TYPE character varying(2400)")
    }
}
