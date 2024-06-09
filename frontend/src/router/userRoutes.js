import UserManagement from '../views/User/user-management.vue'
import UserIndex from '../views/User/user-index.vue'

const userRoutes = [
  {
    path: '/user',
    name: 'CreateUser',
    component: UserManagement
  },
  {
    path: '/user/:id',
    name: 'EditUser',
    component: UserManagement,
    props: true
  },
  {
    path: '/UserIndex',
    name: 'UserIndex',
    component: UserIndex
  }
]

export default userRoutes
