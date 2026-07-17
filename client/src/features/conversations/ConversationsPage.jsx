import PageHeader from '../../components/PageHeader.jsx';
import EmptyState from '../../components/EmptyState.jsx';

export default function ConversationsPage() {
  return (
    <>
      <PageHeader title="Conversations" description="Every chat the assistant has handled." />
      <EmptyState
        title="No conversations yet"
        description="Once customers message your store, full transcripts with detected intent land here."
      />
    </>
  );
}
