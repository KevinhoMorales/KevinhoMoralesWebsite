'use client'

import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center px-6 py-12 text-center gap-3 max-w-lg mx-auto">
          <p className="text-muted-foreground">
            Algo falló al renderizar la página. Si la terminal muestra un error distinto, corrígelo primero.
          </p>
          <ul className="text-xs text-muted-foreground text-left list-disc pl-5 space-y-2">
            <li>
              Limpia caché y arranca de nuevo:{' '}
              <code className="rounded bg-muted px-1">npm run dev:clean</code>
            </li>
            <li>
              Usa el puerto que indique Next (3000, 3001…):{' '}
              <code className="rounded bg-muted px-1">http://localhost:PUERTO</code>
            </li>
            <li>
              El panel embebido del editor a veces no carga bien; prueba Chrome o Safari.
            </li>
            <li>
              La primera compilación puede tardar ~10–30 s; espera o prueba{' '}
              <code className="rounded bg-muted px-1">npm run dev:turbo</code>.
            </li>
          </ul>
        </div>
      )
    }
    return this.props.children
  }
}
