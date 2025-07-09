const URL = "http://192.168.1.20:3002/api"
// http://192.168.1.20:3002/api
// const URL = 'http://localhost:3002/api';

export const Login = () => `${URL}/login`;
export const VerifyOtp = () => `${URL}/verifyOtp`;
export const ResendOtp = () => `${URL}/resendOtp`;
export const AllCanteens = () => `${URL}/user/getAllCanteens`;
// export const MenuItems = (canteenId: string) =>
//   `${URL}/user/getMenuItems?canteenId=${canteenId}`;
export const GetMenuItemsbyCanteenId = (canteenId: string) =>
  `${URL}/menu/getMenusForNextTwoDaysGroupedByDateAndConfiguration?canteenId=${canteenId}`;


