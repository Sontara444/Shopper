import Navbar from './Components/Navbar/Navbar'
import Admin from './Pages/Admin/Admin'

const App = () => {

  const backendUrl = import.meta.env.VITE_BACKEND_URL

  return (
    <div>
      <Navbar />
      <Admin  backendUrl={backendUrl}/>
    </div>
  )
}

export default App