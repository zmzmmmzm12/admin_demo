import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AdminLayout } from './layout/AdminLayout'
import { DashboardPage } from './pages/DashboardPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { NoticeDetailPage } from './pages/NoticeDetailPage'
import { NoticeEditorPage } from './pages/NoticeEditorPage'
import { NoticeListPage } from './pages/NoticeListPage'
import { SurveyEditorPage } from './pages/SurveyEditorPage'
import { SurveyManagementPage } from './pages/SurveyManagementPage'
import { UserDetailPage } from './pages/UserDetailPage'
import { UserListPage } from './pages/UserListPage'
import { LiveManagementPage } from './pages/LiveManagementPage'
import { VideoDetailPage } from './pages/VideoDetailPage'
import { VideoListPage } from './pages/VideoListPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AdminLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'users', element: <UserListPage /> },
      { path: 'users/:userId', element: <UserDetailPage /> },
      { path: 'notices', element: <NoticeListPage /> },
      { path: 'notices/new', element: <NoticeEditorPage /> },
      { path: 'notices/:noticeId', element: <NoticeDetailPage /> },
      { path: 'notices/:noticeId/edit', element: <NoticeEditorPage /> },
      { path: 'surveys', element: <SurveyManagementPage /> },
      { path: 'surveys/new', element: <SurveyEditorPage /> },
      { path: 'surveys/:surveyId/edit', element: <SurveyEditorPage /> },
      { path: 'videos', element: <VideoListPage /> },
      { path: 'videos/:videoId', element: <VideoDetailPage /> },
      { path: 'live', element: <LiveManagementPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
