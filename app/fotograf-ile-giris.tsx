import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { DataEntryHeader } from '~/components/DataEntryHeader';

export default function FotografIleGiris() {
  const { categoryId, categoryTitle } = useLocalSearchParams<{
    categoryId: string;
    categoryTitle: string;
  }>();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <DataEntryHeader title={`${categoryTitle} - Fotoğraf ile Giriş`} />
      
      <View style={styles.content}>
        <Text style={styles.placeholder}>
          Fotoğraf ile giriş ekranı içeriği burada olacak
        </Text>
        <Text style={styles.info}>
          Kategori ID: {categoryId}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    fontSize: 18,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 20,
  },
  info: {
    fontSize: 14,
    color: '#adb5bd',
    textAlign: 'center',
  },
}); 