databaseChangeLog = {
    changeSet(author: "juralio (generated)", id: 1586271431000 - 1) {
        sql('''
            ALTER TABLE public.project_template RENAME noticeboard_text TO description;
            ''')
    }
}
