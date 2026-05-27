import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AdminLayout } from './layout/AdminLayout'
import { NotFoundPage } from './pages/common/NotFoundPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { LiveManagementPage } from './pages/live/LiveManagementPage'
import { NoticeDetailPage } from './pages/notices/NoticeDetailPage'
import { NoticeEditorPage } from './pages/notices/NoticeEditorPage'
import { NoticeListPage } from './pages/notices/NoticeListPage'
import { SurveyEditorPage } from './pages/surveys/SurveyEditorPage'
import { SurveyManagementPage } from './pages/surveys/SurveyManagementPage'
import { UserDetailPage } from './pages/users/UserDetailPage'
import { UserListPage } from './pages/users/UserListPage'
import { VideoDetailPage } from './pages/videos/VideoDetailPage'
import { VideoListPage } from './pages/videos/VideoListPage'

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
