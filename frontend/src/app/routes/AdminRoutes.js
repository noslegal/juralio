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

import React, { Suspense, useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Logout from '../../components/utils/logout/Logout'
import lazyWithRetry from '../../services/navigation/lazy-with-retry'
import withRouter from '../../services/navigation/WithRouter'
import NotFound from '../error-page/NotFound'

const Home = lazyWithRetry(() => import('../../admin/home/Home'))
const NoticeboardContainer = lazyWithRetry(
  () => import('../../admin/noticeboard/NoticeboardContainer')
)

const AdminRoutes = ({ redirect }) => {
  useEffect(() => {
    window.sessionStorage.removeItem('logoutUrl')
    window.sessionStorage.removeItem('logoutId')
  }, [])

  return (
    <Suspense fallback={null}>
      <Routes>
        <Route exact path="/login" element={<Navigate to={'/home'} />} />
        <Route exact path="/404" element={<NotFound />} />
        <Route exact path="/" element={<Navigate to={redirect || '/home'} />} />
        <Route exact path="/home" element={<Home />} />
        <Route exact path="/noticeboard" element={<NoticeboardContainer />} />
        <Route exact path="/logout" element={<Logout />} />
        <Route render={() => <Navigate to={'/404'} />} />
      </Routes>
    </Suspense>
  )
}

export default withRouter(AdminRoutes)
