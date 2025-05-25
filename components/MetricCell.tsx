import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface MetricCellProps {
  title: string;
  value: string | number;
  unit?: string;
  iconName?: React.ComponentProps<typeof FontAwesome>['name'];
  iconImage?: ImageSourcePropType;
  iconColor?: string;
  onPress?: () => void;
}

export function MetricCell({
  title,
  value,
  unit,
  iconName,
  iconImage,
  iconColor = '#ff6b6b',
  onPress,
}: MetricCellProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.contentContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.value}>{value}</Text>
            {unit && <Text style={styles.unit}>{unit}</Text>}
          </View>
        </View>
        <View style={styles.iconContainer}>
          {iconName && <FontAwesome name={iconName} size={28} color={iconColor} />}
          {iconImage && <Image source={iconImage} style={styles.iconImage} />}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    margin: 6,
    flex: 1,
    minHeight: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#6c757d',
    fontSize: 16,
    marginBottom: 4,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    color: '#212529',
    fontSize: 24,
    fontWeight: 'bold',
  },
  unit: {
    color: '#495057',
    fontSize: 14,
    marginLeft: 4,
    fontWeight: '500',
  },
  iconContainer: {
    marginLeft: 12,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
  },
  iconImage: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
});
