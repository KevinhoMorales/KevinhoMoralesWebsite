'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminFetch, getAdminIdToken } from '@/lib/admin-browser';
import type { Project, ProjectLink } from '@/types';
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
  const [list, setList] = useState<Project[]>([]);
  const [loadError, setLoadError] = useState('');
  const [form, setForm] = useState<Project>(emptyForm);
  const [isNew, setIsNew] = useState(true);
  const [saving, setSaving] = useState(false);
  const [techInput, setTechInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [platformsInput, setPlatformsInput] = useState('');

  const refresh = useCallback(async () => {
    setLoadError('');
    try {
      const rows = await adminFetch<Project[]>('/api/admin/projects');
      setList(rows.sort((a, b) => a.title.localeCompare(b.title)));
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Error al cargar');
    }
  }, []);

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
    if (!res.ok) throw new Error(json.error || 'Error al subir');
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
      alert(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  async function del(id: string) {
    if (!confirm('¿Eliminar este proyecto?')) return;
    try {
      await adminFetch(`/api/admin/projects/${encodeURIComponent(id)}`, { method: 'DELETE' });
      await refresh();
      if (form.id === id) startNew();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al eliminar');
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Proyectos</h1>
        <Button type="button" variant="outline" size="sm" onClick={() => startNew()}>
          Nuevo
        </Button>
      </div>
      {loadError && <p className="text-sm text-destructive">{loadError}</p>}

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <h2 className="font-medium text-sm text-muted-foreground">Listado</h2>
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
                <Button type="button" variant="ghost" size="sm" onClick={() => del(p.id)}>
                  Borrar
                </Button>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4 space-y-4 max-h-[85vh] overflow-y-auto">
          <h2 className="font-medium text-sm text-muted-foreground">{isNew ? 'Nuevo proyecto' : 'Editar'}</h2>
          <div className="space-y-2">
            <Label htmlFor="pt">Título</Label>
            <Input
              id="pt"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pd">Descripción</Label>
            <Textarea
              id="pd"
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pi">Imagen (URL)</Label>
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
                  alert(err instanceof Error ? err.message : 'Error al subir');
                }
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pcat">Categoría</Label>
            <select
              id="pcat"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value as Project['category'] }))
              }
            >
              <option value="ios">ios</option>
              <option value="android">android</option>
              <option value="web">web</option>
              <option value="flutter">flutter</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ptech">Tecnologías (coma)</Label>
            <Input id="ptech" value={techInput} onChange={(e) => setTechInput(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pexp">Experiencia / cliente</Label>
            <Input
              id="pexp"
              value={form.experience ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pplat">Plataformas (coma)</Label>
            <Input id="pplat" value={platformsInput} onChange={(e) => setPlatformsInput(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ptags">Tags (coma)</Label>
            <Input id="ptags" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Enlaces</Label>
              <Button type="button" variant="outline" size="sm" onClick={addLink}>
                Añadir
              </Button>
            </div>
            {(form.links ?? []).map((link, i) => (
              <div key={i} className="flex flex-wrap gap-2 items-end border rounded-md p-2">
                <div className="space-y-1">
                  <Label className="text-xs">Tipo</Label>
                  <select
                    className="flex h-8 rounded-md border border-input bg-background px-2 text-xs"
                    value={link.type}
                    onChange={(e) => setLink(i, { type: e.target.value as ProjectLink['type'] })}
                  >
                    {linkTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 min-w-[120px] space-y-1">
                  <Label className="text-xs">URL</Label>
                  <Input
                    className="h-8 text-xs"
                    value={link.url}
                    onChange={(e) => setLink(i, { url: e.target.value })}
                  />
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeLink(i)}>
                  Quitar
                </Button>
              </div>
            ))}
          </div>
          <Button type="button" onClick={() => save()} disabled={saving || !form.title.trim()}>
            {saving ? 'Guardando…' : 'Guardar'}
          </Button>
        </Card>
      </div>
    </div>
  );
}
