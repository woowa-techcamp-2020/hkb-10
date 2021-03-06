import getFetchHeaders from "../utils/getFetchHeaders";

const baseUrl = `http://${process.env.API_HOST}:${process.env.API_PORT}`;

const getPaymentMethods = async (userId: string) => {
  try {
    const headers = getFetchHeaders();
    const response = await fetch(`${baseUrl}/api/payment-method/${userId}`, {
      mode: "cors",
      method: "GET",
      headers,
    });
    const result = await response.json();
    if (result.success) {
      return result.data;
    }
  } catch (error) {
    console.log(error);
  }
};

export default getPaymentMethods;
