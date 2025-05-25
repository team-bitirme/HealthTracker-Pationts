import React from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { MetricCell } from './MetricCell';

interface MetricData {
  id: string;
  title: string;
  value: string | number;
  unit?: string;
  iconName?: React.ComponentProps<typeof FontAwesome>['name'];
  iconColor?: string;
  onPress?: () => void;
}

interface MetricsGridProps {
  metrics: MetricData[];
  onCellPress?: (metricId: string) => void;
  isLoading?: boolean;
}

export function MetricsGrid({ metrics, onCellPress, isLoading = false }: MetricsGridProps) {
  const handlePress = (metricId: string) => {
    if (onCellPress) {
      onCellPress(metricId);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Veriler yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {metrics.slice(0, 2).map((metric) => (
          <MetricCell
            key={metric.id}
            title={metric.title}
            value={metric.value}
            unit={metric.unit}
            iconName={metric.iconName}
            iconColor={metric.iconColor}
            onPress={() => handlePress(metric.id)}
          />
        ))}
      </View>
      <View style={styles.row}>
        {metrics.slice(2, 4).map((metric) => (
          <MetricCell
            key={metric.id}
            title={metric.title}
            value={metric.value}
            unit={metric.unit}
            iconName={metric.iconName}
            iconColor={metric.iconColor}
            onPress={() => handlePress(metric.id)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6c757d',
  },
});
