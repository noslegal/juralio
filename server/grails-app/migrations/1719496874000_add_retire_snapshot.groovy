databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1719496874000-1) {
          addColumn(tableName: "cost_snapshot") {
            column(name: "is_retired", type: "boolean",defaultValue: "false")
        }
    }
}
