
import DashboardContent from '@/components/Admin/Dashboard/DashboardContent';

interface DashboardPageProps {
  params: Promise<{
    role: string;
  }>;
}

const Dashboard = async ({ params }: DashboardPageProps) => {
  const { role } = await params;

  return <DashboardContent role={role} />;
};

export default Dashboard;