import { useState } from 'react'
import './style.scss'
import {
  AuthNavBar,
  InputField,
} from 'qlu-20-ui-library'

//import HomePage from "../HomePage/index.jsx";
import { useNavigate, Link } from 'react-router-dom'
//import { useDispatch } from 'react-redux'
//import { setUserData } from "../../reducers/userSlice";
//import { isEmailValid } from "../../../utils";

function Login() {
  //const SERVER_URL = import.meta.env.VITE_APP_SERVER_URL;
  const [email, setEmail] = useState('')
 // const dispatch = useDispatch()
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const navigate = useNavigate()

  const loginHandler = async () => {
    setEmailError('')
    setPasswordError('')

    if (!email && !password) {
      setEmailError('Email is required')

      setPasswordError('Password is required')
      return
    }
    if (!email) {
      setEmailError('Email is required')
      return
    }

    // if (!isEmailValid(email)) {
    //   setEmailError("Invalid email format");
    //   return;
    // }

    if (!password) {
      setPasswordError('Password is required')
      return
    }

    // const data = {
    //   email,
    //   password
    // }
    // dispatch(logIn(data));

    try {
      const response = await fetch('auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      }).then(response => response.json())
      console.log(response)
      if (response.success === true) {
        console.log('Resonse-user', response.user)
        // dispatch(setUserData(response.user));
        localStorage.setItem('xhqr', JSON.stringify(response.user?.xhqr))
        navigate('/')

        //  setVerificationStatus(true);
      } else {
        navigate('/UnverifiedPage')
      }
    } catch (error) {
      console.error('Error verifying link:', error)
    }
  }

  return (
    <div className="login_page">
      <div className="auth_nav_bar">
        <AuthNavBar
          text="Don't have an account"
          textColor="gray"
          buttonText="Sign up"
          buttonColorVaraint="primaryOrangeBorderAndText"
          buttonOnClick={() => {
            navigate('/signup')
          }}
          textOnClick={() => {}}
        />
      </div>

      <div className="login_container">
        <h3>Welcome Back!</h3>
        <div className="login_details">
          <div className="email">
            <label className="email">Work Email</label>
            <InputField
              id="email"
              value={email}
              onChangeHandler={e => setEmail(e.target.value)}
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
              onChangeHandler={e => setPassword(e.target.value)}
              required
            />
            {passwordError && <p className="error-message">{passwordError}</p>}
          </div>
          <Link to="/forgot-password">Forgot Password</Link>
        </div>
        <div className="button">
          <button
            type="submit"
            className="primaryButton"
            onClick={loginHandler}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login
