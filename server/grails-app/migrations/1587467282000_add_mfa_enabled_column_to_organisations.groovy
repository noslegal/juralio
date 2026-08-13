databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1587467282000 - 1) {
        addColumn(tableName: "organisation") {
            column(name: "mfa_enabled", type: "boolean", valueBoolean: true)
        }
        addDefaultValue(tableName: "organisation", columnName: "mfa_enabled", defaultValueBoolean: true)
    }
}
