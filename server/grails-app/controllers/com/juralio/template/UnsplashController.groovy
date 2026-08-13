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

package com.juralio.template

import com.juralio.config.ConfigService
import grails.plugin.springsecurity.annotation.Secured

import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.time.Duration

import static org.springframework.http.HttpStatus.BAD_GATEWAY
import static org.springframework.http.HttpStatus.NOT_IMPLEMENTED

/**
 * Server-side proxy for the Unsplash image search used by the template and project
 * cover-image pickers.
 *
 * The Unsplash access key must never reach the browser, so these actions perform the
 * upstream call here and return the response body. An earlier implementation issued a
 * redirect to api.unsplash.com with the key in the query string, which disclosed the
 * key to every caller via the Location header.
 */
@Secured(['permitAll'])
class UnsplashController {

    private static final String UPSTREAM = 'https://api.unsplash.com'
    private static final String PROXY_PREFIX = '/services/unsplashproxy'

    static allowedMethods = [unsplashproxy: 'GET', unsplashdownload: 'GET']

    ConfigService configService

    private static final HttpClient HTTP = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .followRedirects(HttpClient.Redirect.NORMAL)
            .build()

    def unsplashproxy() {
        proxyTo('/search/photos')
    }

    def unsplashdownload() {
        // e.g. /services/unsplashproxy/photos/<id>/download -> /photos/<id>/download
        String forwardUri = request.forwardURI
        if (!forwardUri.startsWith(PROXY_PREFIX)) {
            render status: BAD_GATEWAY
            return
        }
        proxyTo(forwardUri.substring(PROXY_PREFIX.length()))
    }

    /**
     * Forwards the caller's query string to the given Unsplash path, authenticating with
     * the configured access key, and relays the upstream JSON straight back.
     */
    private void proxyTo(String path) {
        String accessKey = configService.unsplashKey
        if (!accessKey) {
            log.warn('Unsplash request rejected: UNSPLASH_API_KEY is not configured')
            render status: NOT_IMPLEMENTED
            return
        }

        StringBuilder query = new StringBuilder()
        request.parameterMap.each { String name, String[] values ->
            values.each { String value ->
                if (query.length() > 0) {
                    query.append('&')
                }
                query.append(encode(name)).append('=').append(encode(value))
            }
        }

        URI target = URI.create(UPSTREAM + path + (query.length() > 0 ? "?${query}" : ''))

        try {
            HttpRequest upstreamRequest = HttpRequest.newBuilder(target)
                    .header('Accept-Version', 'v1')
                    .header('Authorization', "Client-ID ${accessKey}")
                    .timeout(Duration.ofSeconds(15))
                    .GET()
                    .build()

            HttpResponse<String> upstreamResponse = HTTP.send(upstreamRequest, HttpResponse.BodyHandlers.ofString())
            render status: upstreamResponse.statusCode(), contentType: 'application/json', text: upstreamResponse.body()
        } catch (IOException | InterruptedException e) {
            log.error("Unsplash request to ${path} failed", e)
            render status: BAD_GATEWAY
        }
    }

    private static String encode(String value) {
        URLEncoder.encode(value, 'UTF-8')
    }
}
