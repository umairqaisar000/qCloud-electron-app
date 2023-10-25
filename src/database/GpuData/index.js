import { pool } from '../PoolConnection'
import { addSshCredientials } from '../../database/sshData'

//const SERVER_URL = import.meta.env.VITE_APP_SERVER_URL;
const config = require('../../utils/config')

export const addGpuData = async (
  systemSpecs,
  user_id,
  image_id,
  gpu_status,
  containerName
) => {
  try {
    console.log('in Add gpu data')
    console.log('Image ID in add gpu data: ' + image_id)
    console.log('User ID in add gpu data:' + user_id)
    console.log('System specs in add gpu data:' + systemSpecs)
    console.log('gpu status in add gpu data: ' + gpu_status)
    console.log('container name in add gpu data:' + containerName)

    const org_id = JSON.parse(localStorage.getItem('userData')).org_id

    const gpuDataList = systemSpecs['gpu']
    const ramData = systemSpecs['ram']
    const cpuData = systemSpecs['cpu']
    const macAddress = systemSpecs['mac']
    const cpuSerialId = systemSpecs['cpuId']

    console.log('gpuDataList in add gpu data: ' + gpuDataList)
    console.log('ramData in add gpu data:' + ramData)
    console.log('cpuData in add gpu data:' + cpuData)
    console.log('macAddress in add gpu data: ' + macAddress)
    console.log('cpuSerialId in add gpu data:' + cpuSerialId)

    if (user_id === null && image_id === null) {
      throw 'Error adding data to the database ERROR: User or Docker Image Not Found'
    }

    console.log('MacAddress in add gpu data', macAddress)
    console.log('Cpu id  in add gpu data', cpuSerialId)

    const insertedIds = []

    const gpuData = gpuDataList[0]
    // for (const gpuData of gpuDataList) {
    console.log(
      'userID and gpuData.index in add gpu data: ' + user_id,
      gpuData.index
    )
    const requestBody = {
      gpuData: gpuData ? gpuData.name : null,
      gpuFree: gpuData ? gpuData.free : null,
      gpuUsed: gpuData ? gpuData.used : null,
      gpuTotal: gpuData ? gpuData.total : null,
      ramFree: ramData ? ramData.free : null,
      ramUsed: ramData ? ramData.used : null,
      cpuData: cpuData ? cpuData : null,
      user_id: user_id ? user_id : null,
      image_id: image_id ? image_id : null,
      gpu_status: gpu_status ? gpu_status : null,
      gpu_index: gpuData ? gpuData.index : null,
      org_id: org_id ? org_id : null,
      macAddress: macAddress ? macAddress : null,
      cpuSerialId: cpuSerialId ? cpuSerialId : null
    }
    console.log('Request Body in add gpu data: ' + JSON.stringify(requestBody))

    try {
      const response = await addSystemSpecs(requestBody)
      insertedIds.push(response.id)
    } catch (err) {
      console.error('Error inserting data', err)
      // Handle the error here
    }
    // }

    await addSshCredientials(containerName)
    console.log('Data Inserted.....indocker_ssh')
    const validInsertedIds = insertedIds.filter(id => id !== null)
    localStorage.setItem('current_job_id', validInsertedIds)
  } catch (err) {
    console.error('Error inserting data', err)
    throw err
  }
}
export const addSystemSpecs = async requestBody => {
  try {
    const { token } = JSON.parse(localStorage.getItem('xhqr') || '{}')
    console.log('Token in add gpu data for addSystemSpecs: ' + token)
    console.log('Here to call addSystemSpecs Api')

    const response = await fetch(
      `${config.apiUrl}/system_specs/addSystemSpecs`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token
        },
        body: JSON.stringify(requestBody)
      }
    ).then(response => response.json())
    if (response.success) {
      console.log('Response from addSystemSpecs', JSON.parse(response.request))
      const jsonObject = JSON.parse(response.request)
      console.log('Inserted data with ID:', response.request)

      const insertedId = jsonObject[0].id
      localStorage.setItem('current_job_id', insertedId)
      return jsonObject[0].id
    } else {
      console.log('False response from Backend of addSystemSpecs.')
    }
  } catch (err) {
    console.error('Error adding data via fetch', err)
    throw err
  }
}
export const checkExistingRecord = async (
  macAddress,
  cpuSerialId,
  gpu_index,
  user_id
) => {
  try {
    const { token } = JSON.parse(localStorage.getItem('xhqr') || '{}')
    console.log('Token in Checking Existing Record:', token)
    console.log('macAdress in checkExistingRecord:', macAddress)
    console.log('cpuSerialId in checkExistingRecord:', cpuSerialId)
    console.log('user_id in checkExistingRecord:', user_id)
    const response = await fetch(
      `${config.apiUrl}/system_specs/checkExistingRecord`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token
        },
        body: JSON.stringify({ macAddress, cpuSerialId, gpu_index, user_id })
      }
    ).then(response => response.json())
    console.log('Resonse of Duplicate Success?,', response.success)
    console.log('Response Received,', response)
    if (!response.success) {
      throw new Error('Failed to check duplicate GPU data')
    }

    // const responseData = await response.json();
    // console.log("Response Dataa: " + responseData);
    return response.request.isDuplicate // true if duplicate, false otherwise
  } catch (err) {
    console.error('Error checking duplicate GPU data', err)
    throw err
  }
}

