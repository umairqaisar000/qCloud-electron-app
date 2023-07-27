import { pool } from '../PoolConnection'
import { getNgrokUrl } from '../../utils/scripts'
const { v4: uuidv4 } = window.require('uuid')

export async function addSshCredientials() {
  const spec_id = uuidv4()
  var docker_url = await getNgrokUrl()
  console.log(localStorage.getItem('current_job_id'));
  const system_specs_id = localStorage.getItem('current_job_id')

  const insertQuery = `
    INSERT INTO docker_ssh (id, url, port, name, system_spec_id)
    VALUES ($1, $2, $3, $4, $5)
  `

  const values = [spec_id, docker_url, 2222, 'root', system_specs_id]

  try {
    await pool.query(insertQuery, values)
    console.log('Data inserted successfully into the docker ssh table.')
  } catch (error) {
    throw ('Error inserting data into the docker ssh table:', error)
  } 
}

export async function removeSshCredientials() {
  const system_specs_id = localStorage.getItem('current_job_id')
  const deleteQuery = `
    DELETE FROM docker_ssh WHERE system_spec_id = ${system_specs_id}`

  try {
    await pool.query(deleteQuery)
    console.log('Data deleted successfully into the Urls table.')
  } catch (error) {
    throw ('Error deleting data into the docker ssh table:', error)
  }
}
