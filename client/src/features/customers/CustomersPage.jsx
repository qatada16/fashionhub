import PageHeader from '../../components/PageHeader.jsx';
import EmptyState from '../../components/EmptyState.jsx';

export default function CustomersPage() {
  return (
    <>
      <PageHeader title="Customers" description="Everyone who has talked to your store." />
      <EmptyState
        title="No customers yet"
        description="Customer profiles are created automatically from Instagram, WhatsApp, and web chat."
      />
    </>
  );
}
