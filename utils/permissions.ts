import { VerticalType } from '@/types/database';

export const permissions = {
  canAccessCoreFeatures: (verticalType: VerticalType | null | undefined): boolean => {
    return verticalType === 'inner_circle';
  },

  canAccessHouses: (verticalType: VerticalType | null | undefined): boolean => {
    return verticalType === 'inner_circle';
  },

  canCreateLinks: (verticalType: VerticalType | null | undefined): boolean => {
    return verticalType === 'inner_circle';
  },

  canViewDeals: (verticalType: VerticalType | null | undefined): boolean => {
    return verticalType === 'inner_circle';
  },

  canScheduleI2WE: (verticalType: VerticalType | null | undefined): boolean => {
    return verticalType === 'inner_circle';
  },

  canAccessVirtualMembership: (verticalType: VerticalType | null | undefined): boolean => {
    return verticalType === 'open_circle';
  },

  isInnerCircle: (verticalType: VerticalType | null | undefined): boolean => {
    return verticalType === 'inner_circle';
  },

  isOpenCircle: (verticalType: VerticalType | null | undefined): boolean => {
    return verticalType === 'open_circle';
  },
};
