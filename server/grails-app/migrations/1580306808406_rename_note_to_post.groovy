databaseChangeLog = {

    changeSet(author: "juralio (generated)", id: "1580306410680-13") {
        createTable(tableName: "post") {
            column(autoIncrement: "true", name: "id", type: "BIGINT") {
                constraints(primaryKey: "true", primaryKeyName: "postPK")
            }

            column(name: "version", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "date_created", type: "TIMESTAMP WITHOUT TIME ZONE") {
                constraints(nullable: "false")
            }

            column(name: "last_updated", type: "TIMESTAMP WITHOUT TIME ZONE") {
                constraints(nullable: "false")
            }

            column(name: "url", type: "VARCHAR(30000)")

            column(name: "name", type: "VARCHAR(50)") {
                constraints(nullable: "false")
            }

            column(name: "private_post", type: "BOOLEAN") {
                constraints(nullable: "false")
            }

            column(name: "reference_number", type: "VARCHAR(255)")

            column(name: "type", type: "VARCHAR(50)")

            column(name: "finalised", type: "BOOLEAN") {
                constraints(nullable: "false")
            }

            column(name: "creator_id", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "description", type: "VARCHAR(30000)")
        }

        sql('''
            INSERT INTO post (id, version, date_created, last_updated, url, name, private_post, reference_number, type, finalised, creator_id, description)
            SELECT id, version, date_created, last_updated, url, name, private_note, reference_number, type, finalised, creator_id, description
            FROM note
        ''')
    }

    changeSet(author: "juralio (generated)", id: "1580306410680-14") {
        createTable(tableName: "task_post") {
            column(name: "task_posts_id", type: "BIGINT") {
                constraints(nullable: "false")
            }

            column(name: "post_id", type: "BIGINT")
        }

        sql('''
            INSERT INTO task_post (task_posts_id, post_id)
            SELECT task_notes_id, note_id
            FROM task_note
        ''')
    }

    changeSet(author: "juralio (generated)", id: "1580306410680-15") {
        addColumn(tableName: "post_author") {
            column(name: "post_id", type: "int8") {
                constraints(nullable: "true")
            }
        }

        sql('''
            UPDATE post_author SET post_id = note_id        
        ''')

        addNotNullConstraint(columnDataType: "int8", columnName: "post_id", tableName: "post_author")
    }

    changeSet(author: "juralio (generated)", id: "1580306410680-17") {
        addUniqueConstraint(columnNames: "post_id, user_id", constraintName: "UK44eab64cffb775c6753476ea0473", tableName: "post_author")
    }


    changeSet(author: "juralio (generated)", id: "1580306410680-19") {
        addForeignKeyConstraint(baseColumnNames: "post_id", baseTableName: "task_post", constraintName: "FK3wgtid4ytnh7kn5w12p84hpim", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "post", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1580306410680-20") {
        addForeignKeyConstraint(baseColumnNames: "task_posts_id", baseTableName: "task_post", constraintName: "FKb7c4x6vqupvydangbvgjv9vp2", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "task", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1580306410680-21") {
        addForeignKeyConstraint(baseColumnNames: "post_id", baseTableName: "post_author", constraintName: "FKd94154654a8nkvieu89w7t6ok", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "post", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1580306410680-22") {
        addForeignKeyConstraint(baseColumnNames: "creator_id", baseTableName: "post", constraintName: "FKdyk8abmkx904g0ebp2p600tvr", deferrable: "false", initiallyDeferred: "false", referencedColumnNames: "id", referencedTableName: "app_user", validate: "true")
    }

    changeSet(author: "juralio (generated)", id: "1580306410680-23") {
        sql('''
            ALTER TABLE note DROP CONSTRAINT IF EXISTS "FK3wwpng6bpbbfrkt580m5s51jd"
        ''')

        sql('''
            ALTER TABLE note DROP CONSTRAINT IF EXISTS "fk3wwpng6bpbbfrkt580m5s51jd"
        ''')
    }

    changeSet(author: "juralio (generated)", id: "1580306410680-24") {
        sql('''
            ALTER TABLE task_note DROP CONSTRAINT IF EXISTS "FK9f2ailr9u0w823uad2ynuevj0"
        ''')

        sql('''
            ALTER TABLE task_note DROP CONSTRAINT IF EXISTS "fk9f2ailr9u0w823uad2ynuevj0"
        ''')
    }

    changeSet(author: "juralio (generated)", id: "1580306410680-25") {
        sql('''
            ALTER TABLE post_author DROP CONSTRAINT IF EXISTS "FKicbd88jdegbd1cqch28c9cdeb"
        ''')

        sql('''
            ALTER TABLE post_author DROP CONSTRAINT IF EXISTS "fkicbd88jdegbd1cqch28c9cdeb"
        ''')
    }

    changeSet(author: "juralio (generated)", id: "1580306410680-26") {
        sql('''
            ALTER TABLE task_note DROP CONSTRAINT IF EXISTS "FKl0qggrhj7xbsl6jtdmr07ssw4"
        ''')

        sql('''
            ALTER TABLE task_note DROP CONSTRAINT IF EXISTS "fkl0qggrhj7xbsl6jtdmr07ssw4"
        ''')
    }

    changeSet(author: "juralio (generated)", id: "1580306410680-27") {
        sql('''
            ALTER TABLE post_author DROP CONSTRAINT IF EXISTS "UK3fb90a9134f07e57c8c597132bcd"
        ''')

        sql('''
            ALTER TABLE post_author DROP CONSTRAINT IF EXISTS "uk3fb90a9134f07e57c8c597132bcd"
        ''')
    }

    changeSet(author: "juralio (generated)", id: "1580306410680-28") {
        dropTable(tableName: "note")
    }

    changeSet(author: "juralio (generated)", id: "1580306410680-29") {
        dropTable(tableName: "task_note")
    }

    changeSet(author: "juralio (generated)", id: "1580306410680-30") {
        dropColumn(columnName: "note_id", tableName: "post_author")
    }
}

