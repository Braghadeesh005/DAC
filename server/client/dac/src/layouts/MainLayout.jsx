import React, { useState } from 'react';
import Navbar from '../components/Navbar/Navbar';
import SideBar from '../components/Sidebar/Sidebar';

const layoutStyles = {
  
  content: (sidebarVisible) => ({
    marginLeft: sidebarVisible ? '310px' : '50px',
    marginTop: '80px',
    marginBottom: '20px',
    marginRight: '50px',
    transition: 'margin-left 0.8s ease-in-out ',
    borderRadius: '5px',
  }),
};

const MainLayout = ({ children }) => {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  return (
    <div>
      <Navbar />
      <SideBar onToggle={setSidebarVisible} />
      <main style={layoutStyles.content(sidebarVisible)}>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;