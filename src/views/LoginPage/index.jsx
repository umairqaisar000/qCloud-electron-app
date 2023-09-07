import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../Context/AuthContext'
import { pool } from '../../database/PoolConnection'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './style.scss'
import * as Yup from 'yup'
import { AuthNavBar,InputField, Loader} from 'qlu-20-ui-library'
const config = require('../../utils/config')

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

  const handleInputChange = e => {
    const { name, value } = e.target
    // setErrors(prevErrors => ({ ...prevErrors, [name]: '' }))
    if (name === 'email') {
      setEmail(value)
    } else if (name === 'password') {
      setPassword(value)
    }
  }

  const handleLogin = async () => {
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
    try {
      const isValid = await validationSchema.isValid({ email, password })
      if (!isValid) {
        try {
          await validationSchema.validate(
            { email, password },
            { abortEarly: false }
          )
        } catch (validationErrors) {
          const validationErrorsMap = validationErrors.inner.reduce(
            (acc, error) => {
              acc[error.path] = error.message
              return acc
            },
            {}
          )
          // setErrors(prevErrors => ({ ...prevErrors, ...validationErrorsMap }))

          Object.values(validationErrorsMap).forEach(errorMsg => {
            toast.error(errorMsg)
          })
        }
        return
      } else {
        const client = await pool.connect()
        const bcrypt = window.require('bcrypt')
        const query = 'SELECT * FROM members WHERE email = $1'
        const result = await client.query(query, [email])

        if (result.rowCount === 1) {
          const storedPassword = result.rows[0].password // Assuming the password column is named "password" in the database
          console.log('storedPassword:', storedPassword)
          // Compare the stored password with the entered password
          const passwordMatch = await bcrypt.compare(password, storedPassword)

          if (passwordMatch) {
            console.log('User authenticated')
            //   setIsAuthenticated(true)
            //   localStorage.setItem('userData', email);
            login(result.rows[0].id,
              result.rows[0].email,
              result.rows[0].org_id)
            navigate('/homepage')
          } else {
            console.log('Invalid email or password')
          }

          client.release()
        }
      }
    } catch (error) {
      console.error(error)
    }
  }

  const LoginHandler = async (email, password) => {
    setLoading(true);
    setEmailError('');
    setPasswordError('');

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
        localStorage.setItem('userData', JSON.stringify(response.user));
        localStorage.setItem('xhqr', JSON.stringify(response.user?.xhqr));
        navigate('/homepage');
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
