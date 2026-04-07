'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminFetch, getAdminIdToken } from '@/lib/admin-browser';
import type { Conference } from '@/types';
import { useI18n } from '@/components/i18n/locale-provider';
import { translateAdminError } from '@/lib/i18n/admin-errors';
import { storageObjectPathToPublicUrl } from '@/lib/storage-public-url';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * Imágenes pegadas. No mezclar `files` e `items`: en muchos navegadores es la misma imagen con distinto
 * lastModified/nombre y acabábamos encolando duplicados.
 */
function collectPastedImageFiles(data: DataTransfer | null): File[] {
  if (!data) return [];

  const isImageFile = (f: File | null | undefined): f is File => {
    if (!f || f.size === 0) return false;
    return (
      f.type.startsWith('image/') || /\.(png|jpe?g|gif|webp|bmp)$/i.test(f.name)
    );
  };

  if (data.files?.length) {
    const fromFiles: File[] = [];
    for (let i = 0; i < data.files.length; i++) {
      const f = data.files.item(i);
      if (isImageFile(f)) fromFiles.push(f);
    }
    if (fromFiles.length > 0) return fromFiles;
  }

  const fromItems: File[] = [];
  if (data.items?.length) {
    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i];
      if (item.kind !== 'file') continue;
      const mime = item.type;
      if (mime.startsWith('image/') || mime === '' || mime === 'image/x-png') {
        const f = item.getAsFile();
        if (isImageFile(f)) fromItems.push(f);
      }
    }
  }

  return fromItems;
}

function isProbablyImageUrl(s: string): boolean {
  if (!s) return false;
  if (s.startsWith('/') || s.startsWith('blob:')) return true;
  if (s.startsWith('prod/')) return true;
  return /^https?:\/\//i.test(s);
}

