import { CheckoutSelectors, LineItemMap, ShopperCurrency, StoreCurrency } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, ReactNode, useMemo } from 'react';

import { useFetchLoyaltyPoints } from '../cl-custom-checkout-helper';

import OrderSummaryHeader from './OrderSummaryHeader';
import OrderSummaryItems from './OrderSummaryItems';
import OrderSummarySection from './OrderSummarySection';
import OrderSummarySubtotals, { OrderSummarySubtotalsProps } from './OrderSummarySubtotals';
import OrderSummaryTotal from './OrderSummaryTotal';
import removeBundledItems from './removeBundledItems';

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
    const { applyGiftCertificate } = orderSummarySubtotalsProps;
    const nonBundledLineItems = useMemo(() => removeBundledItems(lineItems), [lineItems]);
    const [ loyaltiPoints ] = useFetchLoyaltyPoints();

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

            {loyaltiPoints?.balance?.available && applyGiftCertificate && (
              <OrderSummarySection>
                <div className='reward-section'>
                  <h3 className="loyalty-discount optimizedCheckout-headingSecondary">
                    Loyalty Discount
                  </h3>
                  <div>
                    <span className='cart-priceItem-value'>{loyaltiPoints?.balance?.available}</span> off available.
                    <a
                      onClick={() => {
                        // TODO: need to change this code when we will be having loyalty claim API ready
                        applyGiftCertificate('2Z1-IRS-A51-J3T');
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
