import PageHeader from '../../components/PageHeader.jsx';
import StatCard from '../../components/StatCard.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Card from '../../components/Card.jsx';

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" description="Store performance at a glance." />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue" value="—" />
        <StatCard label="Orders" value="—" />
        <StatCard label="Customers" value="—" />
        <StatCard label="Conversations" value="—" />
      </div>
      <Card className="mt-6">
        <EmptyState
          title="No activity yet"
          description="Sales, orders, and assistant conversations will appear here once the store goes live."
        />
      </Card>
    </>
  );
}
