'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
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

const linkTypes: ProjectLink['type'][] = ['appStore', 'playStore', 'website', 'github', 'other'];

const emptyForm: Project = {
  id: '',
  title: '',
  description: '',
  image: '',
  technologies: [],
  category: 'web',
  links: [],
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

  const refresh = useCallback(async () => {
    setLoadError('');
    try {
      const rows = await adminFetch<Project[]>('/api/admin/projects');
      setList(rows.sort((a, b) => a.title.localeCompare(b.title)));
    } catch (e) {
      const raw = e instanceof Error ? e.message : t('admin.projects.loadFailed');
      setLoadError(translateAdminError(raw, t));
    }
  }, [t]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function startNew() {
    setIsNew(true);
    setForm(emptyForm);
    setTechInput('');
    setTagsInput('');
    setPlatformsInput('');
  }

  function startEdit(p: Project) {
    setIsNew(false);
    setForm({ ...p, links: [...(p.links ?? [])] });
    setTechInput((p.technologies ?? []).join(', '));
    setTagsInput((p.tags ?? []).join(', '));
    setPlatformsInput((p.platforms ?? []).join(', '));
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

  async function uploadCover(file: File) {
    const fd = new FormData();
    fd.append('file', file);
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
    const json = (await res.json()) as { url?: string; error?: string };
    if (!res.ok) {
      throw new Error(json.error || t('admin.projects.uploadFailed'));
    }
    if (!json.url) throw new Error('Sin URL');
    setForm((f) => ({ ...f, image: json.url }));
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
    if (form.image?.trim()) payload.image = form.image.trim();
    if (form.experience?.trim()) payload.experience = form.experience.trim();
    if (tags.length) payload.tags = tags;
    if (platforms.length) payload.platforms = platforms;

    setSaving(true);
    try {
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
        <Card className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <h2 className="font-medium text-sm text-muted-foreground">{t('admin.projects.list')}</h2>
          <ul className="space-y-2">
            {list.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-2 text-sm"
              >
                <button
                  type="button"
                  className="text-left hover:underline font-medium"
                  onClick={() => startEdit(p)}
                >
                  {p.title}
                </button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setDeleteId(p.id)}>
                  {t('admin.projects.delete')}
                </Button>
              </li>
            ))}
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
            <Label htmlFor="pi">{t('admin.projects.labelImageUrl')}</Label>
            <Input
              id="pi"
              value={form.image ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
            />
            <input
              type="file"
              accept="image/*"
              className="text-xs"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                e.target.value = '';
                if (!f) return;
                try {
                  await uploadCover(f);
                } catch (err) {
                  const raw = err instanceof Error ? err.message : t('admin.projects.uploadFailed');
                  alert(translateAdminError(raw, t));
                }
              }}
            />
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
            <Label htmlFor="pplat">{t('admin.projects.labelPlatforms')}</Label>
            <Input id="pplat" value={platformsInput} onChange={(e) => setPlatformsInput(e.target.value)} />
          </div>
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
