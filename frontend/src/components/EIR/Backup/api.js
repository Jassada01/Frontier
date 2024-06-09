import axios from 'axios'
import CONFIG from '../../../config/config'

export const fetchAgents = async () => {
  try {
    const response = await axios.get(`${CONFIG.API_SERVER}/api/agents/get?active=true`)
    return response.data.map((agent) => ({
      agent_id: agent.agent_id,
      agent_code: agent.agent_code,
      label: `${agent.agent_code} - ${agent.company_name}`
    }))
  } catch (error) {
    throw new Error('Error fetching agents data')
  }
}

export const fetchClients = async () => {
  try {
    const response = await axios.get(`${CONFIG.API_SERVER}/api/client/get?active=true`)
    return response.data.map((client) => ({
      client_id: client.client_id,
      client_code: client.client_code,
      label: `${client.client_code} - ${client.name}`
    }))
  } catch (error) {
    throw new Error('Error fetching clients data')
  }
}

export const fetchDrivers = async () => {
  try {
    const response = await axios.get(`${CONFIG.API_SERVER}/api/drivers/get?active=true`)
    return response.data.map((driver) => ({
      id: driver.id,
      driver_name: driver.driver_name,
      license_plate: driver.license_plate,
      province: driver.province,
      phone_number: driver.phone_number,
      truck_company_name: driver.truck_company_name,
      driver_image_path: driver.driver_image_path,
      truck_image_path: driver.truck_image_path,
      label: `${driver.driver_name} : ${driver.license_plate} - ${driver.province}`
    }))
  } catch (error) {
    throw new Error('Error fetching drivers data')
  }
}

export const fetchYards = async () => {
  try {
    const response = await axios.get(`${CONFIG.API_SERVER}/api/yards/get?active=true`)
    return response.data.map((yard) => ({
      yard_id: yard.id,
      yard_name: yard.yard_name,
      short_name: yard.short_name,
      label: `${yard.short_name} - ${yard.yard_name}`
    }))
  } catch (error) {
    throw new Error('Error fetching yards data')
  }
}

export const fetchZones = async () => {
  try {
    const response = await axios.get(`${CONFIG.API_SERVER}/api/zones/get?active=true`)
    return response.data.map((zone) => ({
      zone_id: zone.id,
      zone_name: zone.zone,
      yard_name: zone.yard_name,
      path_map: zone.path_map,
      label: `${zone.zone} - ${zone.yard_name}`
    }))
  } catch (error) {
    throw new Error('Error fetching zones data')
  }
}
