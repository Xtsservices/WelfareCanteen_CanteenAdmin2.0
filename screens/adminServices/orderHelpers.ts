import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Base API URL
const API_BASE_URL = 'http://192.168.1.20:3002/api';

const getToken = () => {
    return AsyncStorage.getItem('authorization')

}

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// apiClient.interceptors.request.use((config) => {
//     config.headers.Authorization = `${getToken()}`;
//     return config;
// },
//     (error) => {
//         return Promise.reject(error);
//     }
// );

// apiClient.interceptors.request.use(
//     async (config) => {
//         const token = await AsyncStorage.getItem('authorization');
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         } else {
//             console.warn('No auth token found in storage');
//         }
//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// );

apiClient.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('authorization');
        if (token) {
            // Ensure token doesn't already have 'Bearer ' prefix
            const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
            config.headers.Authorization = authToken;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const menuServices = {
    getMenusForNextTwoDays: async (canteenId: number) => {
        try {
            const response = await apiClient.get(
                `/menu/getMenusForNextTwoDaysGroupedByDateAndConfiguration?canteenId=${canteenId}`
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching menu data:', error);
            throw error;
        }
    },
}

export const orderServices = {
    getOrders: async () => {
        try {
            const response = await apiClient.get(
                `/order/getAllOrders`
            );
            console.log(response, "response data order");
            
            return response.data;
        } catch (error) {
            console.error('Error fetching order data:', error);
            throw error;
        }
    },
}