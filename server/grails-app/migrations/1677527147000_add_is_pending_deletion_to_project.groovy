databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1677527147000-1) {
      addColumn(tableName: "project") {
            column(name: "is_pending_deletion", type: "boolean", defaultValue: "false")
        }
        addNotNullConstraint(defaultNullValue: "false", columnName: "is_pending_deletion", tableName: "project")
    }
}
