import { Routes, Route } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import DefaultRoute from './DefaultRoute';
import Login from '../pages/auth/Login';
import ResetPassword from '../pages/auth/ResetPassword';
import ProductionPlanList from '../pages/productionPlan/ProductionPlanList';
import ProductionPlanUpload from '../pages/productionPlan/ProductionPlanUpload';
import ProductionPlanDetails from '../pages/productionPlan/ProductionPlanDetails';
import MachineMaster from '../pages/machine/MachineMaster';
import MachinePlanning from '../pages/planning/MachinePlanning';
import ChecklistTemplateBuilder from '../pages/checklist/ChecklistTemplateBuilder';
import ConfigurationPage from '../pages/configuration/ConfigurationPage';
import ProductionDashboard from '../pages/dashboard/ProductionDashboard';
import MachineDetailsPage from '../pages/dashboard/MachineDetailsPage';
import QualityLayout from '../pages/quality/QualityLayout';
import InspectionReport from '../pages/quality/InspectionReport';
import InspectionPlanBuilder from '../pages/quality/InspectionPlanBuilder';
import InventoryLayout from '../pages/inventory/InventoryLayout';
import UserManagement from '../pages/users/UserManagement';
import RoleManagement from '../pages/users/RoleManagement';
import { PERMISSIONS } from '../constants';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      <Route element={<MainLayout />}>
        <Route path="/" element={<DefaultRoute />} />

        <Route element={<ProtectedRoute permission={PERMISSIONS.DASHBOARD_VIEW} />}>
          <Route path="/dashboard" element={<ProductionDashboard />} />
          <Route path="/dashboard/machines/:machineId" element={<MachineDetailsPage />} />
        </Route>

        <Route element={<ProtectedRoute permission={PERMISSIONS.PRODUCTION_PLAN_VIEW} />}>
          <Route path="/production-plans" element={<ProductionPlanList />} />
          <Route path="/production-plans/:id" element={<ProductionPlanDetails />} />
        </Route>
        <Route element={<ProtectedRoute permission={PERMISSIONS.PRODUCTION_PLAN_IMPORT} />}>
          <Route path="/production-plans/upload" element={<ProductionPlanUpload />} />
        </Route>

        <Route element={<ProtectedRoute permission={PERMISSIONS.MACHINE_VIEW} />}>
          <Route path="/machines" element={<MachineMaster />} />
        </Route>
        <Route element={<ProtectedRoute permission={PERMISSIONS.PLANNING_VIEW} />}>
          <Route path="/planning" element={<MachinePlanning />} />
        </Route>
        <Route
          element={
            <ProtectedRoute
              permission={[PERMISSIONS.DOWNTIME_VIEW, PERMISSIONS.CHECKLIST_VIEW, PERMISSIONS.QUALITY_VIEW, PERMISSIONS.INVENTORY_VIEW]}
            />
          }
        >
          <Route path="/configuration" element={<ConfigurationPage />} />
        </Route>
        <Route element={<ProtectedRoute permission={PERMISSIONS.CHECKLIST_MANAGE} />}>
          <Route path="/checklist-templates/new" element={<ChecklistTemplateBuilder />} />
          <Route path="/checklist-templates/:id/edit" element={<ChecklistTemplateBuilder />} />
        </Route>

        <Route element={<ProtectedRoute permission={PERMISSIONS.QUALITY_VIEW} />}>
          <Route path="/quality" element={<QualityLayout />} />
          <Route path="/quality/inspections/:id" element={<InspectionReport />} />
        </Route>
        <Route element={<ProtectedRoute permission={PERMISSIONS.QUALITY_MANAGE} />}>
          <Route path="/quality/inspection-plans/new" element={<InspectionPlanBuilder />} />
          <Route path="/quality/inspection-plans/:id/edit" element={<InspectionPlanBuilder />} />
        </Route>

        <Route element={<ProtectedRoute permission={PERMISSIONS.INVENTORY_VIEW} />}>
          <Route path="/inventory" element={<InventoryLayout />} />
        </Route>

        <Route element={<ProtectedRoute permission={PERMISSIONS.USER_MANAGE} />}>
          <Route path="/users" element={<UserManagement />} />
        </Route>
        <Route element={<ProtectedRoute permission={PERMISSIONS.ROLE_MANAGE} />}>
          <Route path="/roles" element={<RoleManagement />} />
        </Route>
      </Route>
    </Routes>
  );
}
