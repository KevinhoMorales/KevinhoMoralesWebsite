'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminFetch, getAdminIdToken } from '@/lib/admin-browser';
import type { Conference } from '@/types';
import { useI18n } from '@/components/i18n/locale-provider';
import { translateAdminError } from '@/lib/i18n/admin-errors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

const emptyForm: Conference = {
  id: '',
  title: '',
  topic: '',
  type: 'talk',
  date: '',
  location: '',
  city: '',
  country: '',
  videoUrl: '',
  eventUrl: '',
  tags: [],
  images: [],
};

export function ConferencesPanel() {
  const { t } = useI18n();
  const [list, setList] = useState<Conference[]>([]);
  const [loadError, setLoadError] = useState('');
  const [form, setForm] = useState<Conference>(emptyForm);
  const [isNew, setIsNew] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tagsInput, setTagsInput] = useState('');
  const [imagesInput, setImagesInput] = useState('');

  const refresh = useCallback(async () => {
    setLoadError('');
    try {
      const rows = await adminFetch<Conference[]>('/api/admin/conferences');
      setList(rows.sort((a, b) => a.title.localeCompare(b.title)));
    } catch (e) {
      const raw = e instanceof Error ? e.message : t('admin.conferences.loadFailed');
      setLoadError(translateAdminError(raw, t));
    }
  }, [t]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function startNew() {
    setIsNew(true);
    setForm(emptyForm);
    setTagsInput('');
    setImagesInput('');
  }

  function startEdit(c: Conference) {
    setIsNew(false);
    setForm({ ...c });
    setTagsInput((c.tags ?? []).join(', '));
    setImagesInput((c.images ?? []).join('\n'));
  }

  async function uploadImage(file: File) {
    const fd = new FormData();
    fd.append('file', file);
    const token = await getAdminIdToken();
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      body: fd,
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
      window.location.href = '/admin/login';
      throw new Error('No autorizado');
    }
    const json = (await res.json()) as { url?: string; error?: string };
    if (!res.ok) {
      throw new Error(json.error || t('admin.conferences.uploadFailed'));
    }
    if (!json.url) throw new Error('Sin URL');
    const lines = imagesInput.split('\n').map((s) => s.trim()).filter(Boolean);
    setImagesInput([...lines, json.url].join('\n'));
  }

  async function save() {
    const tags = tagsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const images = imagesInput
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const audienceNum =
      form.audience !== undefined && !Number.isNaN(Number(form.audience)) ? Number(form.audience) : undefined;

    const payload: Record<string, unknown> = {
      title: form.title.trim(),
      type: form.type,
      tags,
      images,
    };
    if (form.topic?.trim()) payload.topic = form.topic.trim();
    if (form.date?.trim()) payload.date = form.date.trim();
    if (form.location?.trim()) payload.location = form.location.trim();
    if (form.city?.trim()) payload.city = form.city.trim();
    if (form.country?.trim()) payload.country = form.country.trim();
    if (form.videoUrl?.trim()) payload.videoUrl = form.videoUrl.trim();
    if (form.eventUrl?.trim()) payload.eventUrl = form.eventUrl.trim();
    if (audienceNum !== undefined && !Number.isNaN(audienceNum)) payload.audience = audienceNum;

    setSaving(true);
    try {
      if (isNew) {
        await adminFetch<{ id: string }>('/api/admin/conferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: payload }),
        });
      } else {
        await adminFetch(`/api/admin/conferences/${encodeURIComponent(form.id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: { ...payload, id: form.id } }),
        });
      }
      await refresh();
      startNew();
    } catch (e) {
      const raw = e instanceof Error ? e.message : t('admin.conferences.saveFailed');
      alert(translateAdminError(raw, t));
    } finally {
      setSaving(false);
    }
  }

  async function del(id: string) {
    if (!confirm(t('admin.conferences.confirmDelete'))) return;
    try {
      await adminFetch(`/api/admin/conferences/${encodeURIComponent(id)}`, { method: 'DELETE' });
      await refresh();
      if (form.id === id) startNew();
    } catch (e) {
      const raw = e instanceof Error ? e.message : t('admin.conferences.deleteFailed');
      alert(translateAdminError(raw, t));
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">{t('admin.conferences.title')}</h1>
        <Button type="button" variant="outline" size="sm" onClick={() => startNew()}>
          {t('admin.conferences.new')}
        </Button>
      </div>
      {loadError && <p className="text-sm text-destructive">{loadError}</p>}

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <h2 className="font-medium text-sm text-muted-foreground">{t('admin.conferences.list')}</h2>
          <ul className="space-y-2">
            {list.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-2 text-sm"
              >
                <button
                  type="button"
                  className="text-left hover:underline font-medium"
                  onClick={() => startEdit(c)}
                >
                  {c.title}
                </button>
                <Button type="button" variant="ghost" size="sm" onClick={() => del(c.id)}>
                  {t('admin.conferences.delete')}
                </Button>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4 space-y-4">
          <h2 className="font-medium text-sm text-muted-foreground">
            {isNew ? t('admin.conferences.formNew') : t('admin.conferences.formEdit')}
          </h2>
          <div className="space-y-2">
            <Label htmlFor="t">{t('admin.conferences.labelTitle')}</Label>
            <Input
              id="t"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="topic">{t('admin.conferences.labelTopic')}</Label>
            <Input
              id="topic"
              value={form.topic ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">{t('admin.conferences.labelType')}</Label>
            <select
              id="type"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={form.type}
              onChange={(e) =>
                setForm((f) => ({ ...f, type: e.target.value as Conference['type'] }))
              }
            >
              <option value="conference">{t('admin.conferences.typeConference')}</option>
              <option value="virtual">{t('admin.conferences.typeVirtual')}</option>
              <option value="talk">{t('admin.conferences.typeTalk')}</option>
              <option value="meetup">{t('admin.conferences.typeMeetup')}</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="date">{t('admin.conferences.labelDate')}</Label>
              <Input
                id="date"
                value={form.date ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="audience">{t('admin.conferences.labelAudience')}</Label>
              <Input
                id="audience"
                type="number"
                value={form.audience ?? ''}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    audience: e.target.value === '' ? undefined : Number(e.target.value),
                  }))
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="loc">{t('admin.conferences.labelLocation')}</Label>
            <Input
              id="loc"
              value={form.location ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="city">{t('admin.conferences.labelCity')}</Label>
              <Input id="city" value={form.city ?? ''} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">{t('admin.conferences.labelCountry')}</Label>
              <Input
                id="country"
                value={form.country ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="video">{t('admin.conferences.labelVideoUrl')}</Label>
            <Input
              id="video"
              value={form.videoUrl ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event">{t('admin.conferences.labelEventUrl')}</Label>
            <Input
              id="event"
              value={form.eventUrl ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, eventUrl: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">{t('admin.conferences.labelTags')}</Label>
            <Input id="tags" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="images">{t('admin.conferences.labelImages')}</Label>
            <Textarea id="images" rows={4} value={imagesInput} onChange={(e) => setImagesInput(e.target.value)} />
            <div className="flex flex-wrap items-center gap-2">
              <Label htmlFor="img-up" className="text-xs text-muted-foreground cursor-pointer">
                {t('admin.conferences.uploadImage')}
              </Label>
              <input
                id="img-up"
                type="file"
                accept="image/*"
                className="text-xs"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  e.target.value = '';
                  if (!f) return;
                  try {
                    await uploadImage(f);
                  } catch (err) {
                    const raw = err instanceof Error ? err.message : t('admin.conferences.uploadFailed');
                    alert(translateAdminError(raw, t));
                  }
                }}
              />
            </div>
          </div>
          <Button type="button" onClick={() => save()} disabled={saving || !form.title.trim()}>
            {saving ? t('admin.conferences.saving') : t('admin.conferences.save')}
          </Button>
        </Card>
      </div>
    </div>
  );
}
