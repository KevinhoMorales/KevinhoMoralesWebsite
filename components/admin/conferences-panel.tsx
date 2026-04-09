'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { ImageIcon, Loader2, RefreshCw } from 'lucide-react';
import { adminFetch, getAdminIdToken } from '@/lib/admin-browser';
import type { Conference } from '@/types';
import { CONFERENCE_LOCATION_PLATFORMS } from '@/types/conference';
import { useI18n } from '@/components/i18n/locale-provider';
import { translateAdminError } from '@/lib/i18n/admin-errors';
import { storageObjectPathToPublicUrl } from '@/lib/storage-public-url';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { conferenceDateToInputValue } from '@/lib/conference-date-input';
import { sortConferencesForDisplay } from '@/lib/conference-sort';
import {
  VIDEO_URL_PRESENCIAL_NONE,
  isPresencialNoVideoUrl,
} from '@/lib/conference-video-url';
import { compressImageForUpload } from '@/lib/compress-image-client';

/** Vercel suele limitar ~4.5 MB por request; multipart añade overhead. */
const MAX_CONFERENCE_IMAGE_BYTES = 4 * 1024 * 1024;

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

/** Primera imagen de la charla para la lista admin (Storage path o URL). */
function firstConferenceListImageUrl(c: Conference): string | null {
  const ref = c.images?.[0]?.trim();
  if (!ref) return null;
  return storageObjectPathToPublicUrl(ref);
}

type PendingImage = { id: string; file: File; previewUrl: string };

function isVirtualLocationType(t: Conference['type']): boolean {
  return t === 'virtual_conference' || t === 'virtual_talk';
}

/** Presencial (no virtual): conferencia o charla en sitio. */
function isPresencialType(t: Conference['type']): boolean {
  return t === 'conference' || t === 'talk';
}

