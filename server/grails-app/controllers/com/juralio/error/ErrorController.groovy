/*
 * Copyright 2026 Graeme and Joanna Johnston
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.juralio.error

import com.juralio.aws.SESService
import com.juralio.aws.SecretService
import com.juralio.common.RequestParameterValidationFailedException
import com.juralio.config.ConfigService
import org.codehaus.groovy.runtime.StackTraceUtils
import org.grails.web.json.JSONObject
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.orm.hibernate5.HibernateOptimisticLockingFailureException
import jakarta.servlet.DispatcherType
import java.lang.reflect.InvocationTargetException

class ErrorController {
    def userAuthTokenService
    def userService
    SecretService secretService
    @Autowired
    SESService sesService
    ConfigService configService

    def handleAccessDenied() {
        return  response.setStatus(HttpStatus.FORBIDDEN.value())
    }

    def handleInvalidException() {
        return  response.setStatus(HttpStatus.METHOD_NOT_ALLOWED.value())
    }

    def handleNoValidUserException() {
        return  response.setStatus(HttpStatus.BAD_REQUEST.value())
    }

    def handleDuplicateTeamMemberException() {
        return  response.setStatus(HttpStatus.BAD_REQUEST.value())
    }

    def handleMaximumTaskLimitException() {
        return response.setStatus(HttpStatus.BAD_REQUEST.value())
    }

    def handleRequestParameterValidationFailed() {
        Exception cause = unwrapException(request?.exception)

        if (cause instanceof RequestParameterValidationFailedException) {
            def errorResponse = [message: cause.getMessage(), status: HttpStatus.BAD_REQUEST.value()]
            respond errorResponse, status: HttpStatus.BAD_REQUEST
            return
        }

        return  response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value())
    }

    def handleHibernateOptimisticLockingFailureException() {
        Exception cause = unwrapException(request?.exception)

        if (cause instanceof HibernateOptimisticLockingFailureException) {
            def errorResponse = [message: 'HibernateOptimisticLockingFailure', status: HttpStatus.INTERNAL_SERVER_ERROR.value()]
            respond errorResponse, status: HttpStatus.INTERNAL_SERVER_ERROR
            return
        }

        return response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value())
    }



    private int uploadErrorMessage(body){
        def errorUrl = new URL(configService.errorReportingUrl)
        HttpURLConnection connection = (HttpURLConnection) errorUrl.openConnection()
        connection.setDoOutput(true)

        String secretName = configService.errorReportingApiKeySecretName
        if (secretName) {
            connection.setRequestProperty('x-api-key', secretService.getSecret(secretName))
        }

        connection.requestMethod = 'POST'

        OutputStreamWriter writer = new OutputStreamWriter(connection.getOutputStream());

        writer.write(body);
        writer.flush();
        String line;
        BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
        writer.close();
        reader.close();
        return connection.getResponseCode()
    }

    private def getErrorInfoForS3(request,url){
        JSONObject json = new JSONObject()
        def filename = "${url.host.replaceAll(' ','-')}-${new Date().getTime()}.json"
        json.put('filename',filename)
        JSONObject data = new JSONObject()
        def rootRequest = getRootRequest(request)
        if(rootRequest) {
            Exception cause = unwrapException(request?.exception)
            data.put('Request', getRequestDetails(rootRequest))
            data.put('Exception Type', cause.getClass())
            data.put('Detail Message', cause.getMessage())
            data.put('Stacktrace', getStackTraceString(cause))
            json.put('data', data.toString())
        }
        return json
    }

    def handleInternalServerError() {
        Throwable cause = unwrapException(request?.exception) ?: request?.exception
        String path = request?.getRequestURI()

        if (cause) {
            log.error("Unhandled error handling ${path}", cause)
        } else {
            log.error("Unhandled error handling ${path}")
        }

        try {
            reportError(request)
        } catch (Exception e) {
            log.error('Failed to report unhandled error', e)
        }

        return  response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value())
    }

    /**
     * Outbound reporting of an unhandled error, off unless configured. With no
     * errorReporting.url set the server makes no outbound call — it has already
     * logged the error locally. The email alert additionally needs
     * errorReporting.alertEmail. See docs/ENVIRONMENT-VARIABLES.md.
     */
    private void reportError(request) {
        if (!configService.errorReportingUrl) {
            return
        }

        URL url = new URL(request.getRequestURL().toString())
        int statusCode = uploadErrorMessage(getErrorInfoForS3(request, url))

        String alertEmail = configService.errorReportingAlertEmail
        if (!alertEmail) {
            return
        }

        def messageContent = getErrorMessage(request)
        if (!messageContent) {
            return
        }

        String subject = statusCode == 200 ?
                "${url.host}: Internal Server Error" :
                "${url.host}: Internal Server Error - upload failed (${statusCode})"

        sesService.sendEmail(alertEmail, subject, messageContent)
    }

    private def getRootRequest(r) {
        def root = r
        Set alreadyVisited = [r]

        while (root?.request) {
            if (alreadyVisited.contains(root.request)) {
                return null
            }

            alreadyVisited.add(root.request)

            if (root.getDispatcherType() == DispatcherType.REQUEST) {
                return root
            }

            root = root.request
        }

        return null
    }

    private def getRequestDetails(request) {
        StringBuilder sb = new StringBuilder()

        sb.append("""<table border="1">""")
        sb.append("""<tr><td>Method</td><td>${request.getMethod()}</td></tr>""")
        sb.append("""<tr><td>Path</td><td>${request.getServletPath()}</td></tr>""")
        sb.append("""<tr><td>Remote Client</td><td>${request.getRemoteAddr()}</td></tr>""")
        sb.append("""<tr><td>Headers</td><td><table>""")

        Enumeration<String> headerNames = request.getHeaderNames()
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement().toLowerCase()
            String headerValues = request.getHeaders(headerName).toList().join(", ")

            if (headerName == "authorization") {
                def pattern = ~/^Bearer ([^,]+)$/
                def (_, token) = (headerValues =~ pattern)[0]

                if (token) {
                    def username = userAuthTokenService.getUsernameForToken(token)
                    def user = username ? userService.findByUsername(username, [:]) : null
                    headerValues = headerValues.replace(token, "(redacted) user ID: ${user?.id}")
                }
            }

            sb.append("""<tr><td>${headerName}</td><td>${headerValues}</td></tr>""")
        }

        sb.append("""</table></td></tr>""")
        sb.append("""<tr><td>Parameters</td><td><table>""")

        Map params = request.getParameterMap()
        Iterator i = params.keySet().iterator()
        while (i.hasNext()) {
            String key = (String) i.next()
            String value = ((String[]) params.get(key))[0]
            sb.append("""<tr><td>${key}</td><td>${value}</td></tr>""")
        }

        sb.append("""</table></td></tr></table>""")

        return sb.toString()
    }

    private def getErrorMessage(request) {
        def rootRequest = getRootRequest(request)

        if (rootRequest) {
            Exception cause = unwrapException(request?.exception)

            return """<html><body><h3>Unhandled Error</h3>
            <table>
            <tr><td>Request</td><td>${getRequestDetails(rootRequest)}</td></tr>
            <tr><td>Exception Type</td><td>${cause.getClass()}</td></tr>
            </table>
            </body></html>"""
        }

        return null
    }

    private def getStackTraceString(Throwable t) {
        def stringWriter = new StringWriter()
        def printWriter = new PrintWriter(stringWriter)
        StackTraceUtils.printSanitizedStackTrace(t, printWriter)
        return stringWriter.toString()
    }

    private def unwrapException(Exception e) {
        Exception cause = e?.cause

        // Grails does different wrapping of exceptions in debug environments
        if (cause instanceof InvocationTargetException) {
            cause = ((InvocationTargetException) cause).targetException ?: cause.cause
        }

        return cause
    }

}
