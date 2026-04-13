'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { ImageIcon, Loader2 } from 'lucide-react';
import { adminFetch, getAdminIdToken } from '@/lib/admin-browser';
import type { Project, ProjectLink } from '@/types';
import { useI18n } from '@/components/i18n/locale-provider';
import { translateAdminError } from '@/lib/i18n/admin-errors';
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
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { compressImageForUpload } from '@/lib/compress-image-client';
import { cn } from '@/lib/utils';
import { storageObjectPathToPublicUrl } from '@/lib/storage-public-url';
import { orderProjectsForDisplay } from '@/lib/projects-order';
import { collectPastedImageFiles, isProbablyImageUrl } from '@/lib/admin-image-paste';

const linkTypes: ProjectLink['type'][] = ['appStore', 'playStore', 'website', 'github', 'other'];

type PendingCover = { id: string; file: File; previewUrl: string };

/** Misma regla que charlas: límite de cuerpo en Vercel (~4.5 MB). */
const MAX_ADMIN_UPLOAD_BYTES = 4 * 1024 * 1024;

/** Portada del proyecto en el listado admin (ruta Storage o URL). */
function projectListCoverUrl(p: Project): string | null {
  const ref = p.image?.trim();
  if (!ref) return null;
  const url = storageObjectPathToPublicUrl(ref);
  return url || null;
}

const emptyForm: Project = {
  id: '',
  title: '',
  description: '',
  image: '',
  technologies: [],
  category: 'ios',
  links: [],
  language: '',
  releaseDate: '',
  webFramework: '',
  webHosting: '',
};

