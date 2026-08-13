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

package com.juralio.costs

import com.juralio.organisation.Organisation
import com.juralio.organisationgroup.GroupPosition

class RateType {

    String name
    Organisation organisation
    Boolean isStandard
    Boolean isBreakeven
    Boolean isPremium
    Boolean isAgreedClient
    Boolean isAgreedMatter
    GroupPosition groupPosition
    static constraints = {
    }

    String getSysName(){
        if(this.isAgreedClient){
            if(this.groupPosition.name == "Client"){
                return 'Agreed - Advisor'
            }else{
                return 'Agreed - Client'
            }
        }else if(this.isStandard){
            if(this.groupPosition.name == "Client"){
                return 'Target'
            }else{
                return 'Standard'
            }
        } else if(this.isBreakeven){
            return 'Break-even'
        } else if(this.isPremium){
            return 'Premium'
        } else if(this.isAgreedMatter){
            return 'Agreed - Matter'
        }
    }
}
