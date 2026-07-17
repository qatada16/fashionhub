import { Component } from 'react';
import EmptyState from './EmptyState.jsx';
import Button from './Button.jsx';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidUpdate(prevProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      return (
        <EmptyState
          title="Something went wrong"
          description="This page hit an unexpected error. Try reloading it."
          action={<Button variant="ghost" onClick={() => this.setState({ error: null })}>Reload page</Button>}
        />
      );
    }
    return this.props.children;
  }
}
