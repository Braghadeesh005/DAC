import { Route, Routes } from 'react-router-dom';
import Login from './pages/authentication/Login';
import ApplicationsHome from './pages/application/ApplicationsHome';
import FirewallHome from './pages/firewall/FirewallHome';
import InventoryHome from './pages/inventory/InventoryHome';
import LbHome from './pages/lb/LbHome';
import Cage from './pages/inventory/Cage';
import Profile from './pages/profile/Profile';
import ColorThemePicker from './pages/profile/ColorThemePicker/ColorThemePicker';
import './styles/Global.css';

function Router() {
  return (
    <Routes>
      <Route path='/' element={<Login />} />

      <Route path='/apps/home' element={<ApplicationsHome />} />

      <Route path='/inv/home' element={<InventoryHome />} />
      <Route path='/inv/cage' element={<Cage />} />

      <Route path='/fw/home' element={<FirewallHome />} />

      <Route path='/lb/home' element={<LbHome />} />

      <Route path='/profile/home' element={<Profile />} />
      <Route path='/profile/editheme' element={<ColorThemePicker />} />

    </Routes>
  );
}

export default Router;