import React, { useEffect, useState } from 'react';
import { getSystemSpecs } from '../../utils/scripts';
import GpuNode from '../GpuNode';

const SystemSpecs = () => {
const [systemSpecs, setSystemSpecs] = useState(null);

useEffect(() => {
    const fetchSystemSpecs = async () => {
    try {
        console.log('Fetching system specs');
        const specs = await getSystemSpecs();
        setSystemSpecs(specs);
    } catch (error) {
        console.error('Error retrieving system specs:', error);
    }
    };

    fetchSystemSpecs();
}, []);

if (!systemSpecs) {
    return "loading...";
    }

return (
    <div>
        <hr/>
        <h2 className='mt-4 text-warning'>List of available GPUs:</h2>
        <div className='d-flex'>
            <GpuNode systemSpecs={systemSpecs} />
        </div>
    </div>
);
};

export default SystemSpecs;
