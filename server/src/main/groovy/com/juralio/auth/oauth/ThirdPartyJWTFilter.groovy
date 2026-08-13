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

import com.juralio.auth.JWT
import com.juralio.config.ConfigService
import org.grails.web.json.JSONObject
import org.springframework.stereotype.Component
import jakarta.servlet.Filter
import jakarta.servlet.FilterChain
import jakarta.servlet.FilterConfig
import jakarta.servlet.ServletException
import jakarta.servlet.ServletRequest
import jakarta.servlet.ServletResponse
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse

@Component
class ThirdPartyJWTFilter implements Filter {

    ConfigService configService

    @Override
    void destroy() {}

    @Override
    void init(FilterConfig arg0) throws ServletException {}


    @Override
    void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request
        String thirdPartyJWT = httpRequest.getHeader('x-access-token')
        if(thirdPartyJWT == null || thirdPartyJWT.length() == 0){
            chain.doFilter(httpRequest,response)
        }else {
            JWT jwt = new JWT(thirdPartyJWT)
            boolean valid = jwt.validate(configService)

            if(valid){
                chain.doFilter(httpRequest,response)
            } else {
                HttpServletResponse httpResponse =(HttpServletResponse) response;
                httpResponse.setStatus(HttpServletResponse.SC_BAD_REQUEST)

                PrintWriter out = httpResponse.getWriter();
                httpResponse.setContentType("application/json")
                httpResponse.setCharacterEncoding("UTF-8");
                JSONObject error = new JSONObject()
                error.put('error','Expired third party access token')
                out.write(error.toString())
                out.flush()
            }
        }
    }
}
