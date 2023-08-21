import React, { useEffect, useState } from 'react';
import GpuNode from '../GpuNode';
import { execShellCommand, getSystemSpecs } from '../../utils/scripts';
import { getImageId } from '../../database/GpuData'
import './style.scss'
const SystemSpecs = () => {
const [systemSpecs, setSystemSpecs] = useState(null);
const [isRunning, setIsRunning] = useState(false);

useEffect(() => {
    const fetchSystemSpecs = async () => {
    try {
        console.log('Fetching system specs');
        const userData = JSON.parse(localStorage.getItem('userData'));
        const imageId = await getImageId(userData.id);
        console.log('Image Id: ' + imageId);
        if(imageId){
            const status = await execShellCommand(`docker ps --filter "ancestor=${imageId}" --format "{{.Status}}"`)
            console.log('Image Status: ' + status);
            if(status.split(" ")[0] === "Up"){
                setIsRunning(true)
            }else{
                setIsRunning(false)
            }
        }

        const specs = await getSystemSpecs();
        setSystemSpecs(specs);
        console.log('Specs: ' , systemSpecs);
    } catch (error) {
        console.error('Error retrieving system specs:', error);
    }
    };

    fetchSystemSpecs();
}, []);

if (!systemSpecs) {
    return <div className='text-light'>loading...</div>
}

return (
    <div> 
        <hr/>
         <div className='card-container'> 
            <GpuNode systemSpecs={systemSpecs} isRunning={isRunning}/>
        </div> 
    </div>
);
};

export default SystemSpecs;
