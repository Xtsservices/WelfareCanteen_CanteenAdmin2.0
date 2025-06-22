import React, { useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { getDatabase } from '../database';
import { saveCompleteWalkinOrder, getWalkins, getWalkinById, deleteWalkin } from '../models/walkin';
import { createWalkinItem, getWalkinItems, deleteWalkinItem } from '../models/walkinItem';

const TestWalkinInsertScreen = () => {
    const [status, setStatus] = useState('');
    const [lastWalkinId, setLastWalkinId] = useState<number | null>(null);

    // Sample walk-in data
    const walkinData = {
        customerName: "John Doe",
        contactNumber: "9876543212",
        numberOfPeople: 2,
        tableNumber: "T5",
        orderStatus: "pending",
        totalAmount: 300,
        paymentMethod: "Cash",
        paymentStatus: "unpaid",
        createdById: 1,
        items: [
            {
                menuItemId: 1,
                itemName: "Idly",
                quantity: 2,
                unitPrice: 50,
                specialInstructions: "Extra chutney"
            },
            {
                menuItemId: 2,
                itemName: "Dosa",
                quantity: 1,
                unitPrice: 80,
                specialInstructions: "Less oil"
            },
            {
                menuItemId: 3,
                itemName: "Coffee",
                quantity: 2,
                unitPrice: 20
            }
        ]
    };

    const handleInsert = async () => {
        try {
            // Insert the complete walk-in order
            const walkinId = await saveCompleteWalkinOrder(walkinData);
            if (!walkinId) {
                throw new Error('Failed to insert walkin');
            }

            setLastWalkinId(walkinId);
            setStatus(`Walk-in order created with ID: ${walkinId}`);
        } catch (error) {
            console.error('Insert error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setStatus(`Failed to insert walk-in data: ${errorMessage}`);
        }
    };
    const verifyData = async () => {
        try {
            const walkins = await getWalkins();
            console.log('All walkins:', JSON.stringify(walkins, null, 2));

            if (walkins.length > 0) {
                const walkinId = walkins[0].id!;
                const walkin = await getWalkinById(walkinId);
                console.log('First walkin details:', JSON.stringify(walkin, null, 2));

                const items = await getWalkinItems(walkinId);
                console.log('Walkin items:', JSON.stringify(items, null, 2));

                setStatus(`Found ${walkins.length} walk-ins with ${items.length} items`);
                setLastWalkinId(walkinId);
            } else {
                setStatus('No walk-ins found');
            }
        } catch (error) {
            console.error('Verification error:', error);
            setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    // const verifyData = async () => {
    //     try {
    //         const walkins = await getWalkins();
    //         console.log('All walkins:', JSON.stringify(walkins, null, 2));

    //         if (walkins.length > 0) {
    //             const walkinId = walkins[0].id!;
    //             const walkin = await getWalkinById(walkinId);
    //             console.log('First walkin details:', JSON.stringify(walkin, null, 2));

    //             const items = await getWalkinItems(walkinId);
    //             console.log('Walkin items:', JSON.stringify(items, null, 2));

    //             setStatus(`Found ${walkins.length} walk-ins with ${items.length} items`);
    //             setLastWalkinId(walkinId);
    //         } else {
    //             setStatus('No walk-ins found');
    //         }
    //     } catch (error) {
    //         console.error('Verification error:', error);
    //         setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    //     }
    // };
    const resetDatabase = async () => {
        const db = getDatabase();
        await db.executeSql('DROP TABLE IF EXISTS walkins');
        await db.executeSql('DROP TABLE IF EXISTS walkin_items');
        // await createTables(db); // Recreate tables
        console.log('Database reset complete');
    };

    const handleDeleteWalkin = async () => {
        if (!lastWalkinId) {
            setStatus('No walk-in ID available to delete');
            return;
        }

        try {
            await deleteWalkin(lastWalkinId);
            setStatus(`Walk-in order ${lastWalkinId} and its items deleted successfully`);
            setLastWalkinId(null);
        } catch (error) {
            console.error('Delete error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setStatus(`Failed to delete walk-in: ${errorMessage}`);
        }
    };

    const handleDeleteLastItem = async () => {
        if (!lastWalkinId) {
            setStatus('No walk-in ID available');
            return;
        }

        try {
            const items = await getWalkinItems(lastWalkinId);
            if (items.length === 0) {
                setStatus('No items found to delete');
                return;
            }

            const lastItemId = items[items.length - 1].id;
            if (!lastItemId) {
                throw new Error('Item ID not found');
            }

            await deleteWalkinItem(lastItemId);
            setStatus(`Item ${lastItemId} deleted successfully from walk-in ${lastWalkinId}`);
        } catch (error) {
            console.error('Delete item error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setStatus(`Failed to delete item: ${errorMessage}`);
        }
    };

    const handleClearAll = async () => {
        try {
            const db = getDatabase();
            await db.executeSql('DELETE FROM walkins');
            await db.executeSql('DELETE FROM walkin_items');
            setStatus('All walk-ins and items cleared');
            setLastWalkinId(null);
        } catch (error) {
            console.error('Clear all error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setStatus(`Failed to clear data: ${errorMessage}`);
        }
    };

    return (
        <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                Test Walk-in Order Operations
            </Text>

            <Button title="Insert Walk-in Data" onPress={handleInsert} />
            <Button title="Verify Data" onPress={verifyData} />

            <View style={{ marginTop: 10, display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Button
                    title="Delete Last Walk-in"
                    onPress={handleDeleteWalkin}
                    color="orange"
                    disabled={!lastWalkinId}
                />
                <Button
                    title="Delete Last Item"
                    onPress={handleDeleteLastItem}
                    color="orange"
                    disabled={!lastWalkinId}
                />
                <Button
                    title="Clear All Data"
                    onPress={handleClearAll}
                    color="red"
                />
                 <Button
                    title="Rest Walkin tables"
                    onPress={resetDatabase}
                    color="red"
                />
                
            </View>

            <Text style={{ marginTop: 20 }}>{status}</Text>

            {lastWalkinId && (
                <Text style={{ marginTop: 10 }}>
                    Last Walk-in ID: {lastWalkinId}
                </Text>
            )}
        </View>
    );
};

export default TestWalkinInsertScreen;