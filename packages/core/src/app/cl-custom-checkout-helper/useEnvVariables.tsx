interface EnvConfig {
    nextApiURL: string;
    rewardEntityId: number
}

const dev: EnvConfig = {
    nextApiURL: 'http://localhost:3030/api/bigcommerce',
    rewardEntityId: 41
}

const useEnvVariables = () => {
    let envConfig: EnvConfig = dev;

    if(process.env) {
        envConfig = {
            nextApiURL: process.env.CL_NEXT_API_URL as string || dev.nextApiURL,
            rewardEntityId: parseInt((process.env.CL_REWARD_ENTITY_ID || dev.rewardEntityId) as string, 10)
        }
    }

    return { envConfig };
};

export default useEnvVariables;
