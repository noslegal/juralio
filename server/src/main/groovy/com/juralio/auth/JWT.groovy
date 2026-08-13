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

package com.juralio.auth

import com.juralio.config.ConfigService
import grails.converters.JSON
import org.grails.web.json.JSONObject

class JWT {
    String jwt
    JSONObject headers
    JSONObject body
    ConfigService configService
    boolean valid = true

    void parse(){
        Base64.Decoder decoder = Base64.getUrlDecoder()
        String[] parts = jwt.split("\\.")
        String headerJson = new String(decoder.decode(parts[0]));
        String payloadJson = new String(decoder.decode(parts[1]));
        this.headers = JSON.parse(headerJson)
        this.body = JSON.parse(payloadJson)
    }


    JWT(jwt){
        this.jwt = jwt
        parse()

    }

    JSONObject getHeaders(){
        return this.headers
    }

    JSONObject getBody(){
        return this.body
    }

    boolean validate(ConfigService cs = null){
        if(cs != null){
            //for use in the filter
            configService = cs
        }

        Date currentTime = new Date()
        long secondsSinceEpoch = (long) (currentTime.getTime() / 1000)
        long nbf = Long.valueOf(this.body.get('nbf') as String)
        long exp = Long.valueOf(this.body.get('exp') as String)
        if(!(nbf < secondsSinceEpoch && secondsSinceEpoch < exp)){
            this.valid = false
        }
        return this.valid
    }

}
