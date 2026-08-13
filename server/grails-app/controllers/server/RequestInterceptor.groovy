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

package server

import com.juralio.config.ConfigService
import com.juralio.ratelimit.RateLimitAlertService
import com.juralio.ratelimit.RateLimitService
import org.grails.web.json.JSONObject

class RequestInterceptor {

    RateLimitService rateLimitService
    RateLimitAlertService rateLimitAlertService
    ConfigService configService

    RequestInterceptor() {
        match controller: '*', action: '*'
    }

    boolean before() {
        response.setHeader("Cache-Control", "private, no-cache, no-store, must-revalidate, pre-check=0, post-check=0, max-age=0, s-maxage=0, no-transform")

        if (configService.rateLimitEnabled) {
            String ipAddress = extractClientIp()
            long currentSeconds = (System.currentTimeMillis() / 1000L).toLong()
            long windowKey = (currentSeconds / configService.rateLimitWindowSeconds).toLong()

            try {
                int requestCount = rateLimitService.incrementAndGet(ipAddress, windowKey)

                if (requestCount > configService.rateLimitRequestsPerWindow) {
                    long secondsUntilNextWindow = configService.rateLimitWindowSeconds -
                            (currentSeconds % configService.rateLimitWindowSeconds)

                    response.setStatus(429)
                    response.setHeader("Retry-After", secondsUntilNextWindow.toString())
                    response.setContentType("application/json")
                    response.setCharacterEncoding("UTF-8")
                    JSONObject error = new JSONObject()
                    error.put("error", "Too many requests")
                    response.writer.write(error.toString())
                    response.writer.flush()

                    rateLimitAlertService.notifyIfNeeded(ipAddress, requestCount)

                    return false
                }
            } catch (Exception e) {
                log.error("Rate limit check failed for IP ${ipAddress}, failing open", e)
            }
        }

        true
    }

    boolean after() {
        true
    }

    void afterView() {
        // no-op
    }

    private String extractClientIp() {
        String xff = request.getHeader("X-Forwarded-For")
        if (xff) {
            String[] parts = xff.split(",")
            // Request path: Client → ALB (appends real client IP) → Apache mod_proxy (appends ALB IP) → Tomcat
            // Real client IP is second-to-last; last entry is the ALB node IP added by Apache
            if (parts.length >= 2) {
                return parts[parts.length - 2].trim()
            }
            log.warn("X-Forwarded-For header has unexpected format: '${xff}', falling back to remoteAddr")
        }
        return request.remoteAddr
    }
}
