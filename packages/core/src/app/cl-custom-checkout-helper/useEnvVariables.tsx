import { useState } from 'react';

interface EnvConfig {
    nextApiURL: string;
    rewardEntityId: number
}

const dev: EnvConfig = {
    nextApiURL: 'http://localhost:3030/api/bigcommerce',
    rewardEntityId: 41
}

const useEnvVariables = () => {
    const [ envConfig ] = useState<EnvConfig>(dev);

    // TODO: process.env. is not working
    // useEffect(() => {
    //     setEnvConfig({
    //         nextApiURL: process.env.NX_NEXT_API_URL as string || '',
    //         rewardEntityId: parseInt(process.env.NX_REWARD_ENTITY_ID as string || '41', 10)
    //     })
    // }, []);

    return { envConfig };
};

export default useEnvVariables;
