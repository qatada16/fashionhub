import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Button from '../../components/Button.jsx';
import Input from '../../components/Input.jsx';
import Textarea from '../../components/Textarea.jsx';
import Switch from '../../components/Switch.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import { toast } from '../../components/Toast.jsx';
import { useSettings, useSaveSetting } from '../../api/settings.js';
import SettingsSection from './SettingsSection.jsx';

const EMPTY_PERSONA = { brandVoice: '', extraInstructions: '' };
const EMPTY_POLICIES = { returnPolicy: '', exchangePolicy: '', refundProcess: '' };
const EMPTY_DELIVERY = { defaultCharges: 0, freeAbove: 0, cities: [] };

function useSection(initial, serverValue) {
  const [value, setValue] = useState(initial);
  const [baseline, setBaseline] = useState(initial);
  useEffect(() => {
    if (serverValue) {
      const merged = Array.isArray(initial)
        ? serverValue
        : { ...initial, ...serverValue };
      setValue(merged);
      setBaseline(merged);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverValue]);
  const dirty = JSON.stringify(value) !== JSON.stringify(baseline);
  return { value, setValue, dirty, markSaved: () => setBaseline(value) };
}

function RemoveButton({ onClick, label }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-9 shrink-0 items-center justify-center self-end rounded-lg text-ink-soft transition-colors hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
    >
      <Trash2 className="size-4" />
    </button>
  );
}

