import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Linking,
} from 'react-native';

import JSZip from 'jszip';
import { XMLParser } from 'fast-xml-parser';
import RNFS from 'react-native-fs';

import Watermark from './Watermark';
import { WATERMARK_PRESETS } from '../utils/WatermarkUtils';
import { SafeAreaView } from 'react-native-safe-area-context';

const base64ToBytes = (base64) => {
  try {
    if (typeof Buffer !== 'undefined') {
      const buffer = Buffer.from(base64, 'base64');
      return new Uint8Array(buffer);
    }

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    let i = 0;

    base64 = base64.replace(/[^A-Za-z0-9+/]/g, '');

    while (i < base64.length) {
      const encoded1 = chars.indexOf(base64.charAt(i++));
      const encoded2 = chars.indexOf(base64.charAt(i++));
      const encoded3 = chars.indexOf(base64.charAt(i++));
      const encoded4 = chars.indexOf(base64.charAt(i++));

      const bitmap = (encoded1 << 18) | (encoded2 << 12) | (encoded3 << 6) | encoded4;

      result += String.fromCharCode((bitmap >> 16) & 255);
      if (encoded3 !== 64) result += String.fromCharCode((bitmap >> 8) & 255);
      if (encoded4 !== 64) result += String.fromCharCode(bitmap & 255);
    }

    const bytes = new Uint8Array(result.length);
    for (let j = 0; j < result.length; j++) {
      bytes[j] = result.charCodeAt(j);
    }
    return bytes;
  } catch (error) {
    console.error('Base64 decode error:', error);
    return new Uint8Array(0);
  }
};

if (typeof global.atob === 'undefined') {
  global.atob = function (str) {
    try {
      if (typeof Buffer !== 'undefined') {
        return Buffer.from(str, 'base64').toString('binary');
      }
      const bytes = base64ToBytes(str);
      let result = '';
      for (let i = 0; i < bytes.length; i++) {
        result += String.fromCharCode(bytes[i]);
      }
      return result;
    } catch (error) {
      console.warn('atob polyfill error:', error);
      return '';
    }
  };
}

if (typeof global.btoa === 'undefined') {
  global.btoa = function (str) {
    try {
      if (typeof Buffer !== 'undefined') {
        return Buffer.from(str, 'binary').toString('base64');
      }
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      let result = '';
      let i = 0;

      while (i < str.length) {
        const a = str.charCodeAt(i++);
        const b = i < str.length ? str.charCodeAt(i++) : 0;
        const c = i < str.length ? str.charCodeAt(i++) : 0;

        const bitmap = (a << 16) | (b << 8) | c;

        result += chars.charAt((bitmap >> 18) & 63) +
          chars.charAt((bitmap >> 12) & 63) +
          (i - 2 < str.length ? chars.charAt((bitmap >> 6) & 63) : '=') +
          (i - 1 < str.length ? chars.charAt(bitmap & 63) : '=');
      }

      return result;
    } catch (error) {
      console.warn('btoa polyfill error:', error);
      return '';
    }
  };
}

