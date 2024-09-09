import LineLogin from '../views/LineProcess/line-login.vue'
import UserDashboard from '../views/LineProcess/user-dashboard.vue'

const lineLoginRoutes = [
  {
    path: '/Linelogin',
    name: 'Linelogin',
    component: LineLogin
  },
  {
    path: '/LineDashboard',
    name: 'LineDashboard',
    component: UserDashboard,
    props: true
  }
]

export default lineLoginRoutes
