databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1779667200001-1) {
        modifyDataType(
            tableName: "out_of_scope_details",
            columnName: "reason",
            newDataType: "VARCHAR(300)"
        )
    }
}
