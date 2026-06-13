import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export default class ARErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <p className="text-white/60 text-sm mb-2">3D viewer load nathi thato</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 rounded-xl bg-white/10 text-white text-sm"
          >
            Try Again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