const RealFileEpubReader = ({ onBack }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [epubContent, setEpubContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const selectFile = async () => {
    try {
      setLoading(true);
      setError(null);

    //   const DocumentPicker = require('react-native-document-picker');
    //   const result = await DocumentPicker.pick({
    //     type: [DocumentPicker.types.allFiles],
    //     allowMultiSelection: false,
    //   });

      const file = result[0];

      if (!file.name || !file.name.toLowerCase().endsWith('.epub')) {
        Alert.alert(
          'Invalid File Type',
          'Please select an EPUB file (.epub extension)',
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }

      const fileInfo = {
        name: file.name,
        size: file.size || 0,
        uri: file.uri,
        type: file.type,
      };

      setSelectedFile(fileInfo);
      await parseEpubFile(file.uri);

    } catch (error) {
      console.error('File picker error:', error);
      setLoading(false);

      if (error.message && (error.message.includes('TurboModule') || error.message.includes('NativeDocumentPicker'))) {
        setError('File picker not available. Native modules need to be configured.');
        showNativeModuleHelp();
      } else if (error.code === 'DOCUMENT_PICKER_CANCELED') {
        console.log('User cancelled file picker');
      } else if (error.message && error.message.includes('atob')) {
        setError('Base64 decoding error. Please try a different EPUB file.');
      } else if (error.message && (error.message.includes('network') || error.message.includes('Network'))) {
        setError('Cannot read file from device. Please check file permissions and try again.');
        showFileReadHelp();
      } else {
        setError(`Failed to pick file: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const readFileAsArrayBuffer = async (fileUri) => {
    try {
      console.log('Reading file:', fileUri);

      let cleanUri = fileUri;

      if (fileUri.startsWith('content://') || fileUri.startsWith('file://')) {
        cleanUri = fileUri;
      } else if (!fileUri.startsWith('/')) {
        cleanUri = `file://${fileUri}`;
      }

      try {
        console.log('Trying RNFS to read:', cleanUri);
        const base64Data = await RNFS.readFile(cleanUri, 'base64');
        console.log('RNFS read successful, data length:', base64Data.length);

        const bytes = base64ToBytes(base64Data);
        console.log('Converted to bytes, length:', bytes.length);
        return bytes.buffer;

      } catch (rnfsError) {
        console.log('RNFS failed, trying fetch fallback:', rnfsError);

        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('GET', cleanUri, true);
          xhr.responseType = 'arraybuffer';

          xhr.onload = function () {
            console.log('XHR status:', xhr.status, 'Response:', xhr.response);
            if (xhr.response && xhr.response.byteLength > 0) {
              console.log('XHR successful, buffer size:', xhr.response.byteLength);
              resolve(xhr.response);
            } else {
              reject(new Error(`XHR failed: no data received (status: ${xhr.status})`));
            }
          };

          xhr.onerror = function () {
            console.error('XHR error occurred');
            reject(new Error('Network error while reading file'));
          };

          xhr.ontimeout = function () {
            reject(new Error('Timeout while reading file'));
          };

          xhr.timeout = 30000;

          try {
            xhr.send();
          } catch (sendError) {
            reject(new Error(`Failed to send request: ${sendError.message || sendError}`));
          }
        });
      }

    } catch (error) {
      console.error('File reading error:', error);
      throw new Error(`Failed to read file: ${error.message || 'Unknown error'}`);
    }
  };

  const parseEpubFile = async (fileUri) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Starting EPUB parsing for:', fileUri);

      const arrayBuffer = await readFileAsArrayBuffer(fileUri);
      console.log('File read successfully, size:', arrayBuffer.byteLength);

      const zip = new JSZip();
      const zipData = await zip.loadAsync(arrayBuffer);

      const containerFile = zipData.file('META-INF/container.xml');
      if (!containerFile) {
        throw new Error('Invalid EPUB: container.xml not found');
      }

      const containerXml = await containerFile.async('text');
      const parser = new XMLParser({ ignoreAttributes: false });
      const containerData = parser.parse(containerXml);

      const opfPath = containerData['container']['rootfiles']['rootfile']['@_full-path'];
      if (!opfPath) {
        throw new Error('Invalid EPUB: OPF path not found');
      }

      const opfFile = zipData.file(opfPath);
      if (!opfFile) {
        throw new Error(`OPF file not found: ${opfPath}`);
      }

      const opfXml = await opfFile.async('text');
      const opfData = parser.parse(opfXml);
      const packageData = opfData.package;

      const extractText = (value) => {
        if (typeof value === 'string') {
          return value;
        }
        if (typeof value === 'object' && value !== null) {
          if (value['#text']) {
            return value['#text'];
          }
          if (Array.isArray(value) && value.length > 0) {
            return extractText(value[0]);
          }
        }
        return 'Unknown';
      };

      const metadata = {
        title: extractText(packageData.metadata['dc:title']) || 'Unknown Title',
        creator: extractText(packageData.metadata['dc:creator']) || 'Unknown Author',
        language: extractText(packageData.metadata['dc:language']) || 'en',
        identifier: extractText(packageData.metadata['dc:identifier']) || 'unknown',
        description: extractText(packageData.metadata['dc:description']) || '',
      };

      const manifest = packageData.manifest.item;
      const spine = packageData.spine.itemref;

      const manifestMap = Array.isArray(manifest) ?
        manifest.reduce((acc, item) => {
          acc[item['@_id']] = item;
          return acc;
        }, {}) : { [manifest['@_id']]: manifest };

      const chapters = [];
      const spineItems = Array.isArray(spine) ? spine : [spine];

      const opfDir = opfPath.substring(0, opfPath.lastIndexOf('/'));

      for (let i = 0; i < spineItems.length; i++) {
        const spineItem = spineItems[i];
        const idref = spineItem['@_idref'];
        const manifestItem = manifestMap[idref];

        if (manifestItem && manifestItem['@_media-type'] === 'application/xhtml+xml') {
          const href = manifestItem['@_href'];
          const fullPath = opfDir ? `${opfDir}/${href}` : href;

          try {
            const chapterFile = zipData.file(fullPath);
            if (chapterFile) {
              const chapterXml = await chapterFile.async('text');

              const textContent = extractTextFromHtml(chapterXml);
              const chapterTitle = extractChapterTitle(chapterXml) || `Chapter ${i + 1}`;

              chapters.push({
                id: idref,
                title: chapterTitle,
                content: textContent,
                href: href,
              });
            }
          } catch (chapterError) {
            console.warn(`Error loading chapter ${href}:`, chapterError);
          }
        }
      }

      if (chapters.length === 0) {
        throw new Error('No readable chapters found in EPUB');
      }

      const parsedContent = {
        metadata,
        chapters,
      };

      setEpubContent(parsedContent);
      setLoading(false);

    } catch (error) {
      console.error('EPUB parsing error:', error);
      let errorMessage = 'Failed to parse EPUB';

      if (error.message && error.message.includes('atob')) {
        errorMessage = 'Base64 decoding failed. The file may be corrupted.';
      } else if (error.message && (error.message.includes('network') || error.message.includes('Network'))) {
        errorMessage = 'Cannot access the file. Please check permissions.';
      } else if (error.message && error.message.includes('ZIP')) {
        errorMessage = 'Invalid EPUB format. The file may not be a valid EPUB.';
      } else if (error.message && error.message.includes('container.xml')) {
        errorMessage = 'Invalid EPUB structure. Missing container.xml file.';
      } else if (error.message) {
        errorMessage = `Failed to parse EPUB: ${error.message}`;
      }

      setError(errorMessage);
      setLoading(false);
    }
  };

  const extractTextFromHtml = (html) => {
    let text = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();

    if (text.length > 5000) {
      text = text.substring(0, 5000) + '...\n\n[Content truncated for display]';
    }

    return text;
  };

  const extractChapterTitle = (html) => {
    const titleMatch = html.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/i) ||
      html.match(/<title[^>]*>(.*?)<\/title>/i);

    if (titleMatch) {
      return titleMatch[1].replace(/<[^>]*>/g, '').trim();
    }

    return null;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const showNativeModuleHelp = () => {
    Alert.alert(
      'Native Module Setup Required',
      'To select files from your phone, the app needs native modules configured.\n\n' +
      'Steps to fix:\n' +
      '1. Run: npx react-native link react-native-document-picker\n' +
      '2. Rebuild the app: npx react-native run-android\n' +
      '3. Grant file permissions when prompted\n\n' +
      'For now, try the "Built-in Books" option.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Use Built-in Books', onPress: onBack }
      ]
    );
  };

  const showFileReadHelp = () => {
    Alert.alert(
      'File Reading Issue',
      'Cannot read the selected file. This might be due to:\n\n' +
      '• File permission restrictions\n' +
      '• Corrupted EPUB file\n' +
      '• Unsupported file format\n' +
      '• Storage access limitations\n\n' +
      'Try selecting a different EPUB file or use Built-in Books.',
      [
        { text: 'Try Again', style: 'cancel' },
        { text: 'Use Built-in Books', onPress: onBack }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>
            {selectedFile ? 'Parsing EPUB file...' : 'Loading...'}
          </Text>
          <Text style={styles.loadingSubtext}>
            {selectedFile ? 'Extracting chapters and metadata' : 'Please wait'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>❌ Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.button} onPress={() => setError(null)}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={onBack}>
            <Text style={styles.secondaryButtonText}>Back to Menu</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (epubContent) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.bookInfo}>
            <Text style={styles.bookTitle}>{epubContent.metadata.title}</Text>
            <Text style={styles.bookAuthor}>by {epubContent.metadata.creator}</Text>
          </View>
        </View>

        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            📖 {epubContent.chapters.length} chapters • Scroll to read
          </Text>
        </View>

        <View style={styles.contentWrapper}>
          <ScrollView style={styles.contentArea} contentContainerStyle={styles.contentContainer}>
            {epubContent.chapters.map((chapter, index) => (
              <View key={chapter.id} style={styles.chapterContainer}>
                <Text style={styles.chapterText}>{chapter.content}</Text>
                {index < epubContent.chapters.length - 1 && (
                  <View style={styles.chapterDivider} />
                )}
              </View>
            ))}
          </ScrollView>
          <Watermark
            text={WATERMARK_PRESETS.medium.text}
            opacity={WATERMARK_PRESETS.medium.opacity}
            fontSize={WATERMARK_PRESETS.medium.fontSize}
            color={WATERMARK_PRESETS.medium.color}
            rotation={WATERMARK_PRESETS.medium.rotation}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>📱 Select EPUB from Phone</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.instructionBox}>
          <Text style={styles.instructionTitle}>📚 Real EPUB File Reader</Text>
          <Text style={styles.instructionText}>
            This version actually extracts and displays real EPUB content:
          </Text>
          <Text style={styles.featureText}>• Parses ZIP structure</Text>
          <Text style={styles.featureText}>• Extracts metadata (title, author)</Text>
          <Text style={styles.featureText}>• Loads actual chapters</Text>
          <Text style={styles.featureText}>• Displays formatted text content</Text>
        </View>

        <TouchableOpacity style={styles.selectButton} onPress={selectFile}>
          <Text style={styles.selectButtonText}>📂 Select EPUB File</Text>
        </TouchableOpacity>

        {selectedFile && (
          <View style={styles.fileInfo}>
            <Text style={styles.fileInfoTitle}>Selected File:</Text>
            <Text style={styles.fileInfoText}>📁 {selectedFile.name}</Text>
            <Text style={styles.fileInfoText}>📊 {formatFileSize(selectedFile.size)}</Text>
          </View>
        )}

        <View style={styles.tipsBox}>
          <Text style={styles.tipsTitle}>💡 Tips for Testing</Text>
          <Text style={styles.tipText}>• Download free EPUBs from Project Gutenberg</Text>
          <Text style={styles.tipText}>• Try small files first (under 5MB)</Text>
          <Text style={styles.tipText}>• Make sure the file has .epub extension</Text>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => Linking.openURL('https://www.gutenberg.org/ebooks/search/?format=epub')}
          >
            <Text style={styles.linkButtonText}>🌐 Get Free EPUBs</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 10,
  },
  bookInfo: {
    flex: 1,
    alignItems: 'center',
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
  },
  bookAuthor: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#2c3e50',
    marginTop: 15,
    fontWeight: '600',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    marginBottom: 15,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  instructionBox: {
    backgroundColor: '#e8f4fd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#3498db',
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2980b9',
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#2980b9',
    marginBottom: 5,
  },
  selectButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#7f8c8d',
  },
  secondaryButtonText: {
    color: '#7f8c8d',
    fontSize: 16,
    fontWeight: '600',
  },
  fileInfo: {
    backgroundColor: '#d4edda',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  fileInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#155724',
    marginBottom: 5,
  },
  fileInfoText: {
    fontSize: 14,
    color: '#155724',
    marginBottom: 2,
  },
  tipsBox: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 10,
  },
  tipText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 5,
  },
  linkButton: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  linkButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  contentWrapper: {
    flex: 1,
    position: 'relative',
  },
  contentArea: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  progressInfo: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#ecf0f1',
    borderBottomWidth: 1,
    borderBottomColor: '#bdc3c7',
  },
  progressText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    fontWeight: '500',
  },
  chapterContainer: {
    marginBottom: 30,
  },
  chapterText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#2c3e50',
    textAlign: 'justify',
  },
  chapterDivider: {
    height: 1,
    backgroundColor: '#bdc3c7',
    marginTop: 30,
    marginHorizontal: 20,
  },
});

export default RealFileEpubReader;
