import { Platform } from "react-native";

const ID_API_URL = process.env.EXPO_PUBLIC_FPT_AI_ID_API_URL as string;
const API_KEY = process.env.EXPO_PUBLIC_FPT_AI_API_KEY as string;
const LICENSE_API_URL = process.env.EXPO_PUBLIC_FPT_AI_DLC_API_URL as string;

export const convertImageFile = (imageUri: string) => {
  const filename = imageUri.split("/").pop() || "image.jpg";
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : "image/jpeg";
  return {
    uri: Platform.OS === "ios" ? imageUri.replace("file://", "") : imageUri,
    type: type,
    name: filename,
  } as any;
};

export const uploadImage = async (imageUri: string): Promise<any> => {
  try {
    // Get filename from URI
    const filename = imageUri.split("/").pop() || "image.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";

    // Create FormData
    const formData = new FormData();

    // For React Native, we need to format the file object correctly
    formData.append("image", {
      uri: Platform.OS === "ios" ? imageUri.replace("file://", "") : imageUri,
      type: type,
      name: filename,
    } as any);

    // Upload to API
    const apiResponse = await fetch(ID_API_URL, {
      method: "POST",
      headers: {
        "api-key": API_KEY,
      },
      body: formData,
    });

    const responseJson = await apiResponse.json();
    console.log(responseJson);
    return responseJson;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};

export const uploadImageDLC = async (imageUri: string): Promise<any> => {
  try {
    // Get filename from URI
    const filename = imageUri.split("/").pop() || "image.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";

    // Create FormData
    const formData = new FormData();

    // For React Native, we need to format the file object correctly
    formData.append("image", {
      uri: Platform.OS === "ios" ? imageUri.replace("file://", "") : imageUri,
      type: type,
      name: filename,
    } as any);

    // Upload to API
    const apiResponse = await fetch(LICENSE_API_URL, {
      method: "POST",
      headers: {
        "api-key": API_KEY,
      },
      body: formData,
    });

    const responseJson = await apiResponse.json();
    console.log(responseJson);
    return responseJson;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};
