import { CheckoutSelectors, LineItemMap, ShopperCurrency, StoreCurrency } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import OrderSummaryHeader from './OrderSummaryHeader';
import OrderSummaryItems from './OrderSummaryItems';
import OrderSummarySection from './OrderSummarySection';
import OrderSummarySubtotals, { OrderSummarySubtotalsProps } from './OrderSummarySubtotals';
import OrderSummaryTotal from './OrderSummaryTotal';
import removeBundledItems from './removeBundledItems';

interface Stencil_Graphql {
  channel_id: string;
  store_hash: string;
  storefront_api: any
}

interface Balance {
  available: number
}

interface Reward {
  balance?: Balance | null;
}

export interface OrderSummaryProps {
    lineItems: LineItemMap;
    total: number;
    headerLink: ReactNode;
    storeCurrency: StoreCurrency;
    shopperCurrency: ShopperCurrency;
    additionalLineItems?: ReactNode;
    applyGiftCertificate?: (code: string) => Promise<CheckoutSelectors>
}

const OrderSummary: FunctionComponent<OrderSummaryProps & OrderSummarySubtotalsProps> = ({
    storeCurrency,
    shopperCurrency,
    headerLink,
    additionalLineItems,
    lineItems,
    total,
    ...orderSummarySubtotalsProps
}) => {
    const [loyaltiPoints, setLoyaltyPoints] = useState<Reward>();
    const { applyGiftCertificate } = orderSummarySubtotalsProps;
    const nonBundledLineItems = useMemo(() => removeBundledItems(lineItems), [lineItems]);

    const loadLoyaltyPoints = useCallback(() => {
      const session_data = sessionStorage.getItem("stencil_graphql");
      let stencil_graphql:Stencil_Graphql;

      if(session_data)
        stencil_graphql = JSON.parse(session_data);
      else 
        return;

      if(stencil_graphql.storefront_api) {
        const graphql = JSON.stringify({
          query: `
            {
              customer {
                attributes {
                  attribute(entityId: 41) {
                    name
                    value
                  }
                }
              }
          }`,
          variables: {}
        });
        const requestOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'credentials': 'include',
            "Authorization": `Bearer ${stencil_graphql?.storefront_api}`
          },
          body: graphql
        };
  
        fetch("/graphql", requestOptions)
        .then(response => response.json())
        .then(result => {

          if(result.data?.customer) {
            const { data : {
              customer : {
                attributes : {
                  attribute
                }
              }
            }} = result;

            if(attribute?.value) {
              const parsedLoyaltyData: Reward = JSON.parse(attribute?.value);

              setLoyaltyPoints(parsedLoyaltyData);
            }
          }
        }).catch(error => console.log('error', error));
      }
    }, []);

    useEffect(() => {
      loadLoyaltyPoints();
    }, []);

    return (
        <article className="cart optimizedCheckout-orderSummary" data-test="cart">
            <OrderSummaryHeader>{headerLink}</OrderSummaryHeader>

            <OrderSummarySection>
                <OrderSummaryItems items={nonBundledLineItems} />
            </OrderSummarySection>

            <OrderSummarySection>
                <OrderSummarySubtotals {...orderSummarySubtotalsProps} />
                {additionalLineItems}
            </OrderSummarySection>

            {loyaltiPoints?.balance?.available && (
              <OrderSummarySection>
                <div className='reward-section'>
                  <h3 className="loyalty-discount optimizedCheckout-headingSecondary">
                    Loyalty Discount
                  </h3>
                  <div>
                    <span className='cart-priceItem-value'>{loyaltiPoints?.balance?.available}</span> off available.
                    <a
                      onClick={() => {
                        if (applyGiftCertificate) {
                          applyGiftCertificate('2Z1-IRS-A51-J3T');
                        }
                      }}
                    >
                      Click here to apply to your order
                    </a>
                  </div>
                </div>                
              </OrderSummarySection>
            )}

            <OrderSummarySection>
                <OrderSummaryTotal
                    orderAmount={total}
                    shopperCurrencyCode={shopperCurrency.code}
                    storeCurrencyCode={storeCurrency.code}
                />
            </OrderSummarySection>
        </article>
    );
};

export default OrderSummary;
