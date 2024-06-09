import ClientManagement from '../views/Client/client-management.vue'
import ClientIndex from '../views/Client/client-Index.vue'

const clientRoutes = [
  {
    path: '/Client',
    name: 'CreateClient',
    component: ClientManagement
  },
  {
    path: '/Client/:id',
    name: 'EditClient',
    component: ClientManagement,
    props: true
  },
  {
    path: '/ClientIndex',
    name: 'ClientIndex',
    component: ClientIndex
  }
]

export default clientRoutes
