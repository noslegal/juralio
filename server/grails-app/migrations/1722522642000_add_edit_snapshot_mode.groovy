databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1722522642000-1) {
        addColumn(tableName: "cost_snapshot") {
            column(name: "edit_mode", type: "boolean",defaultValue: "false")
        }
    }
}
