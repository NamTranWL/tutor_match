export interface ParentProfile {
  _id: string;
  userId: string;
  fullName?: string;
  phone?: string;
  address?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateParentDto {
  userId: string;
  fullName?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export type UpdateParentDto = Partial<Omit<CreateParentDto, 'userId'>>;