// export const removeGpuData = async () => {
//   // Insert the data into the PostgreSQL database
//   const query = `DELETE FROM system_specs s WHERE s.id = ${localStorage.getItem(
//     'current_job_id'
//   )}`

//   try {
//     const result = await pool.query(query)
//     localStorage.removeItem('current_job_id')
//   } catch (err) {
//     throw ('Error Deleting data', err)
//   }
// }
export const removeGpuData = async () => {
  const currentJobId = localStorage.getItem('current_job_id')

  try {
    const { token } = JSON.parse(localStorage.getItem('xhqr') || '{}')
    const response = await fetch(
      `${config.apiUrl}/system_specs/removeGpuData`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token
        },
        body: JSON.stringify({ current_job_id: currentJobId })
      }
    )

    if (!response.success) {
      throw new Error('Failed to delete GPU data')
    }

    localStorage.removeItem('current_job_id')
    console.log('GPU data removed successfully')
  } catch (err) {
    console.error('Error deleting GPU data', err)
    throw err
  }
}
// export const removeGpuUserData = async user_id => {
//   const deleteQuery = `DELETE FROM system_specs WHERE user_id = $1`
//   const deleteValues = [user_id ? user_id : null]

//   try {
//     await pool.query(deleteQuery, deleteValues)
//     console.log('Removed GPU data for user:', user_id)
//   } catch (err) {
//     console.error('Error removing GPU data', err)
//     throw ('Error removing GPU data', err)
//   }
// }
export const removeUserGpuData = async user_id => {
  try {
    const { token } = JSON.parse(localStorage.getItem('xhqr') || '{}')
    const response = await fetch(
      `${config.apiUrl}/system_specs/removeGpuUserData`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token
        },
        body: JSON.stringify({ user_id })
      }
    )

    if (!response.ok) {
      throw new Error('Failed to remove GPU data for user')
    }

    //const data = await response.json()
  } catch (err) {
    console.error('Error removing GPU data for user', err)
    throw err
  }
}

// export const getImageId = async user_id => {
//   // Insert the data into the PostgreSQL database

//   const query = `SELECT image_id FROM system_specs s WHERE s.user_id = ${user_id}`
//   try {
//     const result = await pool.query(query)
//     console.log("Image Id result:", result);
//     return result?.rows[0]?.image_id
//   } catch (err) {
//     throw ('Error getting data', err)
//   }
// }

export const getImageId = async user_id => {
  try {
    console.log('Getting Image ID user_id', user_id)
    const { token } = JSON.parse(localStorage.getItem('xhqr') || '{}')
    const response = await fetch(`${config.apiUrl}/system_specs/getImageId`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      },
      body: JSON.stringify({ user_id })
    }).then(response => response.json())

    if (!response.success) {
      throw new Error('Failed to get image ID')
    }
    console.log('Image ID response: ', response)
    return response.request
  } catch (err) {
    console.error('Error getting image ID', err)
    throw err
  }
}

// export const updateGpuStatus = async (user_id, gpu_status) => {
//   const updateQuery = `UPDATE system_specs SET gpu_status = $1 WHERE user_id = $2`
//   const updateValues = [
//     gpu_status ? gpu_status : null,
//     user_id ? user_id : null
//   ]

//   try {
//     await pool.query(updateQuery, updateValues)
//     console.log('Updated gpu_status for user:', user_id)
//   } catch (err) {
//     console.error('Error updating gpu_status', err)
//     throw ('Error updating gpu_status', err)
//   }
// }

export const updateGpuStatus = async (
  user_id,
  macAddress,
  cpuId,
  gpu_status
) => {
  try {
    const { token } = JSON.parse(localStorage.getItem('xhqr') || '{}')
    const response = await fetch(
      `${config.apiUrl}/system_specs/updateGpuStatus`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token
        },
        body: JSON.stringify({ user_id, macAddress, cpuId, gpu_status })
      }
    )

    if (!response.ok) {
      throw new Error('Failed to update GPU status')
    }

    const data = await response.json()
    console.log('Updated gpu_status for user:', user_id)
    return data.success
  } catch (err) {
    console.error('Error updating gpu_status', err)
    throw err
  }
}

