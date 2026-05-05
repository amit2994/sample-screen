import { createBrowserRouter } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './screens/Dashboard';
import Story1Screen from './screens/sprint1/Story1Screen';
import Story2Screen from './screens/sprint1/Story2Screen';
import DepositAccountNumberScreen from './screens/sprint2/DepositAccountNumberScreen';
import DepositAdminRuleConfigScreen from './screens/sprint2/DepositAdminRuleConfigScreen';
import DepositFundTransferScreen from './screens/sprint2/DepositFundTransferScreen';
import SubPDCreationScreen from './screens/sprint2/SubPDCreationScreen';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      // Sprint 1
      { path: 'sprint/1/story/1', element: <Story1Screen /> },
      { path: 'sprint/1/story/2', element: <Story2Screen /> },
      // Sprint 2
      { path: 'sprint/2/story/1', element: <DepositAccountNumberScreen /> },
      { path: 'sprint/2/story/2', element: <DepositAdminRuleConfigScreen /> },
      { path: 'sprint/2/story/3', element: <DepositFundTransferScreen /> },
      { path: 'sprint/2/story/4', element: <SubPDCreationScreen /> },
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
