export const APP_CONFIG = {
  appName: 'Cổng thông tin THPT Huỳnh Văn Nghệ',
  appShortName: 'HVN Portal',
  schoolName: 'Trường THPT Huỳnh Văn Nghệ',
  address: 'Khu phố Uyên Hưng 4, phường Tân Uyên, TP. Tân Uyên, Tỉnh Bình Dương',
  phone: '0274.365.6357',
  email: 'thpthvnbinhduong@gmail.com',
  apiBaseUrl: import.meta.env.VITE_API_URL || '/api',
  pageSize: 50,
  storageKeys: {
    user: 'hvn_user',
    token: 'hvn_token',
  },
}