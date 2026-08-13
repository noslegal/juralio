databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1620638692000 - 1) {
        addColumn(tableName: "first_time_user_experience") {
            column(name: "has_seen_roadmap", type: "boolean")
        }
        addNotNullConstraint(defaultNullValue: "false", columnName: "has_seen_roadmap", tableName: "first_time_user_experience")
    }
}
