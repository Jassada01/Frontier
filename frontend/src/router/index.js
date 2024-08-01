/*
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home/home-view.vue'
import Login from '../views/Login/login-view.vue'
import UserManagement from '../views/User/user-management.vue'
import UserIndex from '../views/User/user-index.vue'
import ClientManagement from '../views/Client/client-management.vue'
import ClientIndex from '../views/Client/client-Index.vue'
import AgentManagement from '../views/Agent/agent-management.vue'
import AgentIndex from '../views/Agent/agent-index.vue'
import ZoneManagement from '../views/Zone/zone-management.vue'
import ZoneIndex from '../views/Zone/zone-index.vue'
import TruckCompanyManagement from '../views/TruckCompanies/truckCompany-management.vue'
import TruckCompanyIndex from '../views/TruckCompanies/truckCompany-index.vue'
import DriverManagement from '../views/Driver/driver-management.vue'
import DriverIndex from '../views/Driver/driver-index.vue'
import YardManagement from '../views/Yard/yard-management.vue'
import YardIndex from '../views/Yard/yard-index.vue'
import EquipmentInterchangeReceiptManagement from '../views/EIR/EIR-management.vue'
//import EquipmentInterchangeReceiptIndex from '../views/EquipmentInterchangeReceipt/equipmentInterchangeReceipt-index.vue'

const routes = [
  // Home and Login
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },

  // User Management
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
  },

  // Client Management
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
  },

  // Agent Management
  {
    path: '/Agent',
    name: 'CreateAgent',
    component: AgentManagement
  },
  {
    path: '/Agent/:id',
    name: 'EditAgent',
    component: AgentManagement,
    props: true
  },
  {
    path: '/AgentIndex',
    name: 'AgentIndex',
    component: AgentIndex
  },

  // Zone Management
  {
    path: '/Zone',
    name: 'CreateZone',
    component: ZoneManagement
  },
  {
    path: '/Zone/:id',
    name: 'EditZone',
    component: ZoneManagement,
    props: true
  },
  {
    path: '/ZoneIndex',
    name: 'ZoneIndex',
    component: ZoneIndex
  },

  // Truck Company Management
  {
    path: '/TruckCompany',
    name: 'CreateTruckCompany',
    component: TruckCompanyManagement
  },
  {
    path: '/TruckCompany/:id',
    name: 'EditTruckCompany',
    component: TruckCompanyManagement,
    props: true
  },
  {
    path: '/TruckCompanyIndex',
    name: 'TruckCompanyIndex',
    component: TruckCompanyIndex
  },

  // Driver Management
  {
    path: '/Driver',
    name: 'CreateDriver',
    component: DriverManagement
  },
  {
    path: '/Driver/:id',
    name: 'EditDriver',
    component: DriverManagement,
    props: true
  },
  {
    path: '/DriverIndex',
    name: 'DriverIndex',
    component: DriverIndex
  },

  // Yard Management
  {
    path: '/Yard',
    name: 'CreateYard',
    component: YardManagement
  },
  {
    path: '/Yard/:id',
    name: 'EditYard',
    component: YardManagement,
    props: true
  },
  {
    path: '/YardIndex',
    name: 'YardIndex',
    component: YardIndex
  },

  // Equipment Interchange Receipt Management
  {
    path: '/EquipmentInterchangeReceipt',
    name: 'CreateEquipmentInterchangeReceipt',
    component: EquipmentInterchangeReceiptManagement
  },
  {
    path: '/EquipmentInterchangeReceipt/:id',
    name: 'EditEquipmentInterchangeReceipt',
    component: EquipmentInterchangeReceiptManagement,
    props: true
  },
  /*
  {
    path: '/EquipmentInterchangeReceiptIndex',
    name: 'EquipmentInterchangeReceiptIndex',
    component: EquipmentInterchangeReceiptIndex
  }

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
  */
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home/home-view.vue'
import Login from '../views/Login/login-view.vue'
import userRoutes from './userRoutes'
import clientRoutes from './clientRoutes'
import agentRoutes from './agentRoutes'
import zoneRoutes from './zoneRoutes'
import truckCompanyRoutes from './truckCompanyRoutes'
import driverRoutes from './driverRoutes'
import yardRoutes from './yardRoutes'
import EIRRoutes from './EIRRoutes'
import priceRoutes from './priceRoutes' // เพิ่มบรรทัดนี้
import lineLoginRoutes from './lineLoginRoutes'

const routes = [
  // Home and Login
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  // User Management
  ...userRoutes,
  // Client Management
  ...clientRoutes,
  // Agent Management
  ...agentRoutes,
  // Zone Management
  ...zoneRoutes,
  // Truck Company Management
  ...truckCompanyRoutes,
  // Driver Management
  ...driverRoutes,
  // Yard Management
  ...yardRoutes,
  // EIR Management
  ...EIRRoutes,
  ...priceRoutes, // เพิ่มบรรทัดนี้
  ...lineLoginRoutes
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
