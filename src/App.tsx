import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Layout } from '@/components/Layout'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import './App.css'

function App() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return <Layout />
}

export default App

