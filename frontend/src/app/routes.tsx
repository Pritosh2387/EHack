import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardPage } from '../pages/DashboardPage';
import { ExportFootprintPage } from '../pages/ExportFootprintPage';
import { RegionalExplorerPage } from '../pages/RegionalExplorerPage';
import { CropShiftSimulatorPage } from '../pages/CropShiftSimulatorPage';
import { ResourceOptimizationPage } from '../pages/ResourceOptimizationPage';
import { SensitivityAnalysisPage } from '../pages/SensitivityAnalysisPage';
import { ExplainAnalysisPage } from '../pages/ExplainAnalysisPage';
import { DecisionReceiptsPage } from '../pages/DecisionReceiptsPage';
import { DataMethodologyPage } from '../pages/DataMethodologyPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/exports" element={<ExportFootprintPage />} />
      <Route path="/regions" element={<RegionalExplorerPage />} />
      <Route path="/crop-shift" element={<CropShiftSimulatorPage />} />
      <Route path="/optimization" element={<ResourceOptimizationPage />} />
      <Route path="/sensitivity" element={<SensitivityAnalysisPage />} />
      <Route path="/explain" element={<ExplainAnalysisPage />} />
      <Route path="/receipts" element={<DecisionReceiptsPage />} />
      <Route path="/methodology" element={<DataMethodologyPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
