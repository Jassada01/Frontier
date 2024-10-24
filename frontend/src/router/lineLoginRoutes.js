import LineLogin from '../views/LineProcess/line-login.vue'
import UserDashboard from '../views/LineProcess/user-dashboard.vue'
import LineManual from '../views/LineProcess/line-manual.vue'

const lineLoginRoutes = [
  {
    path: '/GuestLogin',
    name: 'GuestLogin',
    component: LineLogin
  },
  {
    path: '/LineDashboard',
    name: 'LineDashboard',
    component: UserDashboard,
    props: true
  },
  {
    path: '/LineManual',
    name: 'LineManual',
    component: LineManual,
    props: true
  }
]

export default lineLoginRoutes
