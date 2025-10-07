import { GET_ALL_AUDIOS } from "../constants/apiUrls";
import api from "../http/axiosInstance";
import { fetchAllAudiosMock } from "./mockAudios";

export const fetchAllAudios = async () => {
  // Use mock data for now - replace with actual API call when ready
  try {
    return await fetchAllAudiosMock();
  } catch (err) {
    throw new Error('Failed to fetch audios');
  }
  
  // Uncomment below when actual API is ready
  /*
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
  */
};

export const fetchIndividualAudio = async (AUDIO_URL) => {
  try {
    const res = await api.get(AUDIO_URL);
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
