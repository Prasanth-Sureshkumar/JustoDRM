import { GET_ALL_AUDIOS, AQUIRE_LICENSE } from "../constants/apiUrls";
import api from "../http/axiosInstance";

export const fetchAllAudios = async () => {
  try {
    const res = await api.get(GET_ALL_AUDIOS);
    if (res && res.data) {
      return res.data;
    } 
  } catch (err) {
    const message =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      'Failed to fetch audios';
    throw new Error(message);
  }
};

export const requestAudioLicense = async (audioId, publicKey) => {
  try {
    const payload = {
      bookId: audioId,
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
      'Audio license request failed';
    console.error("Audio License Request Error:", err); 
    throw new Error(message);
  }
};

export const fetchIndividualAudio = async (audioId) => {
  try {
    const res = await api.get(`${GET_ALL_AUDIOS}/${audioId}`);
    return res;
  } catch (err) {
    const message =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      'Failed to fetch audio';
    throw new Error(message);
  }
};
