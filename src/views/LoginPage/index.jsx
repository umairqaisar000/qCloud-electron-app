
import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../Context/AuthContext'
import { pool } from '../../database/PoolConnection'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './style.scss'
import * as Yup from 'yup'
import { AuthNavBar,InputField, Loader} from 'qlu-20-ui-library'
import { addNgrokToken } from '../../database/membersData'
const { dialog } = window.require('electron').remote;
const prompt = window.require('electron-prompt');
const { exec } = window.require('child_process')

//const { addNgrokToken } = require('../../database/membersData');

// const { ipcRenderer } = window.require('electron');

let user_id;
const config = require('../../utils/config')

const execShellCommand = cmd => {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error)
      } else {
        resolve(stdout || stderr)
      }
    })
  })
}
const validationSchema = Yup.object().shape({
  email: Yup.string()
    .min(8, 'email must be at least 8 characters long')
    .required('email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters long')
    .matches(/[a-z]/, 'Password must contain at least one lowercase char')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase char')
    .matches(/[0-9]+/, 'Password must contains at least one number.')
    .matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      'Password must contain at least one specialdispatch(increment()) char'
    )
    .required('Password is required')
})

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const { login } = useContext(AuthContext)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [loading, setLoading] = useState(false);

  let options = {
      title: 'Enter Ngrok Auth Token',
      label: 'AuthToken:',
      value: '',
      inputAttrs: { type: 'text' },
      type: 'input'
};
let userInputToken;

  const LoginHandler = async (email, password) => {
    setLoading(true);
    setEmailError('');
    setPasswordError('');
    // const authToken = await ipcRenderer.invoke('get-ngrok-auth-token');

    try {
      await validationSchema.validate({ email, password }, { abortEarly: false });

      const response = await fetch(config.apiUrl + '/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      }).then((response) => response.json());

      if (response.success === true) {
        console.log("Login User Response:",response.user);
        user_id=response.user.id;
        localStorage.setItem('userData', JSON.stringify(response.user));
        console.log("Xhqr token:",response.user.xhqr);
        localStorage.setItem('xhqr', JSON.stringify(response.user?.xhqr));
        const userData = JSON.parse(localStorage.getItem('userData'));
        console.log("user data from localStorage:",userData);
        if (userData && userData.ngrok_token === null) { 
          console.log("here to ask for token");
         await prompt(options).then(r => {
              if (r !== null && r.trim() !== "") {
                console.log("rrrrr111",r);
                userInputToken = r;
                console.log("user input token:",userInputToken);
              } else {
                console.log("rrrrr222",r);
                toast.error('Please Enter Authtoken to Proceed');
              }
            })
        
          console.log("here to ask for token2");
          if (userInputToken) {
              userData.ngrok_token = userInputToken; // Update the ngrok_token in userData object
              console.log("Token Input by user:",userData.ngrok_token);
              localStorage.setItem('userData', JSON.stringify(userData));  // Store the updated userData back to localStorage
              await addNgrokToken(user_id, userInputToken);
              navigate('/homepage'); 
          }
      } else if (userData && userData.ngrok_token) {
        console.log("navigating to homepage....")
        navigate('/homepage');
      }
        
      } else {
        toast.error('Incorrect email or password. Please re-enter.');
      }
    } catch (validationError) {
      // Handle Yup validation errors
      validationError.inner.forEach((error) => {
        if (error.path === 'email') {
          setEmailError(error.message);
        } else if (error.path === 'password') {
          setPasswordError(error.message);
        }
        toast.error(error.message);
      });
    } finally {
      setLoading(false);
    }
  };

return (
    <div className="login-page">
      <div className="top_nav_bar">
        <AuthNavBar
        text="Don't have an account?"
        textColor="gray"
        buttonText="Sign up"
        buttonColorVaraint="primaryOrangeBorderAndText"
        ></AuthNavBar>
      </div>
      <div className="login-container">
      <h3>Login</h3>
        <div className="login-details">
          <div className="email">
          <label className="email">WORK EMAIL</label>
          <InputField
              id="email"
              value={email}
              onChangeHandler={e => setEmail(e.target.value)}
              placeholder='Enter your email address'
              required
            />
             {emailError && <p className="error-message">{emailError}</p>}
          </div>
          <div className="pass">
          <label htmlFor="" className="password">
              PASSWORD
            </label>
            <InputField
              type="password"
              value={password}
              placeholder='Enter your password'
              onChangeHandler={e => setPassword(e.target.value)}
              required
            />
            {passwordError && <p className="error-message">{passwordError}</p>}
          </div>
          <div className="button">
          <button
            type="submit"
            className="primaryButton"
            onClick={() => LoginHandler(email,password)}
            disabled={loading}
          >
           {loading ? <Loader/> : 'Login'}
          </button>
        </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>

   
  )
}

export default LoginPage
