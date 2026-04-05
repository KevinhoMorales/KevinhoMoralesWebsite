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
        <div className="min-h-[50vh] flex flex-col items-center justify-center px-6 py-12 text-center gap-3">
          <p className="text-muted-foreground max-w-md">
            El panel embebido de Cursor/VS Code a veces falla con Next.js (cookies, hidratación). Abre el
            sitio en Chrome, Safari o Firefox usando el puerto que muestre tu terminal (3000, 3001, etc.).
          </p>
          <p className="text-xs text-muted-foreground">
            La primera carga tras <code className="rounded bg-muted px-1">npm run dev</code> puede tardar
            unos segundos mientras compila; espera o usa{' '}
            <code className="rounded bg-muted px-1">npm run dev:turbo</code>.
          </p>
        </div>
      )
    }
    return this.props.children
  }
}
