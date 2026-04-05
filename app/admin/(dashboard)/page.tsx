import Link from 'next/link';
import { Card } from '@/components/ui/card';

export default function AdminHomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Panel</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gestiona charlas y proyectos publicados en el sitio (Firestore + Storage).
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/admin/conferences">
          <Card className="p-6 hover:bg-muted/50 transition-colors">
            <h2 className="font-medium">Charlas</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Alta, edición y borrado en conferencias (Firestore bajo admin del sitio)
            </p>
          </Card>
        </Link>
        <Link href="/admin/projects">
          <Card className="p-6 hover:bg-muted/50 transition-colors">
            <h2 className="font-medium">Proyectos</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Alta, edición y borrado en proyectos (Firestore bajo admin del sitio)
            </p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
