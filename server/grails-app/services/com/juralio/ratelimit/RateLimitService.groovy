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

import com.juralio.config.ConfigService
import groovy.sql.Sql
import org.springframework.scheduling.annotation.Scheduled

class RateLimitService {

    boolean lazyInit = false
    Sql groovySql
    ConfigService configService

    int incrementAndGet(String ipAddress, long windowKey) {
        def row = groovySql.firstRow("""
            INSERT INTO api_rate_limit (ip_address, window_key, request_count, created_at)
            VALUES ($ipAddress, $windowKey, 1, NOW())
            ON CONFLICT (ip_address, window_key)
            DO UPDATE SET request_count = api_rate_limit.request_count + 1
            RETURNING request_count
        """)
        return row.request_count as int
    }

    @Scheduled(fixedDelay = 300000L)
    void cleanupExpiredWindows() {
        log.debug('Cleaning up expired rate limit windows')
        long cutoffWindowKey = (System.currentTimeMillis() / 1000L / configService.rateLimitWindowSeconds).toLong() - 2
        groovySql.execute("DELETE FROM api_rate_limit WHERE window_key < ${cutoffWindowKey}")
    }
}
