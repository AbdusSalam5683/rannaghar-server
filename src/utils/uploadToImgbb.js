import axios from 'axios';
import FormData from 'form-data';

export const uploadToImgbb = async (buffer, filename) => {
  try {
    const formData = new FormData();
    formData.append('image', buffer.toString('base64'));
    formData.append('name', filename);

    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
      }
    );

    return response.data.data.url;
  } catch (error) {
    console.error('Imgbb upload error:', error.message);
    throw new Error('Failed to upload image');
  }
};