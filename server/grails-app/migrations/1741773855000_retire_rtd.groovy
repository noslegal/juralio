databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1741773855000-1) {
        addColumn(tableName: "rate_table_details") {
            column(name: "is_retired", type: "boolean",defaultValue: "false")
        }
    }
}
