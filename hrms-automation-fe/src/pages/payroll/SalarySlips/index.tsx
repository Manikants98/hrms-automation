import React, { useState } from 'react';
import ViewSalarySlip from './ViewSalarySlip';
import { type SalarySlip } from 'hooks/useSalarySlips';

const SalarySlips: React.FC = () => {
  const [selectedSalarySlip, setSelectedSalarySlip] = useState<SalarySlip | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <ViewSalarySlip
      selectedSalarySlip={selectedSalarySlip}
      setSelectedSalarySlip={setSelectedSalarySlip}
      drawerOpen={drawerOpen}
      setDrawerOpen={setDrawerOpen}
    />
  );
};

export default SalarySlips;
