import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import Watermark from '../components/Watermark';
import { WATERMARK_PRESETS } from '../utils/WatermarkUtils';
// import ScreenshotProtection from '../components/ScreenshotProtection';

const WebViewEpubReader = ({ base64Epub }) => {
  const webViewRef = useRef(null);
  const [cachedEpub, setCachedEpub] = useState(base64Epub);
  const [key, setKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [bookTitle, setBookTitle] = useState('');


  const cleanBase64 = (base64) => {
    if (!base64) return '';
    return base64
      .replace(/"/g, '\\"')
      .replace(/'/g, "\\'")
      .replace(/\n/g, '')
      .replace(/\r/g, '')
      .trim();
  };

  const cleanedBase64 = cleanBase64(base64Epub);

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
    <script src="https://unpkg.com/epubjs@0.3.93/dist/epub.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            background: #ffffff !important;
            overflow: hidden;
            width: 100%;
            height: 100%;
        }
        #viewer {
            width: 100%;
            height: 100vh;
            background: #ffffff !important;
            display: none;
            position: relative;
        }
        #loader {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            font-size: 18px;
            color: #666;
            background: #ffffff;
        }
        #error {
            display: none;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            padding: 20px;
            text-align: center;
            color: #d32f2f;
            background: #ffffff;
        }
        .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #007AFF;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* EPUB container styles */
        .epub-container {
            background: #ffffff !important;
            width: 100% !important;
            height: 100% !important;
        }
        
        /* Ensure content is visible */
        .epub-view iframe {
            background: #ffffff !important;
            width: 100% !important;
            height: 100% !important;
            border: none !important;
        }
        
        /* Enable scrolling for continuous flow */
        #viewer {
            overflow-y: auto !important;
            overflow-x: hidden !important;
        }
        
        .epub-view {
            overflow-y: auto !important;
            overflow-x: hidden !important;
        }
        
        /* Remove navigation overlay for continuous scrolling */
        #nav-overlay {
            display: none !important;
        }
    </style>
