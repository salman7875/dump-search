import type { APIResponse, RetrieveData } from "../types/api.types";
import { handleAPIError } from "../utils/error";

const API_URL = "http://localhost:3000";

const getResult = async (q: string): Promise<APIResponse<RetrieveData>> => {
  try {
    const res = await fetch(`${API_URL}/doc/retrieve?query=${q}`);

    if (!res.ok) {
      const errorText = await res
        .text()
        .catch(() => "Failed to fetch response");
      throw new Error(`Server Error (${res.status}): ${errorText}`);
    }

    const resData: APIResponse<RetrieveData> = await res.json();

    if (!resData.success) {
      throw new Error(resData.message ?? "Failed to fetch response");
    }

    return resData;
  } catch (error) {
    handleAPIError(error);
    throw error;
  }
};

const createData = async (formData: any) => {
  try {
    const res = await fetch(`${API_URL}/doc/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "Failed to upload data");
      throw new Error(`Server Error (${res.status}): ${errorText}`);
    }

    const resData: APIResponse<void> = await res.json();

    if (!resData.success) {
      throw new Error(resData.message ?? "Failed to upload response");
    }

    return resData;
  } catch (error) {
    handleAPIError(error);
    throw error;
  }
};

export const API = {
  createData,
  getResult,
};