const emptyForm: Conference = {
  id: '',
  title: '',
  topic: '',
  type: 'talk',
  date: '',
  location: '',
  locationPlatform: undefined,
  city: '',
  country: '',
  videoUrl: VIDEO_URL_PRESENCIAL_NONE,
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
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [listRefreshing, setListRefreshing] = useState(false);
  /** Mensaje de éxito en la página; los errores van con `alert()` para que no se bloqueen. */
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  const hasAnyImages = pendingImages.length > 0 || savedImageRefs.length > 0;

  const refresh = useCallback(async () => {
    setLoadError('');
    try {
      const rows = await adminFetch<Conference[] | null>('/api/admin/conferences');
      const safe = Array.isArray(rows) ? rows : [];
      setList(sortConferencesForDisplay(safe));
    } catch (e) {
      const raw = e instanceof Error ? e.message : t('admin.conferences.loadFailed');
      setLoadError(translateAdminError(raw, t));
    }
  }, [t]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleRefreshList() {
    if (saving || listRefreshing) return;
    setListRefreshing(true);
    try {
      await refresh();
    } finally {
      setListRefreshing(false);
    }
  }

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
    const videoUrl =
      isPresencialType(c.type) && !c.videoUrl?.trim()
        ? VIDEO_URL_PRESENCIAL_NONE
        : (c.videoUrl ?? '');
    const location = isVirtualLocationType(c.type) ? '' : (c.location ?? '');
    const locationPlatform = isVirtualLocationType(c.type) ? c.locationPlatform : undefined;
    setForm({ ...c, date: conferenceDateToInputValue(c.date), videoUrl, location, locationPlatform });
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
  function conferenceStorageSlot(explicitId?: string): number {
    const id = explicitId ?? form.id;
    if (id) {
      const idx = list.findIndex((c) => c.id === id);
      if (idx >= 0) return idx + 1;
    }
    return Math.max(1, list.length + 1);
  }

  /** Sube un archivo y devuelve la ruta de objeto en el bucket (misma que se guarda en Firestore). */
  async function uploadConferenceFileToStorage(file: File, slot: number): Promise<string> {
    const fileToSend = await compressImageForUpload(file);
    if (fileToSend.size > MAX_CONFERENCE_IMAGE_BYTES) {
      throw new Error(t('admin.conferences.uploadTooLarge'));
    }

    const fd = new FormData();
    fd.append('file', fileToSend);
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
      const text401 = await res.text();
      let code: string | undefined;
      try {
        const j = JSON.parse(text401) as { code?: string };
        code = typeof j?.code === 'string' ? j.code : undefined;
      } catch {
        /* cuerpo no JSON */
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

    const text = await res.text();
    let json: { path?: string; url?: string; error?: string } | null = null;
    if (text) {
      try {
        json = JSON.parse(text) as { path?: string; url?: string; error?: string };
      } catch {
        /* p. ej. HTML “Request Entity Too Large” del proxy */
      }
    }

    if (!res.ok) {
      if (res.status === 413 || /Request Entity Too Large|Payload Too Large/i.test(text)) {
        throw new Error(t('admin.conferences.uploadTooLarge'));
      }
      if (json?.error) throw new Error(json.error);
      throw new Error(t('admin.conferences.uploadFailed'));
    }

    if (!json) {
      throw new Error(t('admin.conferences.uploadFailed'));
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

    if (!form.title.trim()) {
      alert(t('admin.conferences.titleRequired'));
      return;
    }
    if (!isNew && !form.id?.trim()) {
      alert(t('admin.conferences.editMissingId'));
      return;
    }

    setSaving(true);
    setDeleteId(null);
    setSaveSuccessMessage(null);
    /** Deja que React pinte el overlay antes del trabajo async (evita true+false en el mismo frame). */
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve());
      });
    });

    let saveSucceeded = false;
    let savedType: Conference['type'] | undefined;
    try {
      savedType = form.type;
      /** Misma lógica que antes; `images` son solo refs ya guardadas o URLs pegadas (sin ficheros pendientes). */
      const buildPayload = (images: string[]): Record<string, unknown> => {
        const payload: Record<string, unknown> = {
          title: form.title.trim(),
          type: form.type,
          tags,
          images,
        };
        if (form.topic?.trim()) payload.topic = form.topic.trim();
        if (form.date?.trim()) payload.date = form.date.trim();
        if (isVirtualLocationType(form.type)) {
          payload.locationPlatform = form.locationPlatform?.trim() || '';
          payload.location = '';
        } else {
          payload.location = form.location?.trim() || '';
          payload.locationPlatform = '';
        }
        if (form.city?.trim()) payload.city = form.city.trim();
        if (form.country?.trim()) payload.country = form.country.trim();
        if (form.videoUrl?.trim()) payload.videoUrl = form.videoUrl.trim();
        if (form.eventUrl?.trim()) payload.eventUrl = form.eventUrl.trim();
        if (audienceNum !== undefined && !Number.isNaN(audienceNum)) payload.audience = audienceNum;
        return payload;
      };

      const basePayload = buildPayload([...savedImageRefs]);
      let conferenceId = form.id;

      if (isNew) {
        const created = await adminFetch<{ id?: string }>('/api/admin/conferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: basePayload }),
        });
        if (!created || typeof created.id !== 'string' || !created.id.trim()) {
          throw new Error('Invalid server response');
        }
        conferenceId = created.id;
      } else {
        await adminFetch(`/api/admin/conferences/${encodeURIComponent(form.id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: { ...basePayload, id: form.id } }),
        });
      }

      if (pendingImages.length > 0) {
        const slot = conferenceStorageSlot(conferenceId);
        const uploadedPaths: string[] = [];
        for (const p of pendingImages) {
          uploadedPaths.push(await uploadConferenceFileToStorage(p.file, slot));
        }
        pendingImages.forEach((p) => URL.revokeObjectURL(p.previewUrl));
        setPendingImages([]);

        const finalPayload = buildPayload([...savedImageRefs, ...uploadedPaths]);
        await adminFetch(`/api/admin/conferences/${encodeURIComponent(conferenceId)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: { ...finalPayload, id: conferenceId } }),
        });
      }

      await refresh();
      startNew();
      saveSucceeded = true;
    } catch (e) {
      /** Va a la consola del navegador (F12 → Console), no al “Debug Console” del IDE sin depurador. */
      console.error('[admin conferences] Save failed:', e);
      const raw =
        e instanceof Error
          ? e.message
          : typeof e === 'string'
            ? e
            : t('admin.conferences.saveFailed');
      const text = translateAdminError(raw, t) || t('admin.conferences.saveFailed');
      /** Tras `finally` (overlay fuera) para que el diálogo nativo no quede tapado. */
      window.setTimeout(() => alert(text), 0);
    } finally {
      setSaving(false);
    }
    if (saveSucceeded && savedType) {
      const typeLabel = t(`conferenceType.${savedType}`);
      setSaveSuccessMessage(t('admin.conferences.saveSuccess', { type: typeLabel }));
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    const id = deleteId;
    setDeleteLoading(true);
    try {
      await adminFetch(`/api/admin/conferences/${encodeURIComponent(id)}`, { method: 'DELETE' });
      await refresh();
      if (form.id === id) startNew();
      setDeleteId(null);
    } catch (e) {
      const raw = e instanceof Error ? e.message : t('admin.conferences.deleteFailed');
      alert(translateAdminError(raw, t));
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="relative space-y-8">
      {saving ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-background/75 backdrop-blur-[2px]"
          aria-busy
          aria-live="polite"
        >
          <div className="flex items-center gap-3 rounded-xl border bg-card px-5 py-4 shadow-lg">
            <Loader2 className="h-6 w-6 shrink-0 animate-spin text-primary" aria-hidden />
            <span className="text-sm font-medium">{t('admin.conferences.saving')}</span>
          </div>
        </div>
      ) : null}
      <div className={cn(saving && 'pointer-events-none select-none')}>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">{t('admin.conferences.title')}</h1>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={saving || listRefreshing}
            onClick={() => void handleRefreshList()}
            className="gap-1.5"
          >
            <RefreshCw className={cn('h-4 w-4', listRefreshing && 'animate-spin')} aria-hidden />
            {t('admin.conferences.refresh')}
          </Button>
          <Button type="button" variant="outline" size="sm" disabled={saving} onClick={() => startNew()}>
            {t('admin.conferences.new')}
          </Button>
        </div>
      </div>
      {loadError && <p className="text-sm text-destructive">{loadError}</p>}
      {saveSuccessMessage && (
        <div
          role="status"
          className="rounded-md border border-emerald-600/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-950 dark:text-emerald-50"
        >
          <div className="flex items-start justify-between gap-3">
            <span>{saveSuccessMessage}</span>
            <button
              type="button"
              className="shrink-0 rounded-md px-2 py-0.5 text-xs font-medium opacity-80 hover:opacity-100"
              onClick={() => setSaveSuccessMessage(null)}
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <h2 className="font-medium text-sm text-muted-foreground">{t('admin.conferences.list')}</h2>
          <ul className="space-y-2">
            {list.map((c) => {
              const thumbSrc = firstConferenceListImageUrl(c);
              return (
                <li
                  key={c.id}
                  className="flex items-center gap-2 rounded-md border p-2 text-sm"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    {thumbSrc ? (
                      <Image
                        src={thumbSrc}
                        alt=""
                        width={40}
                        height={40}
                        sizes="40px"
                        className="h-10 w-10 shrink-0 rounded-md border border-border/60 bg-muted object-cover"
                      />
                    ) : (
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-dashed border-border/60 bg-muted/40 text-muted-foreground"
                        aria-hidden
                      >
                        <ImageIcon className="h-4 w-4 opacity-70" />
                      </div>
                    )}
                    <button
                      type="button"
                      disabled={saving}
                      className="min-w-0 flex-1 truncate text-left font-medium hover:underline disabled:cursor-not-allowed disabled:opacity-50 disabled:no-underline"
                      onClick={() => startEdit(c)}
                    >
                      {c.title.trim() || t('admin.conferences.untitled')}
                    </button>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="shrink-0"
                    disabled={saving}
                    onClick={() => setDeleteId(c.id)}
                  >
                    {t('admin.conferences.delete')}
                  </Button>
                </li>
              );
            })}
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
              disabled={saving}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="topic">{t('admin.conferences.labelTopic')}</Label>
            <Input
              id="topic"
              value={form.topic ?? ''}
              disabled={saving}
              onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">{t('admin.conferences.labelType')}</Label>
            <select
              id="type"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              value={form.type}
              disabled={saving}
              onChange={(e) => {
                const next = e.target.value as Conference['type'];
                setForm((f) => {
                  let videoUrl = f.videoUrl ?? '';
                  let location = f.location ?? '';
                  let locationPlatform = f.locationPlatform;
                  if (isPresencialType(next)) {
                    videoUrl = VIDEO_URL_PRESENCIAL_NONE;
                    locationPlatform = undefined;
                  } else if (isPresencialNoVideoUrl(videoUrl)) {
                    videoUrl = '';
                  }
                  if (isVirtualLocationType(next)) {
                    location = '';
                  } else {
                    locationPlatform = undefined;
                  }
                  return { ...f, type: next, videoUrl, location, locationPlatform };
                });
              }}
            >
              <option value="virtual_conference">{t('admin.conferences.typeVirtualConference')}</option>
              <option value="conference">{t('admin.conferences.typeConference')}</option>
              <option value="virtual_talk">{t('admin.conferences.typeVirtualTalk')}</option>
              <option value="talk">{t('admin.conferences.typeTalk')}</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="date">{t('admin.conferences.labelDate')}</Label>
              <Input
                id="date"
                type="date"
                value={form.date ?? ''}
                disabled={saving}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="dark:[color-scheme:dark]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="audience">{t('admin.conferences.labelAudience')}</Label>
              <Input
                id="audience"
                type="number"
                value={form.audience ?? ''}
                disabled={saving}
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
            <Label htmlFor={isVirtualLocationType(form.type) ? 'location-platform' : 'loc'}>
              {t('admin.conferences.labelLocation')}
            </Label>
            {isVirtualLocationType(form.type) ? (
              <select
                id="location-platform"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                value={form.locationPlatform ?? ''}
                disabled={saving}
                onChange={(e) => {
                  const v = e.target.value;
                  setForm((f) => ({
                    ...f,
                    locationPlatform: v.length
                      ? (v as NonNullable<Conference['locationPlatform']>)
                      : undefined,
                  }));
                }}
              >
                <option value="">{t('admin.conferences.locationPlatformPlaceholder')}</option>
                {CONFERENCE_LOCATION_PLATFORMS.map((key) => (
                  <option key={key} value={key}>
                    {t(`conferenceLocationPlatform.${key}`)}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                id="loc"
                value={form.location ?? ''}
                disabled={saving}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              />
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="city">{t('admin.conferences.labelCity')}</Label>
              <Input id="city" value={form.city ?? ''} disabled={saving} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">{t('admin.conferences.labelCountry')}</Label>
              <Input
                id="country"
                value={form.country ?? ''}
                disabled={saving}
                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="video">{t('admin.conferences.labelVideoUrl')}</Label>
            <Input
              id="video"
              value={
                isPresencialNoVideoUrl(form.videoUrl)
                  ? t('admin.conferences.videoAutoPresencial')
                  : (form.videoUrl ?? '')
              }
              disabled={saving}
              onChange={(e) => {
                const v = e.target.value;
                const autoLabel = t('admin.conferences.videoAutoPresencial').trim();
                setForm((f) => {
                  if (!isPresencialType(f.type)) {
                    return { ...f, videoUrl: v };
                  }
                  if (v.trim() === '' || v.trim() === autoLabel) {
                    return { ...f, videoUrl: VIDEO_URL_PRESENCIAL_NONE };
                  }
                  return { ...f, videoUrl: v };
                });
              }}
            />
            {isPresencialType(form.type) ? (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t('admin.conferences.videoHintPresencial')}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="event">{t('admin.conferences.labelEventUrl')}</Label>
            <Input
              id="event"
              value={form.eventUrl ?? ''}
              disabled={saving}
              onChange={(e) => setForm((f) => ({ ...f, eventUrl: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">{t('admin.conferences.labelTags')}</Label>
            <Input id="tags" value={tagsInput} disabled={saving} onChange={(e) => setTagsInput(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="images-paste-zone">{t('admin.conferences.labelImages')}</Label>
            <div
              id="images-paste-zone"
              tabIndex={saving ? -1 : 0}
              onPaste={saving ? undefined : onImagesPaste}
              className={cn(
                'flex w-full cursor-text flex-col rounded-md border border-dashed border-input bg-muted/20 px-3 outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
                hasAnyImages ? 'min-h-0 py-4' : 'min-h-[120px] items-center justify-center py-8 text-sm text-muted-foreground',
                saving && 'pointer-events-none opacity-50'
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
                        disabled={saving}
                        className="absolute right-0.5 top-0.5 flex h-6 w-6 items-center justify-center rounded-md border border-border bg-background/90 text-xs font-semibold text-foreground shadow hover:bg-destructive/15 hover:text-destructive disabled:opacity-40"
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
                        disabled={saving}
                        className="absolute right-0.5 top-0.5 flex h-6 w-6 items-center justify-center rounded-md border border-border bg-background/90 text-xs font-semibold text-foreground shadow hover:bg-destructive/15 hover:text-destructive disabled:opacity-40"
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
                disabled={saving}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = '';
                  if (!f) return;
                  queuePendingImage(f);
                }}
              />
            </div>
          </div>
          <Button
            type="button"
            onClick={() => void save()}
            disabled={saving || !form.title.trim()}
            title={!form.title.trim() ? t('admin.conferences.titleRequired') : undefined}
          >
            {saving ? t('admin.conferences.saving') : t('admin.conferences.save')}
          </Button>
        </Card>
      </div>
      </div>

      <AlertDialog
        open={deleteId !== null && !saving}
        onOpenChange={(open) => {
          if (!open && !deleteLoading && !saving) setDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.conferences.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>{t('admin.common.deleteIrreversible')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>{t('admin.common.cancel')}</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteLoading}
              onClick={() => void confirmDelete()}
            >
              {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden /> : null}
              {t('admin.conferences.delete')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
