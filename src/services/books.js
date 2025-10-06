import { GET_ALL_BOOKS } from "../constants/apiUrls";
import api from "../http/axiosInstance";

export const fetchAllBooks = async () => {
  try {
    const res = await api.get(GET_ALL_BOOKS);
    if (res && res.data) {
      return res.data;
    } 
  } catch (err) {
    const message =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      'Login failed';
    throw new Error(message);
  }
};