export default function SettingsPage() {
  const { data, isPending, isError, refetch } = useSettings();
  const save = useSaveSetting();

  const persona = useSection(EMPTY_PERSONA, data?.persona);
  const policies = useSection(EMPTY_POLICIES, data?.policies);
  const delivery = useSection(EMPTY_DELIVERY, data?.delivery);
  const faq = useSection([], data?.faq);

  async function saveSection(key, section, label) {
    try {
      await save.mutateAsync({ key, value: section.value });
      section.markSaved();
      toast(`${label} saved — the assistant will use it right away`);
    } catch {
      toast(`Couldn't save ${label.toLowerCase()}`, 'danger');
    }
  }

  if (isPending) {
    return (
      <>
        <PageHeader title="Train AI" description="These directly shape the AI assistant's replies." />
        <div className="flex flex-col gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-line bg-surface p-5">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="mt-4 h-24 w-full" />
            </div>
          ))}
        </div>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <PageHeader title="Train AI" description="These directly shape the AI assistant's replies." />
        <EmptyState
          title="Couldn't load settings"
          description="The server may be offline. Check that the API is running, then try again."
          action={
            <Button variant="ghost" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      </>
    );
  }

  function setCity(i, patch) {
    delivery.setValue((v) => ({
      ...v,
      cities: v.cities.map((c, x) => (x === i ? { ...c, ...patch } : c)),
    }));
  }

  return (
    <>
      <PageHeader title="Train AI" description="These directly shape the AI assistant's replies." />
      <div className="flex flex-col gap-6">
        <SettingsSection
          title="Brand persona"
          dirty={persona.dirty}
          saving={save.isPending}
          onSave={() => saveSection('persona', persona, 'Persona')}
          testId="save-persona"
        >
          <div className="flex flex-col gap-4">
            <Textarea
              label="Brand voice"
              value={persona.value.brandVoice}
              onChange={(e) => persona.setValue((v) => ({ ...v, brandVoice: e.target.value }))}
              placeholder="Warm, boutique, fashion-forward. Speaks like a helpful stylist."
              data-testid="field-brand-voice"
            />
            <Textarea
              label="Extra instructions"
              value={persona.value.extraInstructions}
              onChange={(e) => persona.setValue((v) => ({ ...v, extraInstructions: e.target.value }))}
              placeholder="Always mention ongoing discounts. Never promise same-day delivery."
              data-testid="field-extra-instructions"
            />
          </div>
        </SettingsSection>

        <SettingsSection
          title="Policies"
          dirty={policies.dirty}
          saving={save.isPending}
          onSave={() => saveSection('policies', policies, 'Policies')}
          testId="save-policies"
        >
          <div className="flex flex-col gap-4">
            <Textarea
              label="Return policy"
              rows={3}
              value={policies.value.returnPolicy}
              onChange={(e) => policies.setValue((v) => ({ ...v, returnPolicy: e.target.value }))}
              data-testid="field-return-policy"
            />
            <Textarea
              label="Exchange policy"
              rows={3}
              value={policies.value.exchangePolicy}
              onChange={(e) => policies.setValue((v) => ({ ...v, exchangePolicy: e.target.value }))}
              data-testid="field-exchange-policy"
            />
            <Textarea
              label="Refund process"
              rows={3}
              value={policies.value.refundProcess}
              onChange={(e) => policies.setValue((v) => ({ ...v, refundProcess: e.target.value }))}
              data-testid="field-refund-process"
            />
          </div>
        </SettingsSection>

        <SettingsSection
          title="Delivery"
          dirty={delivery.dirty}
          saving={save.isPending}
          onSave={() => saveSection('delivery', delivery, 'Delivery')}
          testId="save-delivery"
        >
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4 sm:max-w-md">
              <Input
                label="Default charges (Rs)"
                type="number"
                min="0"
                value={delivery.value.defaultCharges}
                onChange={(e) =>
                  delivery.setValue((v) => ({ ...v, defaultCharges: Number(e.target.value) }))
                }
                data-testid="field-default-charges"
              />
              <Input
                label="Free above (Rs)"
                type="number"
                min="0"
                value={delivery.value.freeAbove}
                onChange={(e) =>
                  delivery.setValue((v) => ({ ...v, freeAbove: Number(e.target.value) }))
                }
                data-testid="field-free-above"
              />
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">Cities</p>
              {delivery.value.cities.length === 0 && (
                <p className="text-xs text-ink-soft">No city-specific rates — the default applies.</p>
              )}
              {delivery.value.cities.map((city, i) => (
                <div key={i} className="flex flex-wrap items-end gap-2" data-testid="city-row">
                  <Input
                    label={i === 0 ? 'City' : undefined}
                    aria-label="City name"
                    value={city.name}
                    onChange={(e) => setCity(i, { name: e.target.value })}
                    className="min-w-32 flex-1"
                  />
                  <Input
                    label={i === 0 ? 'Days' : undefined}
                    aria-label="Delivery days"
                    type="number"
                    min="0"
                    value={city.days}
                    onChange={(e) => setCity(i, { days: Number(e.target.value) })}
                    className="w-20"
                  />
                  <Input
                    label={i === 0 ? 'Charges' : undefined}
                    aria-label="Delivery charges"
                    type="number"
                    min="0"
                    value={city.charges}
                    onChange={(e) => setCity(i, { charges: Number(e.target.value) })}
                    className="w-24"
                  />
                  <Switch
                    label="Same day"
                    checked={!!city.sameDay}
                    onChange={(v) => setCity(i, { sameDay: v })}
                    className="h-10"
                  />
                  <RemoveButton
                    label={`Remove ${city.name || 'city'}`}
                    onClick={() =>
                      delivery.setValue((v) => ({
                        ...v,
                        cities: v.cities.filter((_, x) => x !== i),
                      }))
                    }
                  />
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="self-start"
                data-testid="add-city"
                onClick={() =>
                  delivery.setValue((v) => ({
                    ...v,
                    cities: [...v.cities, { name: '', days: 3, charges: v.defaultCharges, sameDay: false }],
                  }))
                }
              >
                <Plus className="size-4" aria-hidden="true" />
                Add city
              </Button>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          title="FAQ"
          dirty={faq.dirty}
          saving={save.isPending}
          onSave={() => saveSection('faq', faq, 'FAQ')}
          testId="save-faq"
        >
          <div className="flex flex-col gap-4">
            {faq.value.length === 0 && (
              <p className="text-sm text-ink-soft">
                No trained answers yet. Add common questions so the assistant replies exactly how you want.
              </p>
            )}
            {faq.value.map((item, i) => (
              <div key={i} className="flex items-start gap-2 rounded-xl bg-surface-2 p-3" data-testid="faq-row">
                <div className="flex flex-1 flex-col gap-2">
                  <Input
                    label="Question"
                    value={item.q}
                    onChange={(e) =>
                      faq.setValue((v) => v.map((f, x) => (x === i ? { ...f, q: e.target.value } : f)))
                    }
                  />
                  <Textarea
                    label="Answer"
                    rows={2}
                    value={item.a}
                    onChange={(e) =>
                      faq.setValue((v) => v.map((f, x) => (x === i ? { ...f, a: e.target.value } : f)))
                    }
                  />
                </div>
                <RemoveButton
                  label="Remove FAQ"
                  onClick={() => faq.setValue((v) => v.filter((_, x) => x !== i))}
                />
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="self-start"
              data-testid="add-faq"
              onClick={() => faq.setValue((v) => [...v, { q: '', a: '' }])}
            >
              <Plus className="size-4" aria-hidden="true" />
              Add question
            </Button>
          </div>
        </SettingsSection>
      </div>
    </>
  );
}
