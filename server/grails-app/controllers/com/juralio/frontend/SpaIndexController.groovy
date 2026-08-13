package com.juralio.frontend

import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus

/**
 * Serves the SPA entry page at "/". Tomcat's welcome-file handling no longer
 * applies under Grails 7 (the dispatcher consumes "/" and rendered the JSON
 * 404 view), so the webapp-root index.html must be served explicitly.
 * index.html only exists in the packaged war (copied in by e2e_images.sh /
 * the deploy build); in local development the frontend is served separately,
 * so a missing file is a plain 404.
 */
@Secured(['IS_AUTHENTICATED_ANONYMOUSLY'])
class SpaIndexController {
    static allowedMethods = [index: "GET"]

    def index() {
        InputStream indexHtml = servletContext.getResourceAsStream('/index.html')
        if (indexHtml == null) {
            render status: HttpStatus.NOT_FOUND
            return
        }
        render(file: indexHtml, contentType: 'text/html')
    }
}