type PendingImage = { id: string; file: File; previewUrl: string };

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
  /** Rutas en Storage o URLs legacy, tal como están en Firestore (se escribe en Save). */
  const [savedImageRefs, setSavedImageRefs] = useState<string[]>([]);
  /** Archivos locales: se suben a Storage solo al pulsar Save (prod/conferences/conference00N/). */
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);

  const hasAnyImages = pendingImages.length > 0 || savedImageRefs.length > 0;

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
    setSavedImageRefs([]);
    setPendingImages((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      return [];
    });
  }

  function startEdit(c: Conference) {
    setIsNew(false);
    setForm({ ...c });
    setTagsInput((c.tags ?? []).join(', '));
    setSavedImageRefs([...(c.images ?? [])]);
    setPendingImages((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      return [];
    });
  }

  function queuePendingImage(file: File) {
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `p-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const previewUrl = URL.createObjectURL(file);
    setPendingImages((prev) => [...prev, { id, file, previewUrl }]);
  }

  function removePendingImage(id: string) {
    setPendingImages((prev) => {
      const p = prev.find((x) => x.id === id);
      if (p) URL.revokeObjectURL(p.previewUrl);
      return prev.filter((x) => x.id !== id);
    });
  }

  /** Índice 1..n en la lista del admin → carpeta `conference001`, `conference002`, … */
  function conferenceStorageSlot(): number {
    if (form.id) {
      const idx = list.findIndex((c) => c.id === form.id);
      if (idx >= 0) return idx + 1;
    }
    return Math.max(1, list.length + 1);
  }

  /** Sube un archivo y devuelve la ruta de objeto en el bucket (misma que se guarda en Firestore). */
  async function uploadConferenceFileToStorage(file: File, slot: number): Promise<string> {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('scope', 'conferences');
    fd.append('slot', String(slot));
    let token = await getAdminIdToken(false);
    let res = await fetch('/api/admin/upload', {
      method: 'POST',
      body: fd,
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
      token = await getAdminIdToken(true);
      res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: fd,
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    if (res.status === 401) {
      let code: string | undefined;
      try {
        const j = (await res.json()) as { code?: string };
        code = typeof j?.code === 'string' ? j.code : undefined;
      } catch {
        /*  */
      }
      if (code === 'invalid_token' || code === 'no_email' || code === 'missing_token') {
        throw new Error('TOKEN_REJECTED_BY_SERVER');
      }
      if (code === 'email_not_allowed') {
        throw new Error('Correo no autorizado para el panel');
      }
      window.location.href = '/admin/login';
      throw new Error('No autorizado');
    }
    const json = (await res.json()) as { path?: string; url?: string; error?: string };
    if (!res.ok) {
      throw new Error(json.error || t('admin.conferences.uploadFailed'));
    }
    if (json.path) return json.path;
    if (json.url) return json.url;
    throw new Error('Sin path ni URL');
  }

  function onImagesPaste(e: React.ClipboardEvent<HTMLDivElement>) {
    e.preventDefault();
    const dt = e.clipboardData;

    void (async () => {
      const syncFiles = collectPastedImageFiles(dt);
      if (syncFiles.length > 0) {
        for (const file of syncFiles) queuePendingImage(file);
        return;
      }

      try {
        if (navigator.clipboard?.read) {
          const clipItems = await navigator.clipboard.read();
          const asyncFiles: File[] = [];
          for (const item of clipItems) {
            const imageTypes = item.types.filter((t) => t.startsWith('image/'));
            if (imageTypes.length === 0) continue;
            const type =
              imageTypes.find((t) => t === 'image/png') ??
              imageTypes.find((t) => t === 'image/jpeg' || t === 'image/jpg') ??
              imageTypes[0];
            const blob = await item.getType(type);
            const sub =
              type === 'image/png'
                ? 'png'
                : type === 'image/jpeg' || type === 'image/jpg'
                  ? 'jpg'
                  : (type.split('/')[1] || 'png').replace(/\+/g, '-') || 'png';
            asyncFiles.push(
              new File([blob], `paste-${Date.now()}-${asyncFiles.length}.${sub}`, {
                type: blob.type || type,
              })
            );
          }
          if (asyncFiles.length > 0) {
            for (const file of asyncFiles) queuePendingImage(file);
            return;
          }
        }
      } catch {
        /* Sin permiso o portapapeles no legible como imagen */
      }

      const text = dt?.getData('text/plain') ?? '';
      if (!text) return;
      const lines = text.split(/[\r\n]+/).map((s) => s.trim()).filter(Boolean);
      const asUrls = lines.filter((l) => isProbablyImageUrl(l) && !l.startsWith('blob:'));
      if (asUrls.length === 0) return;
      setSavedImageRefs((prev) => {
        const next = [...prev];
        for (const u of asUrls) {
          if (!next.includes(u)) next.push(u);
        }
        return next;
      });
    })();
  }

  async function save() {
    const tags = tagsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const audienceNum =
      form.audience !== undefined && !Number.isNaN(Number(form.audience)) ? Number(form.audience) : undefined;

    setSaving(true);
    try {
      const slot = conferenceStorageSlot();
      const uploadedPaths: string[] = [];
      for (const p of pendingImages) {
        const path = await uploadConferenceFileToStorage(p.file, slot);
        uploadedPaths.push(path);
      }
      pendingImages.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      setPendingImages([]);

      const images = [...savedImageRefs, ...uploadedPaths];

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
            <Label htmlFor="images-paste-zone">{t('admin.conferences.labelImages')}</Label>
            <div
              id="images-paste-zone"
              tabIndex={0}
              onPaste={onImagesPaste}
              className={cn(
                'flex w-full cursor-text flex-col rounded-md border border-dashed border-input bg-muted/20 px-3 outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
                hasAnyImages ? 'min-h-0 py-4' : 'min-h-[120px] items-center justify-center py-8 text-sm text-muted-foreground'
              )}
            >
              {!hasAnyImages ? (
                <span className="mx-auto max-w-[20rem] text-center leading-relaxed">
                  {t('admin.conferences.imagePasteZone')}
                </span>
              ) : (
                <ul className="flex w-full flex-wrap justify-center gap-3 sm:justify-start" role="list">
                  {pendingImages.map((p) => (
                    <li
                      key={p.id}
                      className="relative h-24 w-32 overflow-hidden rounded-md border border-border bg-background shadow-sm"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.previewUrl} alt="" className="h-full w-full object-contain p-1" />
                      <button
                        type="button"
                        className="absolute right-0.5 top-0.5 flex h-6 w-6 items-center justify-center rounded-md border border-border bg-background/90 text-xs font-semibold text-foreground shadow hover:bg-destructive/15 hover:text-destructive"
                        aria-label={t('admin.conferences.removeImage')}
                        onClick={(e) => {
                          e.stopPropagation();
                          removePendingImage(p.id);
                        }}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                  {savedImageRefs.map((ref) => (
                    <li
                      key={ref}
                      className="relative h-24 w-32 overflow-hidden rounded-md border border-border bg-background shadow-sm"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={storageObjectPathToPublicUrl(ref)}
                        alt=""
                        className="h-full w-full object-contain p-1"
                        loading="lazy"
                      />
                      <button
                        type="button"
                        className="absolute right-0.5 top-0.5 flex h-6 w-6 items-center justify-center rounded-md border border-border bg-background/90 text-xs font-semibold text-foreground shadow hover:bg-destructive/15 hover:text-destructive"
                        aria-label={t('admin.conferences.removeImage')}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSavedImageRefs((prev) => prev.filter((r) => r !== ref));
                        }}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Label htmlFor="img-up" className="text-xs text-muted-foreground cursor-pointer">
                {t('admin.conferences.uploadImage')}
              </Label>
              <input
                id="img-up"
                type="file"
                accept="image/*"
                className="text-xs"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = '';
                  if (!f) return;
                  queuePendingImage(f);
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
