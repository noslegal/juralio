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

package com.juralio.ratelimit

import com.juralio.aws.SESService
import com.juralio.config.ConfigService

class RateLimitAlertService {

    SESService sesService
    ConfigService configService

    private static final int MAX_TRACKED_IPS = 10000

    // LRU cache bounded at MAX_TRACKED_IPS — evicts least-recently-alerted IP when full
    private final Map<String, Long> lastAlertedAt = Collections.synchronizedMap(
        new LinkedHashMap<String, Long>(MAX_TRACKED_IPS, 0.75f, true) {
            @Override
            protected boolean removeEldestEntry(Map.Entry eldest) {
                return size() > MAX_TRACKED_IPS
            }
        }
    )

    void notifyIfNeeded(String ipAddress, int requestCount) {
        long now = System.currentTimeMillis()
        long cooldownMs = configService.rateLimitAlertCooldownSeconds * 1000L
        boolean shouldSend = false

        lastAlertedAt.compute(ipAddress) { key, existing ->
            if (existing == null || (now - existing) >= cooldownMs) {
                shouldSend = true
                return now
            }
            return existing
        }

        if (!shouldSend) return

        String domain = configService.domain
        if (!domain) return

        String subject = "Rate limit triggered on ${domain}"
        String body = """<html><body>
            <p>IP address <strong>${ipAddress}</strong> has hit the API rate limit.</p>
            <p>Request count: ${requestCount} requests within a ${configService.rateLimitWindowSeconds}s window</p>
            <p>Limit: ${configService.rateLimitRequestsPerWindow} requests per window</p>
            <p>Domain: ${domain}</p>
            </body></html>"""

        try {
            sesService.sendEmail(configService.rateLimitAlertEmail, subject, body)
        } catch (Exception e) {
            log.error("Failed to send rate limit alert email for IP ${ipAddress}", e)
        }
    }
}
