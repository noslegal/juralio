databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1697444124000-1) {
       addColumn(tableName: "rate_type") {
            column(name: "is_standard", type: "boolean",defaultValue: "false") {
                constraints(nullable: "false")
            }
        }

         addColumn(tableName: "rate_type") {
            column(name: "is_breakeven", type: "boolean",defaultValue: "false") {
                constraints(nullable: "false")
            }
        }

         addColumn(tableName: "rate_type") {
            column(name: "is_premium", type: "boolean",defaultValue: "false") {
                constraints(nullable: "false")
            }
        }

         addColumn(tableName: "rate_type") {
            column(name: "is_agreed_client", type: "boolean",defaultValue: "false") {
                constraints(nullable: "false")
            }
        }

         addColumn(tableName: "rate_type") {
            column(name: "is_agreed_matter", type: "boolean",defaultValue: "false") {
                constraints(nullable: "false")
            }
        }
    }
}
