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
        <div className="min-h-[50vh] flex flex-col items-center justify-center px-6 py-12 text-center">
          <p className="text-muted-foreground mb-4">
            Si ves esta pantalla en el Simple Browser de VS Code, ábrelo en un navegador real:
          </p>
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground font-medium hover:opacity-90"
          >
            Abrir en navegador
          </a>
          <p className="text-sm text-muted-foreground mt-6">
            Chrome, Safari o Firefox funcionan correctamente.
          </p>
        </div>
      )
    }
    return this.props.children
  }
}
