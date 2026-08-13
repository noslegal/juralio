databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1772461691000-1) {
     addColumn(tableName: "rate_type") {
            column(name: "group_position_id", type: "bigint")
        }
          addColumn(tableName: "other_cost") {
            column(name: "group_position_id", type: "bigint")
        }
          addColumn(tableName: "grade_category") {
            column(name: "group_position_id", type: "bigint")
        }
          addColumn(tableName: "grade") {
            column(name: "group_position_id", type: "bigint")
        }
          addColumn(tableName: "rate_table_details") {
            column(name: "group_position_id", type: "bigint")
        }
    }
}
