import { createBrowserRouter } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './screens/Dashboard';
import Story1Screen from './screens/sprint1/Story1Screen';
import Story2Screen from './screens/sprint1/Story2Screen';
import CourtDepositAccountCreationScreen from './screens/sprint1/CourtDepositAccountCreationScreen';
import PdToCcdCrcdWorksTransferScreen from './screens/sprint1/PdToCcdCrcdWorksTransferScreen';
import DepositAccountNumberScreen from './screens/sprint2/DepositAccountNumberScreen';
import DepositAdminRuleConfigScreen from './screens/sprint2/DepositAdminRuleConfigScreen';
import DepositFundTransferScreen from './screens/sprint2/DepositFundTransferScreen';
import SubPDCreationScreen from './screens/sprint2/SubPDCreationScreen';
import DepositFundTransferChallanScreen from './screens/sprint2/DepositFundTransferChallanScreen';
import SubPDBillCreationScreen from './screens/sprint2/SubPDBillCreationScreen';
import PaymentAdviceGenerationScreen from './screens/sprint2/PaymentAdviceGenerationScreen';
import PlusMinusMemoScreen from './screens/sprint3/PlusMinusMemoScreen';
import DepositStatementScreen from './screens/sprint3/DepositStatementScreen';
import DepositLapseScreen from './screens/sprint3/DepositLapseScreen';
import CourtDepositLapseScreen from './screens/sprint3/CourtDepositLapseScreen';
import TreasuryCreatorPDAcclosureScreen from './screens/sprint3/TreasuryCreatorPDAcclosureScreen';
import RevenueDepositLapseScreen from './screens/sprint4/RevenueDepositLapseScreen';
import SecurityDepositWorkIdScreen from './screens/sprint4/SecurityDepositWorkIdScreen';
import StatutoryWorksReportsScreen from './screens/sprint4/StatutoryWorksReportsScreen';
import ContractManagementSinglePayment from './screens/sprint4/contractid';
import WorksToPDTransferScreen from './screens/sprint4/WorksToPDTransferScreen';


export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      // Sprint 1
      { path: 'sprint/1/story/1', element: <Story1Screen /> },
      { path: 'sprint/1/story/2', element: <Story2Screen /> },
      { path: 'sprint/1/story/3', element: <CourtDepositAccountCreationScreen /> },
      { path: 'sprint/1/story/4', element: <PdToCcdCrcdWorksTransferScreen /> },
      // Sprint 2
      { path: 'sprint/2/story/1', element: <DepositAccountNumberScreen /> },
      { path: 'sprint/2/story/2', element: <DepositAdminRuleConfigScreen /> },
      { path: 'sprint/2/story/3', element: <DepositFundTransferScreen /> },
      { path: 'sprint/2/story/4', element: <SubPDCreationScreen /> },
      { path: 'sprint/2/story/5', element: <DepositFundTransferChallanScreen /> },
      { path: 'sprint/2/story/6', element: <SubPDBillCreationScreen /> },
      { path: 'sprint/2/story/7', element: <PaymentAdviceGenerationScreen /> },
      // Sprint 3
      { path: 'sprint/3/story/1', element: <PlusMinusMemoScreen /> },
      { path: 'sprint/3/story/2', element: <DepositStatementScreen /> },
      { path: 'sprint/3/story/3', element: <CourtDepositLapseScreen /> },
      { path: 'sprint/3/story/3-pd', element: <DepositLapseScreen /> },
      { path: 'sprint/3/story/4', element: <TreasuryCreatorPDAcclosureScreen /> },
      // Sprint 4
      { path: 'sprint/4/story/1', element: <RevenueDepositLapseScreen /> },
      { path: 'sprint/4/story/2', element: <SecurityDepositWorkIdScreen /> },
      { path: 'sprint/4/story/3', element: <StatutoryWorksReportsScreen /> },
      { path: 'sprint/4/story/4', element: <ContractManagementSinglePayment /> },
      { path: 'sprint/4/story/5', element: <WorksToPDTransferScreen /> },
      // Catch-all

      {
        path: '*',
        element: (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
            <h2>Page not found</h2>
            <p>The requested screen does not exist.</p>
          </div>
        ),
      },
    ],
  },
]);
