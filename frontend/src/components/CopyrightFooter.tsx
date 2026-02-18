import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

interface CopyrightFooterProps {
  showLinks?: boolean;
}

export const CopyrightFooter: React.FC<CopyrightFooterProps> = ({ showLinks = true }) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {showLinks && (
        <View style={styles.linksContainer}>
          <TouchableOpacity onPress={() => router.push('/legal/terms')}>
            <Text style={styles.link}>Terms & Conditions</Text>
          </TouchableOpacity>
          <Text style={styles.separator}>•</Text>
          <TouchableOpacity onPress={() => router.push('/legal/privacy')}>
            <Text style={styles.link}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      )}
      <Text style={styles.copyrightText}>
        © 2026 MomManager by Diana-Elena Albu. All rights reserved.{'\n'}
        Unauthorized reproduction or distribution of this app's content, code, or design is strictly prohibited.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#fce7f3',
    backgroundColor: '#fdf2f8',
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  link: {
    fontSize: 12,
    color: '#ec4899',
    fontWeight: '500',
  },
  separator: {
    fontSize: 12,
    color: '#d1d5db',
  },
  copyrightText: {
    fontSize: 10,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 14,
  },
});
