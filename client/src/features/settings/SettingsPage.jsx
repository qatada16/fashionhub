import PageHeader from '../../components/PageHeader.jsx';
import EmptyState from '../../components/EmptyState.jsx';

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Store profile, channels, and assistant behaviour." />
      <EmptyState
        title="Nothing to configure yet"
        description="Store details, channel connections, and AI settings arrive in a later phase."
      />
    </>
  );
}
