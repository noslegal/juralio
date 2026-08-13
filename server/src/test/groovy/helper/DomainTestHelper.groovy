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

package helper

import grails.util.Holders
import org.grails.datastore.gorm.events.AutoTimestampEventListener
import org.grails.datastore.mapping.simple.SimpleMapDatastore
import org.springframework.context.ApplicationContext

class DomainTestHelper {

    /** Turns off the auto-timestamp domain feature for a given domain class temporarily
     * for a given closure.
     *
     * This is useful for preventing GORM from updating dateCreated or lastUpdated when it is
     * required to set them to known values in a unit test.
     * @param domainClass
     * @param closure
     */
    static void executeWithoutTimestamps(Class domainClass, Closure closure) {
        ApplicationContext applicationContext = Holders.findApplicationContext()
        SimpleMapDatastore mainBean = applicationContext.getBean(SimpleMapDatastore)
        AutoTimestampEventListener listener = mainBean.mappingContext.eventListeners.find {
            it instanceof AutoTimestampEventListener
        }
        listener.withoutTimestamps(domainClass, closure)
    }
}
