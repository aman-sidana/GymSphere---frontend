import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import SuperAdminDashboard from './SuperAdmin/SuperAdminDashboard'
import AdminDashboard from './Admin/AdminDashboard'
import ManagerDashboard from './GymManager/ManagerDashboard'
import TrainerDashboard from './Trainer/TrainerDashboard'
import UserDashboard from './User/UserDashboard'
import Login from './Generic components/Login'
import Signup from './Generic components/Signup'
import Forgetpassword from './Generic components/Forgetpassword'
import ResetPassword from './Generic components/ResetPassword'
import GymRequestForm from './Generic components/GymRequestForm'
import ProtectedRoute from './Generic components/ProtectedRoute'

import Home from './User/Home'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/adminrequest" element={<GymRequestForm />} />
        <Route path="/adminform" element={<GymRequestForm />} />
        <Route path="/forget-password" element={<Forgetpassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/home" element={<Home />} />

        <Route
          path="/superadmin"
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager"
          element={
            <ProtectedRoute allowedRoles={['superadmin', 'admin', 'gym_manager']}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer"
          element={
            <ProtectedRoute allowedRoles={['superadmin', 'admin', 'gym_manager', 'trainer']}>
              <TrainerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user"
          element={
            <ProtectedRoute allowedRoles={['superadmin', 'admin', 'gym_manager', 'trainer', 'user']}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
