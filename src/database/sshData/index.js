import { pool } from '../PoolConnection'
import { getNgrokUrl } from '../../utils/scripts'
const { v4: uuidv4 } = window.require('uuid')
const config = require('../../utils/config')

// export async function addSshCredientials() {
//   const spec_id = uuidv4()
//   var docker_url = await getNgrokUrl()
//   console.log(localStorage.getItem('current_job_id'));
//   const system_specs_id = localStorage.getItem('current_job_id')

//   const insertQuery = `
//     INSERT INTO docker_ssh (id, url, port, name, system_spec_id)
//     VALUES ($1, $2, $3, $4, $5)
//   `

//   const values = [spec_id, docker_url, 2222, 'root', system_specs_id]

//   try {
//     await pool.query(insertQuery, values)
//     console.log('Data inserted successfully into the docker ssh table.')
//   } catch (error) {
//     throw ('Error inserting data into the docker ssh table:', error)
//   } 
// }
 export const addSshCredientials = async () => {
  const spec_id = uuidv4();
  const docker_url = await getNgrokUrl();
  const system_specs_id = localStorage.getItem('current_job_id');
  console.log("in add ssh credentialss")
  const data = {
    id: spec_id,
    url: docker_url,
    port: 2222,
    name: 'root',
    system_specs_id,
  };

  try {
    const { token } = JSON.parse(localStorage.getItem('xhqr') || '{}')
    const response = await fetch(`${config.apiUrl}/docker_ssh/addSshCredentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      console.log('Data inserted successfully into the docker ssh table.');
    } else {
      console.error('Failed to insert data into the docker ssh table.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

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

export async function removeSshCredentials() {
  const system_specs_id = localStorage.getItem('current_job_id');

  try {
    const { token } = JSON.parse(localStorage.getItem('xhqr') || '{}')
    const response = await fetch(`${config.apiUrl}/docker_ssh/removeSshCredentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      },
      body: JSON.stringify({system_specs_id}),
    });

    if (response.ok) {
      console.log('Data deleted successfully from the docker ssh table.');
    } else {
      console.error('Failed to delete data from the docker ssh table.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
