import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const uploadPicture = async (
  handle: string,
  file: File
): Promise<string> => {
  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await axios.post(
      `${API_BASE_URL}/upload-image`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    if (response.data?.imageUrl) {
      return response.data.imageUrl;
    } else {
      console.error("Backend upload failed:", response.data);
      throw new Error("Backend did not return imageUrl.");
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};
