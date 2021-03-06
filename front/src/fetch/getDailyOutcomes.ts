import getFetchHeaders from "../utils/getFetchHeaders";

const baseUrl = `http://${process.env.API_HOST}:${process.env.API_PORT}`;

type DateInfo = {
  date: number;
  amount: number;
};

type DataType = {
  year: number;
  month: number;
  dates: DateInfo[];
};

type ApiResponse =
  | {
      success: false;
    }
  | {
      success: true;
      data: DataType;
    };

async function getDailyHistories(
  userId: string,
  year: number,
  month: number
): Promise<ApiResponse> {
  let ret: ApiResponse = {
    success: false,
  };

  const headers = getFetchHeaders();
  await fetch(
    `${baseUrl}/api/histories/outcome/daily/${userId}/${year}/${month}`,
    {
      mode: "cors",
      method: "GET",
      headers,
    }
  )
    .then((res) => res.json())
    .then((res: ApiResponse) => {
      ret = res;
    });

  return ret;
}

export default getDailyHistories;
export { ApiResponse, DataType, DateInfo };
