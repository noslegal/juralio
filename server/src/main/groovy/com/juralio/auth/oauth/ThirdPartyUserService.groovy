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

package com.juralio.auth.oauth

import com.juralio.config.ConfigService
import grails.converters.JSON
import grails.gorm.transactions.Transactional
import org.apache.http.HttpEntity
import org.apache.http.HttpResponse
import org.apache.http.NameValuePair
import org.apache.http.client.HttpClient
import org.apache.http.client.entity.UrlEncodedFormEntity
import org.apache.http.client.methods.HttpGet
import org.apache.http.client.methods.HttpPost
import org.apache.http.impl.client.HttpClients
import org.apache.http.message.BasicNameValuePair
import org.apache.http.util.EntityUtils
import org.grails.web.json.JSONObject

@Transactional
class ThirdPartyUserService {

    ConfigService configService

    JSONObject getAuthToken(String accessToken, boolean  isRefresh = false){
        String tenant = configService.microsoftTenantId
        String client = configService.microsoftClientId
        String clientSecret = configService.microsoftSecret
        String redirectUrl = configService.microsoftRedirectUrl
        String token_url = "https://login.microsoftonline.com/common/oauth2/v2.0/token"


        HttpClient httpClient = HttpClients.createDefault()
        HttpPost httpPost = new HttpPost(token_url)
        List<NameValuePair> params = new ArrayList<NameValuePair>(6);
        params.add(new BasicNameValuePair("client_id", client));
        params.add(new BasicNameValuePair("redirect_uri", redirectUrl));
        if(isRefresh){
            params.add(new BasicNameValuePair("grant_type", "refresh_token"));
            params.add(new BasicNameValuePair("refresh_token", accessToken));
        }else{
            params.add(new BasicNameValuePair("grant_type", "authorization_code"));
            params.add(new BasicNameValuePair("code", accessToken));
        }
        params.add(new BasicNameValuePair("client_secret", clientSecret));
        httpPost.setEntity(new UrlEncodedFormEntity(params, "UTF-8"));
        HttpResponse response = httpClient.execute(httpPost);
        HttpEntity entity = response.getEntity();
        if(entity != null) {
            String retStr = EntityUtils.toString(entity)
            JSONObject json = JSON.parse(retStr) as JSONObject
            return json
        } else {
          return new JSONObject()
        }
    }

    static JSONObject getUserGraph(String accessToken){
        def graph_url = "https://graph.microsoft.com/v1.0/me"
        HttpClient httpClient = HttpClients.createDefault()
        HttpGet httpGet = new HttpGet(graph_url)
        httpGet.addHeader("Authorization","Bearer "+ accessToken)
        HttpResponse graph_response = httpClient.execute(httpGet);
        HttpEntity graph_entity = graph_response.getEntity()
        if(graph_entity != null) {
            String graphRetStr = EntityUtils.toString(graph_entity)
            return JSON.parse(graphRetStr) as JSONObject
        } else{
            return new JSONObject()
        }
    }

}
