databaseChangeLog = {

    changeSet(author: "juralio (generated)", id: "1594911355994-1") {
        addColumn(tableName: "matter_team_member") {
            column(name: "date_created", type: "timestamp") {
                constraints(nullable: "true")
            }
        }
    }

    changeSet(author: "juralio (generated)", id: "1594911355994-2") {
        update(tableName: "matter_team_member") {
            column(name: "date_created", valueDate: "2020-07-16")
            where {
                "date_created is NULL"
            }
        }
    }
}
