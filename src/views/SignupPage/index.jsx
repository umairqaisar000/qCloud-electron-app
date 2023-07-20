import React, { useState } from 'react'
import { pool } from '../../database/PoolConnection'
import { Modal, Button } from 'react-bootstrap'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './style.css' // Import custom CSS file for Signup component styling
import * as Yup from 'yup'

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

const SignupPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showModal, setShowModal] = useState(false) // State to control the modal visibility
  const [errors, setErrors] = useState({ email: '', password: '' })

  const handleInputChange = e => {
    const { name, value } = e.target
    setErrors(prevErrors => ({ ...prevErrors, [name]: '' }))
    if (name === 'email') {
      setEmail(value)
    } else if (name === 'password') {
      setPassword(value)
    }
  }

  const handleSignup = async () => {
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
          setErrors(prevErrors => ({ ...prevErrors, ...validationErrorsMap }))

          Object.values(validationErrorsMap).forEach(errorMsg => {
            toast.error(errorMsg)
          })
        }
        return
      } else {
        const client = await pool.connect()
        const bcrypt = window.require('bcrypt')
        const saltRounds = 10
        const hashedPassword = await bcrypt.hash(password, saltRounds)
        const query =
          'INSERT INTO client_user (email, password) VALUES ($1, $2)'
        await client.query(query, [email, hashedPassword])
        console.log('User registered')
        client.release()
        setShowModal(true) // Show the success modal
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false) // Close the modal
  }

  return (
    <div className="signup-container">
      <ToastContainer /> 
      <form className="signup-form">
        <h2 className="signup-heading">Signup</h2>
        <div className="form-group">
          <label htmlFor="email" className="signup-label">
            Email
          </label>
          <input
            type="email"
            className="signup-input"
            id="email"
            name="email"
            placeholder="Enter your email"
            value={email}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password" className="signup-label">
            Password
          </label>
          <input
            type="password"
            className="signup-input"
            name="password"
            id="password"
            placeholder="Enter your password"
            value={password}
            onChange={handleInputChange}
          />
        </div>
        <button type="button" className="signup-button" onClick={handleSignup}>
          Signup
        </button>
        <a href="/" className="login-link">
          Already have an account? Login
        </a>

        {/* Success Modal */}
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Success</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            User registration successful. You can now log in with your
            credentials.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={handleCloseModal}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </form>
    </div>
  )
}

export default SignupPage
