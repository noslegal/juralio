databaseChangeLog = {

    changeSet(author: "juralio (generated)", id: "1594212747694-24") {
        createTable(tableName: "notification_filter_user_recency") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "notification_filter_user_recencyPK")
            }

            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "date_created", type: "TIMESTAMP WITHOUT TIME ZONE") {
                constraints(nullable: "false")
            }

            column(name: "filter_user_id", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "user_id", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "project_id", type: "BIGINT") {
                constraints(nullable: "false")
            }
        }
    }

    changeSet(author: "juralio (generated)", id: "1594212747694-27") {
        addForeignKeyConstraint(baseColumnNames: "project_id", baseTableName: "notification_filter_user_recency", constraintName: "FK2m1o1cvvsrt7kutoxr2vg1l1i", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "project", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1594212747694-28") {
        addForeignKeyConstraint(baseColumnNames: "user_id", baseTableName: "notification_filter_user_recency", constraintName: "FK3ox746h4lvlgnfboackf6tcc4", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "app_user", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1594212747694-29") {
        addForeignKeyConstraint(baseColumnNames: "filter_user_id", baseTableName: "notification_filter_user_recency", constraintName: "FKhj81f0mbh71kiew2rasygivy0", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "app_user", validate: "true")
    }
}
