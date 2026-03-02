const ApiEndPoint = {
  LOGIN: "/login",
  LOGOUT: "/logOut",
  USER_LIST: "/userList",
  updateProfile: "/adminProfileUpdate",
  changePassword: "/changePassword",
  DASHBOARD_DATA: "/dashboard",

  getAllUser: "/getAllUser",
  userStatusChange: "/userStatusChange",
  userBanChange: "/userBanChange",
  deleteUser: "/deleteUser",
  userDetail: "/userDetail",
  removeUserImage: "/removeUserImage",

  cms: "/cms",
  cmsUpdate: "/cmsUpdate",

  interestList: "/interestList",
  addInterest: "/addInterest",
  editInterest: "/editInterest",
  interestDetail: "/interestDetail",
  deleteInterest: "/deleteInterest",

  faqList: "/faqList",
  faqDetail: "/faqDetail",
  addFaq: "/addFaq",
  editFaq: "/editFaq",
  deleteFaq: "/deleteFaq",

  categoryList: "/categoryList",
  addCategory: "/addCategory",
  editCategory: "/editCategory",
  categoryDetail: "/categoryDetail",
  deleteCategory: "/deleteCategory",

  taglineList: "/taglineList",
  addTagline: "/addTagline",
  editTagline: "/editTagline",
  taglineDetail: "/taglineDetail",
  deleteTagline: "/deleteTagline",

  activityList: "/activityList",
  addActivity: "/addActivity",
  editActivity: "/editActivity",
  activityDetail: "/activityDetail",
  deleteActivity: "/deleteActivity",

  contactUsList: "/contactUsList",
  contactUsDelete: "/contactUsDelete",
  contactUsView: "/contactUsDetail",

  getAllProvider: "/allProviders",
  providerBadgeChange: "/providerBadgeChange",
  deleteProvider: "/deleteUser",
  providerDetail: "/providerDetail",
  approveProvider: "/approveProvider",

  subscriptionList: "/subscriptionList",
  addSubscription: "/addSubscription",
  editSubscription: "/editSubscription",
  subscriptionDetail: "/subscriptionDetail",
  deleteSubscription: "/deleteSubscription",

  allBookings: "/allBookings",
  bookingDetail: "/bookingDetail",
  cancelBooking: "/cancelBooking",
  updateDisputeStatus: "/updateDisputeStatus",
  updateBookingTime: "/updateBookingTime",
  closeDisputeFull: "/closeDisputeFull",
  closeDisputePartial: "/closeDisputePartial",
  rejectDispute: "/rejectDispute",

  userReportsList: "/userReportsList",
  userReportDetail: "/userReportDetail",

  transactionList: "/transactionList",

  IMAGE_BASE_URL: import.meta.env.VITE_IMAGE_URL,
};

export default ApiEndPoint;
