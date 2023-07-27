import React, { useEffect, useState } from 'react';

import GpuNode from '../GpuNode';
import { execShellCommand, getSystemSpecs } from '../../utils/scripts';
import { getImageId } from '../../database/GpuData'

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
            if(status.split(" ")[0] === "Up"){
                setIsRunning(true)
            }else{
                setIsRunning(false)
            }
        }

        const specs = await getSystemSpecs();
        setSystemSpecs(specs);
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
        <h2 className='mt-4 text-warning'>List of available GPUs:</h2>
        <div className='d-flex'>
            <GpuNode systemSpecs={systemSpecs} isRunning={isRunning}/>
        </div>
    </div>
);
};

export default SystemSpecs;
