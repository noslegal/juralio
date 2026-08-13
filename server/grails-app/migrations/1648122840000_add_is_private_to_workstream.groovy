databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1648122840000 - 1) {
        addColumn(tableName: "project") {
            column(name: "is_private", type: "boolean", defaultValue: "false")
        }
        addNotNullConstraint(defaultNullValue: "false", columnName: "is_private", tableName: "project")
    }
}
