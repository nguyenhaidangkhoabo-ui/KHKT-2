export const APP_CONFIG = {
  appName: 'Cổng thông tin THPT Huỳnh Văn Nghệ',
  appShortName: 'HVN Portal',
  schoolName: 'Trường THPT Huỳnh Văn Nghệ',
  apiBaseUrl: import.meta.env.VITE_API_URL || '/api',
  // Backend hiện không phân trang → giới hạn số dòng render/lần để tránh lag với danh sách lớn
  pageSize: 50,
  storageKeys: {
    user: 'hvn_user',
    token: 'hvn_token',
  },
}