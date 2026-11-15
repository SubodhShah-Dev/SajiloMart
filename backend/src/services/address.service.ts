import { AppDataSource } from "../config/data-source.js";
import { Address } from "../entities/Address.js";
import { District } from "../entities/District.js";
import { AppError } from "../errors/AppError.js";
import type { CreateAddressInput } from "../validation/address.schema.js";

export interface AddressView {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  districtId: string;
  district: {
    id: string;
    name: string;
    province: string;
  };
  isDefault: boolean;
}

function toAddressView(address: Address): AddressView {
  return {
    id: address.id,
    label: address.label,
    recipientName: address.recipientName,
    phone: address.phone,
    line1: address.line1,
    line2: address.line2 ?? null,
    city: address.city,
    districtId: address.districtId,
    district: {
      id: address.district.id,
      name: address.district.name,
      province: address.district.province,
    },
    isDefault: address.isDefault,
  };
}

export async function listAddresses(userId: string): Promise<AddressView[]> {
  const addressRepository = AppDataSource.getRepository(Address);

  const addresses = await addressRepository.find({
    where: { userId, isRemoved: false },
    relations: { district: true },
    order: { isDefault: "DESC", createdAt: "DESC" },
  });

  return addresses.map(toAddressView);
}

export async function createAddress(
  userId: string,
  input: CreateAddressInput,
): Promise<AddressView> {
  return AppDataSource.transaction(async (manager) => {
    const district = await manager.findOne(District, {
      where: { id: input.districtId, isRemoved: false },
    });

    if (!district) {
      throw new AppError("District not found", 404);
    }

    const existingCount = await manager.count(Address, {
      where: { userId, isRemoved: false },
    });

    // The first address is always the default one.
    const shouldBeDefault = input.isDefault || existingCount === 0;

    if (shouldBeDefault) {
      await manager.update(
        Address,
        { userId, isRemoved: false },
        { isDefault: false },
      );
    }

    const address = manager.create(Address, {
      userId,
      label: input.label,
      recipientName: input.recipientName,
      phone: input.phone,
      line1: input.line1,
      line2: input.line2,
      city: input.city,
      districtId: input.districtId,
      isDefault: shouldBeDefault,
      isRemoved: false,
    });

    await manager.save(address);

    const saved = await manager.findOne(Address, {
      where: { id: address.id },
      relations: { district: true },
    });

    return toAddressView(saved as Address);
  });
}
