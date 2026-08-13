databaseChangeLog = {
    changeSet(author: "juralio", id: "1769000001000-1") {
        addColumn(tableName: "organisation_group") {
            column(name: "logo", type: "bytea")
        }
        addColumn(tableName: "organisation_group") {
            column(name: "logo_mime_type", type: "varchar(255)")
        }
    }
}
