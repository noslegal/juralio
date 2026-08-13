databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1655386519000 - 1) {
        sql('''
        ALTER TABLE instance_settings ADD COLUMN show_first_login_splash_screen BOOLEAN NOT NULL DEFAULT false;
      ''')
    }
}