export function ProjectsPanel() {
  const { t } = useI18n();
  const [list, setList] = useState<Project[]>([]);
  const [loadError, setLoadError] = useState('');
  const [form, setForm] = useState<Project>(emptyForm);
  const [isNew, setIsNew] = useState(true);
  const [saving, setSaving] = useState(false);
  const [techInput, setTechInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [platformsInput, setPlatformsInput] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  /** Imagen pegada o elegida: se sube al pulsar Guardar (igual que charlas). */
  const [pendingCover, setPendingCover] = useState<PendingCover | null>(null);

  const refresh = useCallback(async () => {
    setLoadError('');
    try {
      const rows = await adminFetch<Project[]>('/api/admin/projects');
      setList(orderProjectsForDisplay(rows));
    } catch (e) {
      const raw = e instanceof Error ? e.message : t('admin.projects.loadFailed');
      setLoadError(translateAdminError(raw, t));
    }
  }, [t]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function clearPendingCover() {
    setPendingCover((prev) => {
      if (prev) URL.revokeObjectURL(prev.previewUrl);
      return null;
    });
  }

  function queuePendingCover(file: File) {
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `c-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const previewUrl = URL.createObjectURL(file);
    setPendingCover((prev) => {
      if (prev) URL.revokeObjectURL(prev.previewUrl);
      return { id, file, previewUrl };
    });
  }

  function startNew() {
    setIsNew(true);
    setForm(emptyForm);
    setTechInput('');
    setTagsInput('');
    setPlatformsInput('');
    clearPendingCover();
  }

  function startEdit(p: Project) {
    setIsNew(false);
    setForm({ ...p, links: [...(p.links ?? [])] });
    setTechInput((p.technologies ?? []).join(', '));
    setTagsInput((p.tags ?? []).join(', '));
    setPlatformsInput((p.platforms ?? []).join(', '));
    clearPendingCover();
  }

  function setLink(i: number, patch: Partial<ProjectLink>) {
    setForm((f) => {
      const links = [...(f.links ?? [])];
      links[i] = { ...links[i], ...patch };
      return { ...f, links };
    });
  }

  function addLink() {
    setForm((f) => ({
      ...f,
      links: [...(f.links ?? []), { type: 'website', url: '' }],
    }));
  }

  function removeLink(i: number) {
    setForm((f) => ({
      ...f,
      links: (f.links ?? []).filter((_, j) => j !== i),
    }));
  }

  async function uploadCoverFile(file: File): Promise<string> {
    const fileToSend = await compressImageForUpload(file);
    if (fileToSend.size > MAX_ADMIN_UPLOAD_BYTES) {
      throw new Error(t('admin.projects.uploadTooLarge'));
    }

    const fd = new FormData();
    fd.append('file', fileToSend);
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
        /* */
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
    let json: { url?: string; path?: string; error?: string } | null = null;
    if (text) {
      try {
        json = JSON.parse(text) as { url?: string; path?: string; error?: string };
      } catch {
        /* HTML del proxy (413) */
      }
    }

    if (!res.ok) {
      if (res.status === 413 || /Request Entity Too Large|Payload Too Large/i.test(text)) {
        throw new Error(t('admin.projects.uploadTooLarge'));
      }
      if (json?.error) throw new Error(json.error);
      throw new Error(t('admin.projects.uploadFailed'));
    }

    const out = json?.url?.trim() || json?.path?.trim();
    if (!out) throw new Error(t('admin.projects.uploadFailed'));
    return out;
  }

  function onCoverPaste(e: React.ClipboardEvent<HTMLDivElement>) {
    e.preventDefault();
    const dt = e.clipboardData;

    void (async () => {
      const syncFiles = collectPastedImageFiles(dt);
      if (syncFiles.length > 0) {
        queuePendingCover(syncFiles[0]);
        return;
      }

      try {
        if (navigator.clipboard?.read) {
          const clipItems = await navigator.clipboard.read();
          const asyncFiles: File[] = [];
          for (const item of clipItems) {
            const imageTypes = item.types.filter((ty) => ty.startsWith('image/'));
            if (imageTypes.length === 0) continue;
            const type =
              imageTypes.find((ty) => ty === 'image/png') ??
              imageTypes.find((ty) => ty === 'image/jpeg' || ty === 'image/jpg') ??
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
            queuePendingCover(asyncFiles[0]);
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
      clearPendingCover();
      setForm((f) => ({ ...f, image: asUrls[0] }));
    })();
  }

  async function save() {
    const technologies = techInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const tags = tagsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const platforms = platformsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const links = (form.links ?? []).filter((l) => l.url.trim());

    const payload: Record<string, unknown> = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      technologies,
      links,
    };
    if (form.experience?.trim()) payload.experience = form.experience.trim();
    if (tags.length) payload.tags = tags;
    if (platforms.length) payload.platforms = platforms;
    if (form.language?.trim()) payload.language = form.language.trim();
    if (form.releaseDate?.trim()) payload.releaseDate = form.releaseDate.trim();
    if (form.category === 'web') {
      payload.webFramework = form.webFramework?.trim() ?? '';
      payload.webHosting = form.webHosting?.trim() ?? '';
    }

    setSaving(true);
    try {
      let imageValue = form.image?.trim() ?? '';
      if (pendingCover) {
        const p = pendingCover;
        try {
          imageValue = await uploadCoverFile(p.file);
          setForm((f) => ({ ...f, image: imageValue }));
        } catch (err) {
          const raw = err instanceof Error ? err.message : t('admin.projects.uploadFailed');
          alert(translateAdminError(raw, t));
          return;
        }
        URL.revokeObjectURL(p.previewUrl);
        setPendingCover(null);
      }
      if (imageValue) payload.image = imageValue;

      if (isNew) {
        await adminFetch<{ id: string }>('/api/admin/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: payload }),
        });
      } else {
        await adminFetch(`/api/admin/projects/${encodeURIComponent(form.id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: { ...payload, id: form.id } }),
        });
      }
      await refresh();
      startNew();
    } catch (e) {
      const raw = e instanceof Error ? e.message : t('admin.projects.saveFailed');
      alert(translateAdminError(raw, t));
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    const id = deleteId;
    setDeleteLoading(true);
    try {
      await adminFetch(`/api/admin/projects/${encodeURIComponent(id)}`, { method: 'DELETE' });
      await refresh();
      if (form.id === id) startNew();
      setDeleteId(null);
    } catch (e) {
      const raw = e instanceof Error ? e.message : t('admin.projects.deleteFailed');
      alert(translateAdminError(raw, t));
    } finally {
      setDeleteLoading(false);
    }
  }

  const categoryLabel: Record<Project['category'], string> = {
    ios: t('admin.projects.categoryIos'),
    android: t('admin.projects.categoryAndroid'),
    web: t('admin.projects.categoryWeb'),
    flutter: t('admin.projects.categoryFlutter'),
  };

  const isWeb = form.category === 'web';

  const coverPreviewSrc =
    pendingCover?.previewUrl ??
    (form.image?.trim() ? storageObjectPathToPublicUrl(form.image.trim()) : '');
  const hasCoverPreview = Boolean(coverPreviewSrc);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">{t('admin.projects.title')}</h1>
        <Button type="button" variant="outline" size="sm" onClick={() => startNew()}>
          {t('admin.projects.new')}
        </Button>
      </div>
      {loadError && <p className="text-sm text-destructive">{loadError}</p>}

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="max-h-[70vh] space-y-4 overflow-y-auto rounded-2xl border-border/60 p-4 shadow-sm sm:p-5">
          <h2 className="text-sm font-medium text-muted-foreground">{t('admin.projects.list')}</h2>
          <ul className="space-y-2">
            {list.map((p) => {
              const thumbSrc = projectListCoverUrl(p);
              return (
                <li
                  key={p.id}
                  className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/40 p-2.5 text-sm transition-colors hover:bg-muted/35"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    {thumbSrc ? (
                      <Image
                        src={thumbSrc}
                        alt=""
                        width={40}
                        height={40}
                        sizes="40px"
                        className="h-10 w-10 shrink-0 rounded-lg border border-border/60 bg-muted object-cover"
                      />
                    ) : (
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/40 text-muted-foreground"
                        aria-hidden
                      >
                        <ImageIcon className="h-4 w-4 opacity-70" />
                      </div>
                    )}
                    <button
                      type="button"
                      disabled={saving}
                      className="min-w-0 flex-1 truncate text-left font-medium hover:underline disabled:cursor-not-allowed disabled:opacity-50 disabled:no-underline"
                      onClick={() => startEdit(p)}
                    >
                      {p.title.trim() || t('admin.projects.untitled')}
                    </button>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="shrink-0"
                    disabled={saving}
                    onClick={() => setDeleteId(p.id)}
                  >
                    {t('admin.projects.delete')}
                  </Button>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card className="p-4 space-y-4 max-h-[85vh] overflow-y-auto">
          <h2 className="font-medium text-sm text-muted-foreground">
            {isNew ? t('admin.projects.formNew') : t('admin.projects.formEdit')}
          </h2>
          <div className="space-y-2">
            <Label htmlFor="pt">{t('admin.projects.labelTitle')}</Label>
            <Input
              id="pt"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pd">{t('admin.projects.labelDescription')}</Label>
            <Textarea
              id="pd"
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-cover-paste">{t('admin.projects.labelImageUrl')}</Label>
            <p className="text-xs text-muted-foreground">{t('admin.projects.imageUploadOnSave')}</p>
            <div
              id="project-cover-paste"
              tabIndex={saving ? -1 : 0}
              onPaste={saving ? undefined : onCoverPaste}
              className={cn(
                'flex w-full cursor-text flex-col rounded-md border border-dashed border-input bg-muted/20 px-3 outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
                hasCoverPreview ? 'min-h-0 py-4' : 'min-h-[120px] items-center justify-center py-8 text-sm text-muted-foreground',
                saving && 'pointer-events-none opacity-50'
              )}
            >
              {!hasCoverPreview ? (
                <span className="mx-auto max-w-[20rem] text-center leading-relaxed">
                  {t('admin.projects.imagePasteZone')}
                </span>
              ) : (
                <div className="relative mx-auto w-full max-w-[240px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverPreviewSrc}
                    alt=""
                    className="h-40 w-full rounded-md border border-border bg-background object-contain p-1"
                  />
                  <button
                    type="button"
                    disabled={saving}
                    className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background/90 text-sm font-semibold shadow hover:bg-destructive/15 hover:text-destructive disabled:opacity-40"
                    aria-label={t('admin.conferences.removeImage')}
                    onClick={(ev) => {
                      ev.stopPropagation();
                      clearPendingCover();
                      setForm((f) => ({ ...f, image: '' }));
                    }}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Label htmlFor="project-cover-file" className="text-xs text-muted-foreground cursor-pointer">
                {t('admin.conferences.uploadImage')}
              </Label>
              <input
                id="project-cover-file"
                type="file"
                accept="image/*"
                className="text-xs"
                disabled={saving}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = '';
                  if (!f) return;
                  queuePendingCover(f);
                }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pcat">{t('admin.projects.labelCategory')}</Label>
            <select
              id="pcat"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value as Project['category'] }))
              }
            >
              {(['ios', 'android', 'web', 'flutter'] as const).map((cat) => (
                <option key={cat} value={cat}>
                  {categoryLabel[cat]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="plang">
              {isWeb ? t('admin.projects.labelLanguageWeb') : t('admin.projects.labelLanguage')}
            </Label>
            <Input
              id="plang"
              placeholder={isWeb ? t('admin.projects.placeholderLanguageWeb') : 'Swift, SwiftUI, Dart…'}
              value={form.language ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prel">
              {isWeb ? t('admin.projects.labelReleaseDateWeb') : t('admin.projects.labelReleaseDate')}
            </Label>
            <Input
              id="prel"
              placeholder={isWeb ? t('admin.projects.placeholderReleaseDateWeb') : 'YYYY-MM-DD'}
              value={form.releaseDate ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, releaseDate: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ptech">{t('admin.projects.labelTech')}</Label>
            <Input id="ptech" value={techInput} onChange={(e) => setTechInput(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pexp">{t('admin.projects.labelExperience')}</Label>
            <Input
              id="pexp"
              value={form.experience ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pplat">
              {isWeb ? t('admin.projects.labelPlatformsWeb') : t('admin.projects.labelPlatforms')}
            </Label>
            <Input
              id="pplat"
              placeholder={isWeb ? t('admin.projects.placeholderPlatformsWeb') : undefined}
              value={platformsInput}
              onChange={(e) => setPlatformsInput(e.target.value)}
            />
          </div>
          {isWeb ? (
            <div className="space-y-4 rounded-xl border border-border/60 bg-muted/20 p-4">
              <p className="text-xs font-medium text-muted-foreground">{t('admin.projects.webSectionTitle')}</p>
              <div className="space-y-2">
                <Label htmlFor="pwebfw">{t('admin.projects.labelWebFramework')}</Label>
                <Input
                  id="pwebfw"
                  placeholder={t('admin.projects.placeholderWebFramework')}
                  value={form.webFramework ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, webFramework: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pwebhost">{t('admin.projects.labelWebHosting')}</Label>
                <Input
                  id="pwebhost"
                  placeholder={t('admin.projects.placeholderWebHosting')}
                  value={form.webHosting ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, webHosting: e.target.value }))}
                />
              </div>
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="ptags">{t('admin.projects.labelTags')}</Label>
            <Input id="ptags" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t('admin.projects.linksHeading')}</Label>
              <Button type="button" variant="outline" size="sm" onClick={addLink}>
                {t('admin.projects.addLink')}
              </Button>
            </div>
            {(form.links ?? []).map((link, i) => (
              <div key={i} className="flex flex-wrap gap-2 items-end border rounded-md p-2">
                <div className="space-y-1">
                  <Label className="text-xs">{t('admin.projects.labelLinkType')}</Label>
                  <select
                    className="flex h-8 rounded-md border border-input bg-background px-2 text-xs"
                    value={link.type}
                    onChange={(e) => setLink(i, { type: e.target.value as ProjectLink['type'] })}
                  >
                    {linkTypes.map((lt) => (
                      <option key={lt} value={lt}>
                        {t(`projectLinks.${lt}` as const)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 min-w-[120px] space-y-1">
                  <Label className="text-xs">{t('admin.projects.labelLinkUrl')}</Label>
                  <Input
                    className="h-8 text-xs"
                    value={link.url}
                    onChange={(e) => setLink(i, { url: e.target.value })}
                  />
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeLink(i)}>
                  {t('admin.projects.removeLink')}
                </Button>
              </div>
            ))}
          </div>
          <Button type="button" onClick={() => save()} disabled={saving || !form.title.trim()}>
            {saving ? t('admin.projects.saving') : t('admin.projects.save')}
          </Button>
        </Card>
      </div>

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open && !deleteLoading) setDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.projects.confirmDelete')}</AlertDialogTitle>
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
              {t('admin.projects.delete')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
