import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import { getDatabase } from '../database';
import { bulkInsertOrderItems, getOrderItems } from '../models/orderItems';
import { bulkInsertOrders, getOrders } from '../models/order';

const TestOrderInsertScreen = () => {
    const [status, setStatus] = useState('');

    // Sample order data
    const orderData = {
        createdAt: 1746603707,
        updatedAt: 1746603707,
        id: 25,
        userId: 9,
        totalAmount: 840,
        status: "placed",
        canteenId: 1,
        menuConfigurationId: 2,
        createdById: 9,
        updatedById: null,
        qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAYAAAB1PADUAAAAAklEQVR4AewaftIAAATMSURBVO3BQY4jRxAEwfAC//9l1xzzVECjk6PVKszwR6qWnFQtOqladFK16KRq0UnVopOqRSdVi06qFp1ULTqpWnRSteikatFJ1aKTqkUnVYs+eQnIb1LzBJBJzQ2QJ9TcAHlCzQTkN6l546Rq0UnVopOqRZ8sU7MJyBNAJjXfBGRSc6NmAvKEmk1ANp1ULTqpWnRSteiTLwPyhJongExqNqmZgExqbtRMQDYBeULNN51ULTqpWnRSteiTvxyQSc2NmgnIE0AmNTdq/iYnVYtOqhadVC365C8DZFIzAblRM6mZgExAJjX/ZydVi06qFp1ULfrky9T8JjU3at5Q8wSQSc0mNX+Sk6pFJ1WLTqoWfbIMyJ8EyKRmAjKpmYBMaiYgk5ongExqboD8yU6qFp1ULTqpWvTJS2r+JEAmNROQfxOQSc2Nmv+Sk6pFJ1WLTqoW4Y+8AGRSMwHZpOYGyI2abwIyqbkBMqmZgGxS800nVYtOqhadVC365A+n5gbIpOYGyCY1N0Bu1ExA3lDzBJBJzRsnVYtOqhadVC365CU1E5BJzQ2QSc0EZJOaGyBPAJnUTEAmNW+omYC8oWbTSdWik6pFJ1WLPlmm5gk1E5BJzQRkUjMBeULNjZoJyBNq3lAzAZnUPAFkUrPppGrRSdWik6pF+CMvAJnUTEAmNROQSc0E5Ak1N0Bu1ExANqmZgExq3gByo+abTqoWnVQtOqla9MlLap4A8oSaCcgTQN5Q8wSQGyCTmgnIG2omIDdAJjVvnFQtOqladFK16JNlQG7UTEAmIDdqJiA3aiYgk5ongExqbtQ8oWYC8k1qNp1ULTqpWnRStQh/5BcBuVFzA2RSMwGZ1LwBZFLzm4BMaiYgk5obIJOaTSdVi06qFp1ULcIfeQHIE2q+Ccg3qbkB8oSaGyCb1ExAJjVvnFQtOqladFK16JNlaiYgE5BJzQTkDTUTkEnNBOQJIE+ouQFyo2YCMqmZgDyhZtNJ1aKTqkUnVYs++ZcBmdTcALkBMqmZgExqJiCTmhsgk5obIJOaGyCTmgnIpOYGyKRm00nVopOqRSdVi/BHXgAyqbkBMqm5ATKpmYBMaiYgT6iZgExqboBMam6AbFIzAXlCzRsnVYtOqhadVC3CH/kPA7JJzTcBuVHzBJBNat44qVp0UrXopGrRJy8B+U1qJjUTkBs1E5AngExqJiCbgExq3lDzTSdVi06qFp1ULfpkmZpNQG6AfBOQSc2NmgnIpGYCcqPmDTUTkBs1b5xULTqpWnRSteiTLwPyhJo31NwAeULNBOQJNU8AeUPNBORGzaaTqkUnVYtOqhZ98pcBMql5A8ikZgIyqZmATGpu1LwB5Akgk5o3TqoWnVQtOqla9MlfDsgmIE+oeQPIE2peADKp2XRSteikatFJ1aJPvkzNN6mZgDyhZgKyCcgbaiYgk5oJyKRm00nVopOqRSdVi/BHqpacVC06qVp0UrXopGrRSdWik6pFJ1WLTqoWnVQtOqladFK16KRq0UnVopOqRSdVi06qFv2DLuufFN6u4D4AAAAASUVORK5CYII=",
        orderItems: [
            {
                createdAt: 1746603707,
                updatedAt: 1746603707,
                id: 29,
                orderId: 25,
                itemId: 6,
                quantity: 1,
                price: 160,
                total: 160,
                createdById: 9,
                updatedById: null
            },
            {
                createdAt: 1746603707,
                updatedAt: 1746603707,
                id: 31,
                orderId: 25,
                itemId: 4,
                quantity: 3,
                price: 150,
                total: 450,
                createdById: 9,
                updatedById: null
            }
        ]
    };

    const handleInsert = async () => {
        try {
            const db = getDatabase();

            // Insert order
            await bulkInsertOrders([orderData]);

            // Insert order items
            await bulkInsertOrderItems(orderData.orderItems);

            setStatus('Order data inserted successfully!');
        } catch (error) {
            console.error('Insert error:', error);
            setStatus('Failed to insert order data');
        }
    };

    const verifyData = async () => {
        try {
            // Get orders
            const orders = await getOrders();
            console.log('Orders:', orders);

            // Get order items
            const orderItems = await getOrderItems(25);
            console.log('Order items:', orderItems);

            setStatus(`Found ${orders.length} orders and ${orderItems.length} items`);
        } catch (error) {
            console.error('Verification error:', error);
            setStatus('Failed to verify data');
        }
    };

    return (
        <View style={{ padding: 20 }}>
            <Text>Test Order Insertion</Text>
            <Button title="Insert Order Data" onPress={handleInsert} />
            <Button title="Verify Data" onPress={verifyData} />
            <Text>{status}</Text>
        </View>
    );
};

export default TestOrderInsertScreen;