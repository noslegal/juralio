databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1634725348000 - 1) {
        createTable(tableName: "label") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true")
            }

            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }
            column(name: "name", type: "VARCHAR(20)") {
                constraints(nullable: "false")
            }
            column(name: "organisation_id", type: "BIGINT")
            column(name: "matter_id", type: "BIGINT")
            column(name: "creator_id", type: "BIGINT")
            column(name: "type", type: "VARCHAR(15)") {
                constraints(nullable: "false")
            }
            column(name: "date_created", type: "TIMESTAMP WITHOUT TIME ZONE") {
                constraints(nullable: "false")
            }

            column(name: "last_updated", type: "TIMESTAMP WITHOUT TIME ZONE") {
                constraints(nullable: "false")
            }
        }

        createTable(tableName: "inactive_label") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true")
            }
            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }
            column(name: "organisation_id", type: "BIGINT")
            column(name: "matter_id", type: "BIGINT")
            column(name: "label_id", type: "BIGINT") {
                constraints(nullable: "false")
            }
        }
        createTable(tableName: "task_label") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "task_labelPK")
            }

            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "label_id", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "task_id", type: "BIGINT") {
                constraints(nullable: "false")
            }
            column(name: "modifier", type: "VARCHAR(10)")
        }
        sql('''
        insert into label(name,type,version,date_created,last_updated)
        values('Blocked','workflow',1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
        ('Awaiting review','workflow',1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
        ('Awaiting approval','workflow',1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
        ('On hold','workflow',1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
        ('Cost','risk',1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
        ('Timing','risk',1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
        ('Scope','risk',1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
        ('Clarity','risk',1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
        ('Staffing','risk',1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
        ('Quality','risk',1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
    ''')
    }
}
