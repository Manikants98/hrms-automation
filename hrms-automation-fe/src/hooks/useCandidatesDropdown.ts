import { useQuery } from '@tanstack/react-query';
import candidatesService, { type Candidate } from '../services/candidates';

export type CandidateDropdown = Candidate & {
  label: string;
  value: number;
};

export const useCandidatesDropdown = () => {
  const { data: candidatesResponse, isLoading } = useQuery({
    queryKey: ['candidates-dropdown'],
    queryFn: () => candidatesService.fetchCandidatesDropdown(),
    staleTime: 5 * 60 * 1000,
  });
  
  const candidates = Array.isArray(candidatesResponse?.data)
    ? candidatesResponse.data.map((candidate: Candidate) => ({
        ...candidate,
        label: candidate.name,
        value: candidate.id || 0,
      }))
    : [];

  return {
    candidates,
    isLoading,
  };
};
