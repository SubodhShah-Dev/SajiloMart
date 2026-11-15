import type { Request, Response } from "express";

import { listDistricts } from "../services/district.service.js";

export async function listDistrictsHandler(
  _request: Request,
  response: Response,
): Promise<void> {
  const districts = await listDistricts();
  response.status(200).json({ success: true, data: districts });
}
