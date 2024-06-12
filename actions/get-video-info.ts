import axios from "axios";
import { notFound } from "next/navigation";

export const getVideoInfo = async (id: string) => {
  try {
    const res = await axios.get(`${process.env.BASE_URL}/api/${id}`);

    if (res.data.status === "200") {
      return res.data.data;
    } else {
      notFound();
    }
  } catch (error) {
    console.error(error);
    notFound();
  }
};
