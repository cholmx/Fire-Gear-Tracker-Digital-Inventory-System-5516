import React from 'react';
import {HashRouter as Router,Routes,Route} from 'react-router-dom';
import {AuthProvider} from './contexts/AuthContext';
import {DataProvider} from './contexts/DataContext';
import {DatabaseProvider} from './contexts/DatabaseContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Equipment from './pages/Equipment';
import Inspections from './pages/Inspections';
import Stations from './pages/Stations';
import Vendors from './pages/Vendors';
import Settings from './pages/Settings';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import Documentation from './pages/Documentation';
import ContactSales from './pages/ContactSales';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
return (
<AuthProvider>
<DatabaseProvider>
<DataProvider>
<Router>
<Routes>
<Route path="/" element={<LandingPage />} />
<Route path="/login" element={<Login />} />
<Route path="/documentation" element={<Documentation />} />
<Route path="/contact-sales" element={<ContactSales />} />
<Route 
path="/app" 
element={
<ProtectedRoute>
<Layout />
</ProtectedRoute>
}
>
<Route index element={<Dashboard />} />
<Route path="equipment" element={<Equipment />} />
<Route path="inspections" element={<Inspections />} />
<Route path="stations" element={<Stations />} />
<Route path="vendors" element={<Vendors />} />
<Route path="settings" element={<Settings />} />
</Route>
</Routes>
</Router>
</DataProvider>
</DatabaseProvider>
</AuthProvider>
);
}

export default App;