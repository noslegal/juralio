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

package com.juralio.aws

import grails.gorm.transactions.Transactional
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.secretsmanager.SecretsManagerClient
import software.amazon.awssdk.services.secretsmanager.model.GetSecretValueRequest
import software.amazon.awssdk.services.secretsmanager.model.GetSecretValueResponse

@Transactional
class SecretService {

    String getSecret(String secretName, Region region = Region.EU_WEST_2) {
        SecretsManagerClient client = SecretsManagerClient.builder().region(region).build()
        try {
            GetSecretValueRequest valueRequest = GetSecretValueRequest.builder().secretId(secretName).build()
            GetSecretValueResponse valueResponse = client.getSecretValue(valueRequest)
            return valueResponse.secretString()
        } finally {
            client.close()
        }
    }
}
