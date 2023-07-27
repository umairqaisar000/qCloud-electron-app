import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import SystemSpecs from "../../components/SystemSpecs"
import { AuthContext } from '../../Context/AuthContext';
import { removeGpuData } from '../../database/GpuData'
import { removeSshCredientials } from '../../database/sshData'
import "./style.css"
const ngrok = window.require('ngrok')


const HomePage = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    removeGpuData();
    removeSshCredientials();
    ngrok.disconnect();
    navigate("/");
  };

  return (
    <div className="mt-5">
        <h1 className="text-light">System Specifications</h1>
      <SystemSpecs/>
      <button className="btn btn-warning logout-button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  )
}

export default HomePage
