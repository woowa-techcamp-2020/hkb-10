import { Request, Response } from "express";
import HistoryDAO from "../../daos/HistoryDAO";

export default async (req: Request, res: Response): Promise<undefined> => {
  const { userId, history } = req.body;
  const result = await HistoryDAO.createHistory(userId, history);

  //todo.. result === true일때 데이터 리턴 어떻게 할 것인가

  const ret = {
    success: true,
    // data: dummyData,
  };

  res.status(200).json(ret);
  return;
};
