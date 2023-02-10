import { useCallback, useEffect, useState } from 'react';

import useEnvVariables from './useEnvVariables';

interface StencilGraphql {
    channel_id: string;
    store_hash: string;
    storefront_api: string;
}

interface Balance {
    available: number;
}

interface Reward {
    balance?: Balance | null;
}

const useFetchLoyaltyPoints = () => {
    const [loyaltiPoints, setLoyaltyPoints] = useState<Reward>();
    const { envConfig } = useEnvVariables();

    const loadLoyaltyPoints = useCallback(() => {
        const sessionData = sessionStorage.getItem('stencil_graphql');
        let stencilGraphql: StencilGraphql;

        if (sessionData) stencilGraphql = JSON.parse(sessionData) as StencilGraphql;
        else return;

        if (stencilGraphql.storefront_api) {
            const graphql = JSON.stringify({
                query: `query fetchRewards($rewardEntityId: Int!) {
                    customer {
                        attributes {
                            attribute(entityId: $rewardEntityId) {
                                name
                                value
                            }
                        }
                    }
                  }`,
                variables: {
                    "rewardEntityId": envConfig.rewardEntityId
                },
            });
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    credentials: 'include',
                    authorization: `Bearer ${stencilGraphql.storefront_api}`,
                },
                body: graphql,
            };

            fetch('/graphql', requestOptions)
                .then((response) => response.json())
                .then((result) => {
                    if (result?.data?.customer) {
                        const {
                            data: {
                                customer: {
                                    attributes: { attribute },
                                },
                            },
                        } = result;

                        if (attribute?.value) {
                            const parsedLoyaltyData: Reward = JSON.parse(
                                attribute?.value as string,
                            ) as Reward;

                            setLoyaltyPoints(parsedLoyaltyData);
                        }
                    }
                })
                .catch((error) => console.log('error', error));
        }
    }, []);

    useEffect(() => {
        loadLoyaltyPoints();
    }, []);

    return [loyaltiPoints];
};

export default useFetchLoyaltyPoints;
