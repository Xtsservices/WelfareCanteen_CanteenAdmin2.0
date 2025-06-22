import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { getDatabase } from '../database';
import { bulkInsertMenuItems, saveCompleteMenu } from '../models/menuItems';
import { SQLResultSet } from 'react-native-sqlite-storage';

const TestInsertScreen = () => {
  const [insertStatus, setInsertStatus] = useState('');

  // Sample API response data
  const apiResponse = {
    "message": "Message not found",
    "data": {
        "id": 1,
        "name": "Breakfast",
        "description": "qwertyuiolkjhgfds",
        "startTime": 1746383400,
        "endTime": 1746469800,
        "createdAt": 1746384641,
        "updatedAt": 1746384641,
        "menuItems": [
            {
                "id": 1,
                "menuId": 1,
                "itemId": 2,
                "minQuantity": 1,
                "maxQuantity": 10,
                "status": "active",
                "createdById": null,
                "updatedById": null,
                "createdAt": 1746384641,
                "updatedAt": 1746384641,
                "item": {
                    "id": 2,
                    "name": "dosa",
                    "description": "poiuytrewq",
                    "image": "iV++/og63Xovm2Orw9c/avPmV34Xgm+d37zyC7a39EjR5gFs8OvkgCeD++Yhj7gD/cMY2Bg7BsNMI31hecSCYczZrQ1Bn3Bw8/up827xPctHxO/Fs5qplOWTS4cHYX/IQt75QZo7upydOV6fWAp2cDSfGDJTlCaF5TqBrH9IEUPkKoPSNmLTNETTNXXJocMkhwzdVFS1rHM+doq2zl48GDz4s=",
                    "pricing": {
                        "id": 2,
                        "price": 80,
                        "currency": "INR"
                    }
                }
            },
            {
                "id": 2,
                "menuId": 1,
                "itemId": 1,
                "minQuantity": 1,
                "maxQuantity": 10,
                "status": "active",
                "createdById": null,
                "updatedById": null,
                "createdAt": 1746384641,
                "updatedAt": 1746384641,
                "item": {
                    "id": 1,
                    "name": "idly",
                    "description": "qwertyuiop",
                    "image": "L7quuHPeOWc4CUsdH9u14a6LrG9SG+JCqb/o/qj03vC/TjAt33LT1/1+8WkG+oue253IZn3PJeYH52lv7On/8OtUX0/wcNlWORcY0OkAAAAABJRU5ErkJggg==",
                    "pricing": {
                        "id": 1,
                        "price": 50,
                        "currency": "INR"
                    }
                }
            }
        ],
        "menuConfiguration": {
            "id": 1,
            "name": "Breakfast",
            "defaultStartTime": 1746412200,
            "defaultEndTime": 1746419400
        },
        "menuConfigurationId": 1
    }
  };

  const handleInsert = async () => {
    try {
      await saveCompleteMenu(apiResponse.data);
      // const db = getDatabase();
      
      // // Insert menu configuration
      // await db.executeSql(
      //   `INSERT OR REPLACE INTO menu_configurations 
      //   (id, name, defaultStartTime, defaultEndTime) 
      //   VALUES (?, ?, ?, ?)`,
      //   [
      //     apiResponse.data.menuConfiguration.id,
      //     apiResponse.data.menuConfiguration.name,
      //     apiResponse.data.menuConfiguration.defaultStartTime,
      //     apiResponse.data.menuConfiguration.defaultEndTime
      //   ]
      // );

      // // Insert menu
      // await db.executeSql(
      //   `INSERT OR REPLACE INTO menus 
      //   (id, name, description, startTime, endTime, status, menuConfigurationId, createdAt, updatedAt) 
      //   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      //   [
      //     apiResponse.data.id,
      //     apiResponse.data.name,
      //     apiResponse.data.description,
      //     apiResponse.data.startTime,
      //     apiResponse.data.endTime,
      //     'active',
      //     apiResponse.data.menuConfigurationId,
      //     apiResponse.data.createdAt,
      //     apiResponse.data.updatedAt
      //   ]
      // );

      // // Insert menu items
      // await bulkInsertMenuItems(apiResponse.data.menuItems);

      setInsertStatus('Data inserted successfully!');
    } catch (error) {
      console.error('Insert error:', error);
      if (error instanceof Error) {
        setInsertStatus(`Error: ${error.message}`);
      } else {
        setInsertStatus('An unknown error occurred.');
      }
    }
  };

  const verifyData = async () => {
    try {
      const db = await getDatabase();
      
      const menuResult = (await db.executeSql('SELECT * FROM menus WHERE id = ?', [1]) as unknown as [SQLResultSet])[0];
      console.log('Menu:', menuResult?.rows?.item(0));
      console.log('Menu:', menuResult?.rows?.item(0));
      
      // Check menu items
      const itemsResults = (await db.executeSql('SELECT * FROM menu_items WHERE menuId = ?', [1]) as unknown as [SQLResultSet]);
      const itemsResult = itemsResults[0];
      console.log('Menu items:', itemsResult?.rows?.item(0));
      
      console.log('Menu items count:', itemsResult?.rows.length);
      
      setInsertStatus(`Verification complete. Found ${itemsResult?.rows.length ?? 0} menu items.`);
    } catch (error) {
      console.error('Verification error:', error);
      if (error instanceof Error) {
        setInsertStatus(`Verification error: ${error.message}`);
      } else {
        setInsertStatus('An unknown verification error occurred');
      }
    }
  };

  return (
    <View style={{ padding: 20 }}>
      {/* <Text>Test Data Insertion</Text>
      <Button title="Insert Sample Data" onPress={handleInsert} />
      <Button title="Verify Data" onPress={verifyData} />
      <Text>{insertStatus}</Text> */}
    </View>
  );
};

export default TestInsertScreen;