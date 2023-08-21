import { pool } from '../PoolConnection'
import { addSshCredientials } from '../../database/sshData'

export const addGpuData = async (
  systemSpecs,
  user_id,
  image_id,
  gpu_status
) => {
  const gpuDataList = systemSpecs['gpu'];
  const ramData = systemSpecs['ram'];
  const cpuData = systemSpecs['cpu'];
console.log("gpustatuss",gpu_status);
  if (user_id === null && image_id === null) {
    throw 'Error adding data to the database ERROR: User or Docker Image Not Found';
  }

  try {
    await Promise.all(
      gpuDataList.map(async (gpuData) => {
        const existingRecord = await checkExistingRecord(user_id, gpuData.index);

        if (!existingRecord) {
          const query =
            'INSERT INTO system_specs (gpu_name, gpu_free, gpu_used, gpu_total, ram_free, ram_used, cpu_name, user_id, image_id, gpu_status, gpu_index) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id';

          const values = [
            gpuData ? gpuData.name : null,
            gpuData ? gpuData.free : null,
            gpuData ? gpuData.used : null,
            gpuData ? gpuData.total : null,
            ramData ? ramData.free : null,
            ramData ? ramData.used : null,
            cpuData ? cpuData : null,
            user_id ? user_id : null,
            image_id ? image_id : null,
            gpu_status ? gpu_status : null,
            gpuData ? gpuData.index : null
          ];

          try {
            const result = await pool.query(query, values);
            const insertedId = result.rows[0].id;
            localStorage.setItem('current_job_id', insertedId);
            console.log('Inserted data with ID:', insertedId);
          } catch (err) {
            console.error('Error inserting data', err);
            throw err;
          }
        } else {
          console.log('Data for GPU index', gpuData.index, 'already exists. Skipping insertion.');
        }
      })
    );

    await addSshCredientials();
  } catch (err) {
    console.error('Error inserting data', err);
    throw err;
  }
};
export const checkExistingRecord = async (user_id, gpu_index) => {
  const query = 'SELECT COUNT(*) FROM system_specs WHERE user_id = $1 AND gpu_index = $2';
  const values = [user_id, gpu_index];

  try {
    const result = await pool.query(query, values);
    const existingRecordsCount = result.rows[0].count;
    return existingRecordsCount > 0;
  } catch (err) {
    console.error('Error checking existing record', err);
    throw err;
  }
};

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
export const removeGpuUserData = async user_id => {
  const deleteQuery = `DELETE FROM system_specs WHERE user_id = $1`
  const deleteValues = [user_id ? user_id : null]

  try {
    await pool.query(deleteQuery, deleteValues)
    console.log('Removed GPU data for user:', user_id)
  } catch (err) {
    console.error('Error removing GPU data', err)
    throw ('Error removing GPU data', err)
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

export const updateGpuStatus = async (user_id, gpu_status) => {
  const updateQuery = `UPDATE system_specs SET gpu_status = $1 WHERE user_id = $2`
  const updateValues = [
    gpu_status ? gpu_status : null,
    user_id ? user_id : null
  ]

  try {
    await pool.query(updateQuery, updateValues)
    console.log('Updated gpu_status for user:', user_id)
  } catch (err) {
    console.error('Error updating gpu_status', err)
    throw ('Error updating gpu_status', err)
  }
}
