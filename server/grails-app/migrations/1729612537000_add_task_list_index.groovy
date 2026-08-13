databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1729612537000-1) {
      addColumn(tableName: "task") {
            column(name: "list_idx", type: "bigint") {
                constraints(nullable: "true")
            }
        }
    }
}
