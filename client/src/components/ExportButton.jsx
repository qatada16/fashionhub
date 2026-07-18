import { useState } from 'react';
import { Download } from 'lucide-react';
import Button from './Button.jsx';
import { toast } from './Toast.jsx';
import { downloadExport } from '../api/exportCsv.js';

export default function ExportButton({ type }) {
  const [busy, setBusy] = useState(false);
  async function onExport() {
    setBusy(true);
    try {
      await downloadExport(type);
      toast(`Exported ${type}.csv`);
    } catch {
      toast(`Couldn't export ${type} — is the server up?`, 'danger');
    } finally {
      setBusy(false);
    }
  }
  return (
    <Button variant="ghost" size="sm" loading={busy} onClick={onExport} data-testid={`export-${type}`}>
      <Download className="size-4" aria-hidden="true" />
      Export CSV
    </Button>
  );
}