// import { pool } from '../PoolConnection'
// import { addSshCredientials } from '../../database/sshData'

// export const addGpuData = async (
//   systemSpecs,
//   user_id,
//   image_id,
//   gpu_status
// ) => {
//   const gpuDataList = systemSpecs['gpu'];
//   const ramData = systemSpecs['ram'];
//   const cpuData = systemSpecs['cpu'];
//   const org_id = JSON.parse(localStorage.getItem("userData")).org_id;
//   console.log("org iddddd", org_id);
// console.log("gpustatuss",gpu_status);
//   if (user_id === null && image_id === null) {
//     throw 'Error adding data to the database ERROR: User or Docker Image Not Found';
//   }

//   try {
//     await Promise.all(
//       gpuDataList.map(async (gpuData) => {
//         const existingRecord = await checkExistingRecord(user_id, gpuData.index);

//         if (!existingRecord) {
//           const query =
//             'INSERT INTO system_specs (gpu_name, gpu_free, gpu_used, gpu_total, ram_free, ram_used, cpu_name, user_id, image_id, gpu_status, gpu_index,org_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id';

//           const values = [
//             gpuData ? gpuData.name : null,
//             gpuData ? gpuData.free : null,
//             gpuData ? gpuData.used : null,
//             gpuData ? gpuData.total : null,
//             ramData ? ramData.free : null,
//             ramData ? ramData.used : null,
//             cpuData ? cpuData : null,
//             user_id ? user_id : null,
//             image_id ? image_id : null,
//             gpu_status ? gpu_status : null,
//             gpuData ? gpuData.index : null,
//             org_id ? org_id : null
//           ];

//           try {
//             const result = await pool.query(query, values);
//             const insertedId = result.rows[0].id;
//             localStorage.setItem('current_job_id', insertedId);
//             console.log('Inserted data with ID:', insertedId);
//           } catch (err) {
//             console.error('Error inserting data', err);
//             throw err;
//           }
//         } else {
//           console.log('Data for GPU index', gpuData.index, 'already exists. Skipping insertion.');
//         }
//       })
//     );

//     await addSshCredientials();
//   } catch (err) {
//     console.error('Error inserting data', err);
//     throw err;
//   }
// };
// export const checkExistingRecord = async (user_id, gpu_index) => {
//   const query = 'SELECT COUNT(*) FROM system_specs WHERE user_id = $1 AND gpu_index = $2';
//   const values = [user_id, gpu_index];

//   try {
//     const result = await pool.query(query, values);
//     const existingRecordsCount = result.rows[0].count;
//     return existingRecordsCount > 0;
//   } catch (err) {
//     console.error('Error checking existing record', err);
//     throw err;
//   }
// };

// export const removeGpuData = async () => {
//   // Insert the data into the PostgreSQL database
//   const query = `DELETE FROM system_specs s WHERE s.id = ${localStorage.getItem(
//     'current_job_id'
//   )}`

//   try {
//     const result = await pool.query(query)
//     localStorage.removeItem('current_job_id')
//   } catch (err) {
//     throw ('Error Deleting data', err)
//   }
// }
// export const removeGpuUserData = async user_id => {
//   const deleteQuery = `DELETE FROM system_specs WHERE user_id = $1`
//   const deleteValues = [user_id ? user_id : null]

//   try {
//     await pool.query(deleteQuery, deleteValues)
//     console.log('Removed GPU data for user:', user_id)
//   } catch (err) {
//     console.error('Error removing GPU data', err)
//     throw ('Error removing GPU data', err)
//   }
// }

// export const getImageId = async user_id => {
//   // Insert the data into the PostgreSQL database

//   const query = `SELECT image_id FROM system_specs s WHERE s.user_id = ${user_id}`
//   try {
//     const result = await pool.query(query)
//     return result?.rows[0]?.image_id
//   } catch (err) {
//     throw ('Error getting data', err)
//   }
// }

// export const updateGpuStatus = async (user_id, gpu_status) => {
//   const updateQuery = `UPDATE system_specs SET gpu_status = $1 WHERE user_id = $2`
//   const updateValues = [
//     gpu_status ? gpu_status : null,
//     user_id ? user_id : null
//   ]

//   try {
//     await pool.query(updateQuery, updateValues)
//     console.log('Updated gpu_status for user:', user_id)
//   } catch (err) {
//     console.error('Error updating gpu_status', err)
//     throw ('Error updating gpu_status', err)
//   }
// }
