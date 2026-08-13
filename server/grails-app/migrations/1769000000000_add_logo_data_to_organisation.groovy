databaseChangeLog = {
    changeSet(author: "juralio", id: "1769000000000-1") {
        // The spike version of this changeset (modifyDataType + addColumn) was already applied to the
        // dev-test DB and produced the same final schema (logo bytea + logo_mime_type). Accept its old
        // checksum so dev-test validates without re-running; fresh DBs (prod) run the cast-safe form below.
        validCheckSum("8:fe428672f4cfda7677f40e1eac036812")
        dropColumn(tableName: "organisation", columnName: "logo")
        addColumn(tableName: "organisation") {
            column(name: "logo", type: "bytea")
        }
        addColumn(tableName: "organisation") {
            column(name: "logo_mime_type", type: "varchar(255)")
        }
    }
}
