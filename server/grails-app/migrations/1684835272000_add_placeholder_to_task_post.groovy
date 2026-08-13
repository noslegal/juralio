databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1684835272000-1) {
           addColumn(tableName: "task_team_member") {
            column(name: "placeholder_id", type: "bigint") {
                constraints(nullable: "true")
            }
        }

        addColumn(tableName: "post_member") {
            column(name: "placeholder_id", type: "bigint") {
                constraints(nullable: "true")
            }
        }
             dropNotNullConstraint(columnDataType: "bigint", columnName: "user_id", tableName: "task_team_member")
            dropNotNullConstraint(columnDataType: "bigint", columnName: "user_id", tableName: "post_member")
    }
}
