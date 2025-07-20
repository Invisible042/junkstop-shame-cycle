import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundaryClass extends Component<Props & { theme: any }, State> {
  constructor(props: Props & { theme: any }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // In production, you might want to send this to a logging service
    if (__DEV__) {
      console.log('Error details:', errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={[styles.container, { backgroundColor: this.props.theme.background }]}>
          <View style={[styles.errorCard, { backgroundColor: this.props.theme.cardBg }]}>
            <View style={[styles.iconContainer, { backgroundColor: this.props.theme.accent + '20' }]}>
              <Ionicons name="warning-outline" size={48} color={this.props.theme.accent} />
            </View>
            
            <Text style={[styles.title, { color: this.props.theme.text }]}>
              Oops! Something went wrong
            </Text>
            
            <Text style={[styles.message, { color: this.props.theme.textSecondary }]}>
              Don't worry, this is just a demo. The app encountered a minor issue.
            </Text>

            {__DEV__ && this.state.error && (
              <View style={[styles.errorDetails, { backgroundColor: this.props.theme.inputBg }]}>
                <Text style={[styles.errorText, { color: this.props.theme.textSecondary }]}>
                  {this.state.error.message}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: this.props.theme.accent }]}
              onPress={this.handleRetry}
            >
              <Ionicons name="refresh" size={20} color="#fff" style={styles.retryIcon} />
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

// Wrapper component to provide theme context
export const ErrorBoundary: React.FC<Props> = ({ children, fallback }) => {
  const { theme } = useTheme();
  
  return (
    <ErrorBoundaryClass theme={theme} fallback={fallback}>
      {children}
    </ErrorBoundaryClass>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorCard: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  errorDetails: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    width: '100%',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 140,
    justifyContent: 'center',
  },
  retryIcon: {
    marginRight: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 