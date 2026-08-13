databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1622205724000 - 1) {
        addColumn(tableName: "matter") {
            column(name: "user_defined_reference_number", type: "VARCHAR(20)", defaultValue: '') {
                constraints(nullable: "true")
            }
        }
    }
}
