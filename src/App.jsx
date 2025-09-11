import React from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import ErrorBoundary from './components/ErrorBoundary'
import DataLoadingWrapper from './components/DataLoadingWrapper'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Equipment from './pages/Equipment'
import Inspections from './pages/Inspections'
import Stations from './pages/Stations'
import Vendors from './pages/Vendors'
import Settings from './pages/Settings'
import UserManagement from './pages/UserManagement'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import LandingPage from './pages/LandingPage'
import Documentation from './pages/Documentation'
import ContactSales from './pages/ContactSales'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <ErrorBoundary name="App">
      <AuthProvider>
        <DataProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/documentation" element={<Documentation />} />
              <Route path="/contact-sales" element={<ContactSales />} />
              
              {/* Protected routes with data loading wrapper */}
              <Route 
                path="/app" 
                element={
                  <ProtectedRoute>
                    <ErrorBoundary name="AppLayout">
                      <DataLoadingWrapper requiresData={true}>
                        <Layout />
                      </DataLoadingWrapper>
                    </ErrorBoundary>
                  </ProtectedRoute>
                } 
              >
                <Route 
                  index 
                  element={
                    <ErrorBoundary name="Dashboard">
                      <Dashboard />
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="equipment" 
                  element={
                    <ErrorBoundary name="Equipment">
                      <Equipment />
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="inspections" 
                  element={
                    <ErrorBoundary name="Inspections">
                      <Inspections />
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="stations" 
                  element={
                    <ErrorBoundary name="Stations">
                      <Stations />
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="vendors" 
                  element={
                    <ErrorBoundary name="Vendors">
                      <Vendors />
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="users" 
                  element={
                    <ErrorBoundary name="UserManagement">
                      <UserManagement />
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="settings" 
                  element={
                    <ErrorBoundary name="Settings">
                      <Settings />
                    </ErrorBoundary>
                  } 
                />
              </Route>
            </Routes>
          </Router>
        </DataProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App