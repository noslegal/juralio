databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1646062986000 - 1) {
        addColumn(tableName: "first_time_user_experience") {
            column(name: "has_seen_home_page", type: "boolean")
        }
        addNotNullConstraint(defaultNullValue: "false", columnName: "has_seen_home_page", tableName: "first_time_user_experience")

    }
}
