import { pool } from '../PoolConnection'
import { addSshCredientials } from '../../database/sshData'

export const addGpuData = async (systemSpecs, user_id, image_id) => {
  const gpuData = systemSpecs['gpu'] ? systemSpecs['gpu'][0] : null
  const ramData = systemSpecs['ram']
  const cpuData = systemSpecs['cpu']

  // Insert the data into the PostgreSQL database
  console.log('data::', user_id, image_id)
  
  if(user_id === null && image_id === null)
  { 
    throw ('Error adding data to the database ERROR: User or Docker Image Not Found')
  }

  const query =
  'INSERT INTO system_specs (gpu_name, gpu_free, gpu_used, gpu_total, ram_free, ram_used, cpu_name, user_id, image_id) VALUES ($1, $2, $3, $4, $5, $6, $7,$8, $9) RETURNING id'

  const values = [
    gpuData ? gpuData.name : null,
    gpuData ? gpuData.free : null,
    gpuData ? gpuData.used : null,
    gpuData ? gpuData.total : null,
    ramData ? ramData.free : null,
    ramData ? ramData.used : null,
    cpuData ? cpuData : null,
    user_id ? user_id : null,
    image_id ? image_id : null
  ]

  try {
    const result = await pool.query(query, values)
    const insertedId = result.rows[0].id
    localStorage.setItem('current_job_id', insertedId)
    console.log('Inserted data with ID:', insertedId)

    await addSshCredientials()

  } catch (err) {
    console.error('Error inserting data', err)
    throw ('Error inserting data', err)
  }
}

export const removeGpuData = async () => {
  // Insert the data into the PostgreSQL database
    const query = `DELETE FROM system_specs s WHERE s.id = ${localStorage.getItem(
      'current_job_id'
    )}`

    try {
      const result = await pool.query(query)
      localStorage.removeItem('current_job_id')
    } catch (err) {
      throw ('Error Deleting data', err)
    }
}

export const getImageId = async user_id => {
  // Insert the data into the PostgreSQL database

  const query = `SELECT image_id FROM system_specs s WHERE s.user_id = ${user_id}`
  try {
    const result = await pool.query(query)
    return result?.rows[0]?.image_id
  } catch (err) {
    throw ('Error getting data', err)
  }
}
