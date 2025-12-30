import { Outlet } from 'react-router-dom';
import AppSidebar from '@/components/AppSidebar';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8 pt-20 lg:pt-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
