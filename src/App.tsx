import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AdminLayout } from './layout/AdminLayout'
import { DashboardPage } from './pages/DashboardPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { UserDetailPage } from './pages/UserDetailPage'
import { UserListPage } from './pages/UserListPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AdminLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'users', element: <UserListPage /> },
      { path: 'users/:userId', element: <UserDetailPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
