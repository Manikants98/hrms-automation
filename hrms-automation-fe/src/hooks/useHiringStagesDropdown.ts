import { useHiringStages } from './useHiringStages';
import type { HiringStage } from '../services/hiringStages';

export type HiringStageDropdown = HiringStage & {
  label: string;
  value: string;
};

export const useHiringStagesDropdown = () => {
  const { data: hiringStagesResponse } = useHiringStages({ isActive: 'Y' });
  
  const hiringStages = Array.isArray(hiringStagesResponse?.data)
    ? hiringStagesResponse.data.map((hs) => ({
        ...hs,
        label: hs.name,
        value: hs.name,
      }))
    : [];

  return {
    hiringStages,
    isLoading: !hiringStagesResponse,
  };
};
