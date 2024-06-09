import AgentManagement from '../views/Agent/agent-management.vue'
import AgentIndex from '../views/Agent/agent-index.vue'

const agentRoutes = [
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
  }
]

export default agentRoutes
