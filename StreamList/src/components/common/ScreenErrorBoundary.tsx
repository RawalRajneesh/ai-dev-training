import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface Props {
  children: ReactNode;
  onRetry: () => void | Promise<void>;
}

interface State {
  hasError: boolean;
}

export class ScreenErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn('ScreenErrorBoundary', error.message, info.componentStack);
    }
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false });
    void this.props.onRetry();
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <View style={styles.box}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.body}>Please try again.</Text>
          <Pressable onPress={this.handleRetry} style={styles.button}>
            <Text style={styles.buttonLabel}>Try again</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.headlineMd,
    color: colors.on_surface,
    marginBottom: spacing.sm,
  },
  body: {
    ...typography.bodyMd,
    color: colors.on_surface_variant,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.surface_container_highest,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: spacing.xs,
  },
  buttonLabel: {
    ...typography.titleSm,
    color: colors.on_surface,
  },
});
