import { AppDataSource } from "../config/data-source.js";
import { District } from "../entities/District.js";

export interface DistrictView {
  id: string;
  name: string;
  province: string;
}

export async function listDistricts(): Promise<DistrictView[]> {
  const districtRepository = AppDataSource.getRepository(District);

  const districts = await districtRepository.find({
    where: { isRemoved: false },
    order: { province: "ASC", name: "ASC" },
  });

  return districts.map((district) => ({
    id: district.id,
    name: district.name,
    province: district.province,
  }));
}
