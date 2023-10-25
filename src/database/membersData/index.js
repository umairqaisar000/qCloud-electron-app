const config = require('../../utils/config');

export const addNgrokToken = async (user_id, ngrok_token) => {
    try {
      console.log("here in addNgrokToken to add the member's token in the table.")
      const { token } = JSON.parse(localStorage.getItem('xhqr') || '{}')
      console.log("here in addNgrokToken to add the member's token in the table.2222")
      const response = await fetch(
        `${config.apiUrl}/members/add-token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token
          },
          body: JSON.stringify({ user_id, ngrok_token})
        }
      ).then(response => response.json())
      console.log('Response Received,', response)
      console.log('Resonse of Adding Ngrok Token,', response.success)
      //if response.success then save the data to the store.
      if (!response.success) {
        throw new Error('Failed to add Ngrok Token');
      }
  
      // const responseData = await response.json();
      // console.log("Response Dataa: " + responseData);
      // true if duplicate, false otherwise
    } catch (err) {
      console.error('Error adding ngrok_token: ', err)
      throw err
    }
  }

//   module.exports = { addNgrokToken };