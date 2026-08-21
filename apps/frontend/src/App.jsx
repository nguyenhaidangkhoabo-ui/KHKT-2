import { AuthProvider } from './context'
import AppRoutes from './routes'

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App