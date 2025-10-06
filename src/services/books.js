import { AQUIRE_LICENSE, GET_ALL_BOOKS } from "../constants/apiUrls";
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

export const requestBookLicense = async (bookId, publicKey) => {
  try {
    const payload = {
      bookId: bookId,
      publicKey: publicKey,
    };
    const res = await api.post(AQUIRE_LICENSE, payload);
    if (res && res.data) {
      return res.data;
    } 
  } catch (err) {
    const message =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      'License request failed';
    console.error("License Request Error:", err); 
    throw new Error(message);
  }
};