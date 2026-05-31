import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidUpdate(previousProps) {
    if (this.state.hasError && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 text-center text-sm font-bold text-black/60 sm:px-6 lg:px-8">
            Something went wrong. Please refresh the page.
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}