</head>
<body>
    <div id="nav-overlay">
        <div class="nav-section prev-section" onclick="navigatePrev()"></div>
        <div class="nav-section next-section" onclick="navigateNext()"></div>
    </div>
    
    <div id="viewer"></div>
    <div id="loader">
        <div class="spinner"></div>
        <div>Loading EPUB Reader...</div>
    </div>
    <div id="error">
        <div style="font-size: 24px; margin-bottom: 16px;">❌</div>
        <div id="error-message">Failed to load EPUB</div>
        <button onclick="retryLoading()" style="margin-top: 16px; padding: 8px 16px; background: #007AFF; color: white; border: none; border-radius: 4px; cursor: pointer;">Retry</button>
    </div>
    
    <script>
        let book = null;
        let rendition = null;
        let currentLocation = null;
        let spineItems = [];
        let currentSpineIndex = 0;
        const base64Epub = "${cleanedBase64}";

        function showError(message) {
            console.error('EPUB Error:', message);
            document.getElementById('loader').style.display = 'none';
            document.getElementById('viewer').style.display = 'none';
            document.getElementById('error').style.display = 'flex';
            document.getElementById('error-message').textContent = message;
            
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'error',
                    message: message
                }));
            }
        }

        function showLoader() {
            document.getElementById('loader').style.display = 'flex';
            document.getElementById('viewer').style.display = 'none';
            document.getElementById('error').style.display = 'none';
        }

        function showViewer() {
            document.getElementById('loader').style.display = 'none';
            document.getElementById('viewer').style.display = 'block';
            document.getElementById('error').style.display = 'none';
            
            // Force background color
            document.body.style.backgroundColor = '#ffffff';
            document.body.style.background = '#ffffff';
        }

        function retryLoading() {
            showLoader();
            setTimeout(initEpubViewer, 500);
        }

        function navigatePrev() {
            // For continuous scrolling, scroll up by viewport height
            const viewer = document.getElementById('viewer');
            if (viewer) {
                viewer.scrollTop -= window.innerHeight * 0.8;
            }
        }

        function navigateNext() {
            // For continuous scrolling, scroll down by viewport height
            const viewer = document.getElementById('viewer');
            if (viewer) {
                viewer.scrollTop += window.innerHeight * 0.8;
            }
        }

        function updateNavigationInfo() {
            if (book && rendition) {
                try {
                    const location = rendition.currentLocation();
                    if (location && location.start) {
                        currentSpineIndex = location.start.index;
                        const total = spineItems.length;
                        
                        console.log('Navigation - Index:', currentSpineIndex, 'Total:', total, 'Location:', location);
                        
                        if (window.ReactNativeWebView) {
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                                type: 'navigation',
                                currentPage: currentSpineIndex + 1,
                                totalPages: total,
                                location: location
                            }));
                        }
                    }
                } catch (error) {
                    console.error('Error updating navigation:', error);
                }
            }
        }

        function checkLibraries() {
            if (typeof JSZip === 'undefined') {
                showError('JSZip library not loaded.');
                return false;
            }
            
            if (typeof ePub === 'undefined') {
                showError('EPUB.js library not loaded.');
                return false;
            }
            
            return true;
        }

        function base64ToArrayBuffer(base64) {
            try {
                let cleanBase64 = base64;
                if (base64.includes(',')) {
                    cleanBase64 = base64.split(',')[1];
                }
                cleanBase64 = cleanBase64.replace(/[^A-Za-z0-9+/]/g, '');
                
                const binaryString = atob(cleanBase64);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                return bytes.buffer;
            } catch (error) {
                throw new Error('Invalid Base64 data: ' + error.message);
            }
        }
        
        function initEpubViewer() {
            try {
                console.log('Initializing EPUB viewer...');
                
                if (!checkLibraries()) return;

                if (!base64Epub || base64Epub.length < 100) {
                    showError('Invalid EPUB data');
                    return;
                }

                const arrayBuffer = base64ToArrayBuffer(base64Epub);
                book = ePub(arrayBuffer);
                
                if (!book) {
                    showError('Failed to create EPUB instance');
                    return;
                }

                // Load metadata first
                book.loaded.metadata.then(function(metadata) {
                    console.log('Book metadata:', metadata);
                    
                    if (window.ReactNativeWebView) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'metadata',
                            title: metadata.title || 'Unknown Title',
                            creator: metadata.creator || 'Unknown Author'
                        }));
                    }
                    
                    return book.ready;
                })
                .then(() => {
                    console.log('EPUB book ready, getting spine...');
                    
                    // Get spine items for navigation
                    spineItems = [];
                    book.spine.each(function(section) {
                        spineItems.push(section);
                    });
                    
                    console.log('Spine items count:', spineItems.length);
                    
                    // Render with continuous vertical flow
                    rendition = book.renderTo("viewer", {
                        width: "100%",
                        height: "100%",
                        spread: "none",
                        flow: "scrolled-continuous", // Continuous vertical scrolling
                        manager: "continuous"
                    });
                    
                    // Apply custom styles to ensure content is visible
                    rendition.hooks.content.register(function(contents) {
                        console.log('Applying styles to content');
                        contents.addStylesheet(\`
                            * {
                                background: white !important;
                                color: black !important;
                                visibility: visible !important;
                                opacity: 1 !important;
                                display: block !important;
                            }
                            body {
                                background: white !important;
                                color: black !important;
                                margin: 20px !important;
                                padding: 20px !important;
                                font-size: 18px !important;
                                line-height: 1.6 !important;
                                font-family: -apple-system, BlinkMacSystemFont, sans-serif !important;
                                visibility: visible !important;
                                opacity: 1 !important;
                            }
                            html {
                                background: white !important;
                            }
                            .epub-container {
                                background: white !important;
                            }
                            iframe {
                                background: white !important;
                            }
                        \`);
                        
                        // Also inject styles directly into the iframe
                        const iframe = contents.document.defaultView;
                        if (iframe && iframe.document) {
                            const style = iframe.document.createElement('style');
                            style.textContent = \`
                                body {
                                    background: white !important;
                                    color: black !important;
                                    margin: 20px !important;
                                    padding: 20px !important;
                                    font-size: 18px !important;
                                    line-height: 1.6 !important;
                                    font-family: -apple-system, BlinkMacSystemFont, sans-serif !important;
                                }
                                * {
                                    background: white !important;
                                    color: black !important;
                                }
                            \`;
                            iframe.document.head.appendChild(style);
                        }
                    });
                    
                    // Set up event listeners
                    rendition.on('relocated', function(location) {
                        console.log('Relocated to:', location);
                        updateNavigationInfo();
                    });
                    
                    rendition.on('rendered', function(section) {
                        console.log('Section rendered:', section);
                        updateNavigationInfo();
                        
                        // Force content visibility
                        setTimeout(function() {
                            const iframes = document.querySelectorAll('iframe');
                            iframes.forEach(function(iframe) {
                                try {
                                    if (iframe.contentDocument) {
                                        iframe.contentDocument.body.style.backgroundColor = 'white';
                                        iframe.contentDocument.body.style.color = 'black';
                                        iframe.contentDocument.body.style.visibility = 'visible';
                                        iframe.contentDocument.body.style.opacity = '1';
                                    }
                                } catch (e) {
                                    console.log('Cannot access iframe content');
                                }
                            });
                        }, 100);
                    });
                    
                    rendition.on('displayed', function() {
                        console.log('Content displayed');
                        updateNavigationInfo();
                    });
                    
                    // Display the first section
                    return rendition.display();
                })
                .then(() => {
                    console.log('EPUB rendered successfully');
                    showViewer();
                    
                    // Initial navigation update
                    setTimeout(function() {
                        updateNavigationInfo();
                        
                        // Send loaded message
                        if (window.ReactNativeWebView) {
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                                type: 'loaded',
                                message: 'EPUB loaded successfully',
                                totalPages: spineItems.length
                            }));
                        }
                    }, 1000);
                    
                })
                .catch(error => {
                    console.error('Error loading EPUB:', error);
                    showError('Failed to load EPUB: ' + error.message);
                });
                
            } catch (error) {
                console.error('Error in initEpubViewer:', error);
                showError('Error loading EPUB: ' + error.message);
            }
        }
        
        function waitForLibraries() {
            const maxWaitTime = 15000;
            const startTime = Date.now();
            
            function check() {
                if (typeof JSZip !== 'undefined' && typeof ePub !== 'undefined') {
                    console.log('All libraries loaded, initializing EPUB viewer...');
                    initEpubViewer();
                    return;
                }
                
                if (Date.now() - startTime > maxWaitTime) {
                    showError('Libraries failed to load within timeout');
                    return;
                }
                
                setTimeout(check, 100);
            }
            
            check();
        }
        
        // Start immediately
        console.log('Starting EPUB loading process...');
        waitForLibraries();

        // Send ready message to React Native
        if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'ready',
                message: 'WebView is ready'
            }));
        }

        // Make functions available globally for React Native
        window.navigatePrev = navigatePrev;
        window.navigateNext = navigateNext;
        window.updateNavigationInfo = updateNavigationInfo;
        window.book = book;
        window.rendition = rendition;
    </script>
</body>
</html>
  `;

  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('WebView message:', data);
      
      if (data.type === 'error') {
        console.error('EPUB loading error:', data.message);
        setIsLoading(false);
      } else if (data.type === 'loaded') {
        console.log('EPUB loaded successfully');
        setIsLoading(false);
        setIsLoaded(true);
        if (data.totalPages) {
          setTotalPages(data.totalPages);
        }
      } else if (data.type === 'ready') {
        console.log('WebView ready');
      } else if (data.type === 'navigation') {
        console.log('Navigation update:', data);
        setCurrentPage(data.currentPage || 1);
        setTotalPages(data.totalPages || 1);
      } else if (data.type === 'metadata') {
        console.log('Book metadata:', data);
        setBookTitle(data.title);
      }
    } catch (error) {
      console.log('WebView message (raw):', event.nativeEvent.data);
    }
  };

  const handleWebViewError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.warn('WebView error: ', nativeEvent);
    setIsLoading(false);
  };

  const handleLoadEnd = () => {
    console.log('WebView load completed');
  };

  const navigateNext = () => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        console.log('Next button clicked');
        if (window.navigateNext) {
          window.navigateNext();
        } else {
          console.log('Navigation function not available');
        }
      `);
    }
  };

  const navigatePrev = () => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        console.log('Previous button clicked');
        if (window.navigatePrev) {
          window.navigatePrev();
        } else {
          console.log('Navigation function not available');
        }
      `);
    }
  };

  const reloadEpub = () => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        console.log('Reloading EPUB');
        if (window.book && window.rendition) {
          window.rendition.display(0);
          setTimeout(function() {
            if (window.updateNavigationInfo) {
              window.updateNavigationInfo();
            }
          }, 500);
        }
      `);
    }
  };

  useEffect(() => {
    if (base64Epub && base64Epub !== cachedEpub) {
      setCachedEpub(base64Epub);
      setKey(prev => prev + 1);
      setIsLoading(true);
      setIsLoaded(false);
      setCurrentPage(1);
      setTotalPages(1);
    }
  }, [base64Epub, cachedEpub]);

  if (!base64Epub) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No EPUB data provided</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isLoaded && (
        <View style={styles.headerContainer}>
          <Text style={styles.bookTitle} numberOfLines={1}>
            {bookTitle || 'EPUB Book'}
          </Text>
        </View>
      )}

      {isLoaded && (
        <View style={styles.navigationContainer}>
          <View style={styles.pageInfoContainer}>
            <Text style={styles.pageInfo}>
              Section {currentPage} of {totalPages}
            </Text>
            {totalPages > 1 && (
              <Text style={styles.pageProgress}>
                {Math.round((currentPage / totalPages) * 100)}% complete
              </Text>
            )}
          </View>
        </View>
      )}



      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading EPUB Reader...</Text>
        </View>
      )}

      <WebView
        key={key}
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={[
          styles.webview,
          isLoading && styles.hiddenWebview
        ]}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        onError={handleWebViewError}
        onLoadEnd={handleLoadEnd}
        onMessage={handleWebViewMessage}
        allowFileAccess={true}
        mixedContentMode="compatibility"
        originWhitelist={['*']}
        allowsInlineMediaPlayback={true}
        onContentProcessDidTerminate={() => {
          console.log('WebView terminated, reloading...');
          setKey(prev => prev + 1);
        }}
      />
                <Watermark
            text={WATERMARK_PRESETS.medium.text}
            opacity={WATERMARK_PRESETS.medium.opacity}
            fontSize={WATERMARK_PRESETS.medium.fontSize}
            color={WATERMARK_PRESETS.medium.color}
            rotation={WATERMARK_PRESETS.medium.rotation}
          />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding:10,
    // backgroundColor:'pink'
  },
  headerContainer: {
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  webview: {
    flex: 1,
  },
  hiddenWebview: {
    opacity: 0,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  navButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  navButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  pageInfoContainer: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 10,
  },
  pageInfo: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  pageProgress: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  debugContainer: {
    padding: 5,
    backgroundColor: '#ffeb3b',
    borderBottomWidth: 1,
    borderBottomColor: '#ffc107',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  debugButton: {
    padding: 5,
    backgroundColor: '#ff9800',
    borderRadius: 4,
  },
  debugButtonText: {
    fontSize: 10,
    color: '#333',
    fontWeight: 'bold',
  },
  debugText: {
    fontSize: 10,
    color: '#333',
    fontFamily: 'monospace',
    flex: 1,
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
  },
});

export default WebViewEpubReader;
