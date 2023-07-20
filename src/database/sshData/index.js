import { pool } from '../PoolConnection'
import { getNgrokUrl } from '../../utils/scripts'
const { v4: uuidv4 } = window.require('uuid')

export async function addSshCredientials() {
  const spec_id = uuidv4()
  var docker_url = await getNgrokUrl()

  const system_specs_id = localStorage.getItem('current_job_id')

  const client = await pool.connect()
  const insertQuery = `
    INSERT INTO docker_ssh (id, url, port, name, system_spec_id)
    VALUES ($1, $2, $3, $4, $5)
  `

  const values = [spec_id, docker_url, 2222, 'root', system_specs_id]

  try {
    await client.query(insertQuery, values)
    console.log('Data inserted successfully into the Urls table.')
  } catch (error) {
    console.error('Error inserting data into the Urls table:', error)
  } finally {
    client.release()
  }
}
