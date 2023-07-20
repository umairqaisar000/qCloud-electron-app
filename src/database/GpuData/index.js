import { pool } from '../PoolConnection'

export const addGpuData = systemSpecs => {
  const gpuData = systemSpecs['gpu'] ? systemSpecs['gpu'][0] : null
  const ramData = systemSpecs['ram']
  const cpuData = systemSpecs['cpu']

  // Insert the data into the PostgreSQL database
  pool.connect((err, client, done) => {
    if (err) {
      console.error('Error connecting to the database', err)
      return
    }

    const query =
      'INSERT INTO system_specs (gpu_name, gpu_free, gpu_used, gpu_total, ram_free, ram_used, cpu_name) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id'

    const values = [
      gpuData ? gpuData.name : null,
      gpuData ? gpuData.free : null,
      gpuData ? gpuData.used : null,
      gpuData ? gpuData.total : null,
      ramData ? ramData.free : null,
      ramData ? ramData.used : null,
      cpuData ? cpuData : null
    ]

    client.query(query, values, (err, result) => {
      if (err) {
        console.error('Error inserting data', err)
      } else {
        const insertedId = result.rows[0].id
        localStorage.setItem('current_job_id', insertedId)
        console.log('Inserted data with ID:', insertedId)
      }

      // Release the database client
      done()
    })
  })

  // Close the pool connection
  // pool.end()
}
