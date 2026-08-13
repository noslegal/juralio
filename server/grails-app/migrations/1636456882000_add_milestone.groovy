databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1636456882000 - 1) {
        addColumn(tableName: "task") {
            column(name: "is_milestone", type: "BOOLEAN", defaultValue: "false")
        }
    }
}
