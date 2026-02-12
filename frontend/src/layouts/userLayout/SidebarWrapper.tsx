
import React from 'react';
import SidebarLayout from './SidebarLayout';
import { Outlet } from 'react-router-dom';

const SidebarWrapper: React.FC = () => {
  return (
    <SidebarLayout>
      <Outlet />
    </SidebarLayout>
  );
};

export default SidebarWrapper;