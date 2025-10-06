import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';

const FileHelper = ({ onFileSelected }) => {
  const openProjectGutenberg = () => {
    Alert.alert(
      'Free EPUB Books',
      'Project Gutenberg offers free EPUB books. Would you like to visit their website?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Website',
          onPress: () => Linking.openURL('https://www.gutenberg.org/ebooks/search/?format=epub'),
        },
      ]
    );
  };

  const showFileInstructions = () => {
    Alert.alert(
      'How to Get EPUB Files',
      '1. Download from Project Gutenberg (free classics)\n' +
        '2. Convert PDF/text files using Calibre\n' +
        '3. Purchase from online bookstores\n' +
        '4. Use library digital collections\n\n' +
        'Popular EPUB sources:\n' +
        '• Project Gutenberg (free)\n' +
        '• Internet Archive\n' +
        '• Google Play Books\n' +
        '• Apple Books\n' +
        '• Amazon Kindle (convert from AZW)',
      [{ text: 'OK' }]
    );
  };

  const createSampleEpubContent = () => {
    Alert.alert(
      'Sample EPUB Content',
      'This app can read actual EPUB files. For testing:\n\n' +
        '• Use real EPUB files for best results\n' +
        '• The app demonstrates EPUB structure parsing\n' +
        '• Basic reader shows file info\n' +
        '• Enhanced reader parses chapters\n\n' +
        'Download sample EPUBs from Project Gutenberg to test!',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📁 File Helper</Text>

      <TouchableOpacity style={styles.button} onPress={showFileInstructions}>
        <Text style={styles.buttonText}>📖 How to Get EPUB Files</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={openProjectGutenberg}>
        <Text style={styles.buttonText}>🌐 Free Books (Project Gutenberg)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={createSampleEpubContent}>
        <Text style={styles.buttonText}>ℹ️ About Sample Content</Text>
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>💡 Quick Tips</Text>
        <Text style={styles.infoText}>• Start with small EPUB files (under 5MB)</Text>
        <Text style={styles.infoText}>• Classic books from Project Gutenberg work great</Text>
        <Text style={styles.infoText}>• Make sure files have .epub extension</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2c3e50',
  },
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#e8f5e8',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#27ae60',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#2d5a2d',
    marginBottom: 5,
  },
});

export default FileHelper;
