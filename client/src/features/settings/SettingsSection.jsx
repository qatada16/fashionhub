import Card from '../../components/Card.jsx';
import Button from '../../components/Button.jsx';
import Badge from '../../components/Badge.jsx';

export default function SettingsSection({ title, dirty, saving, onSave, testId, children }) {
  return (
    <Card
      title={title}
      action={
        <div className="flex items-center gap-3">
          {dirty && <Badge tone="warn">Unsaved changes</Badge>}
          <Button size="sm" loading={saving} disabled={!dirty} onClick={onSave} data-testid={testId}>
            Save
          </Button>
        </div>
      }
    >
      {children}
    </Card>
  );
}
