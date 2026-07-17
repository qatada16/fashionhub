import PageHeader from '../../components/PageHeader.jsx';
import EmptyState from '../../components/EmptyState.jsx';

export default function OrdersPage() {
  return (
    <>
      <PageHeader title="Orders" description="Track and fulfil customer orders." />
      <EmptyState
        title="No orders yet"
        description="Orders placed through the assistant or web chat will show up here."
      />
    </>
  );
}
