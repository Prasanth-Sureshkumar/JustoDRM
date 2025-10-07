import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { WebView } from 'react-native-webview';

const WebViewEpubReader = ({ base64Epub }) => {
  const webViewRef = useRef(null);
  const [cachedEpub, setCachedEpub] = useState(base64Epub);
  const [key, setKey] = useState(0);


  // const [webViewKey, setWebViewKey] = useState(0);

  console.log("WebViewEpubReader received Base64 EPUB length:", base64Epub?.length);

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
            background: #f5f5f5;
            overflow: hidden;
        }
        #viewer {
            width: 100%;
            height: 100vh;
            background: white;
            display: none;
        }
        #loader {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            font-size: 18px;
            color: #666;
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
    </style>
</head>
<body>
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
        const base64Epub = "${cleanedBase64}";

        function showError(message) {
            console.error('EPUB Error:', message);
            document.getElementById('loader').style.display = 'none';
            document.getElementById('viewer').style.display = 'none';
            document.getElementById('error').style.display = 'flex';
            document.getElementById('error-message').textContent = message;
            
            // Send error to React Native
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
            
            // Send success to React Native
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'loaded',
                    message: 'EPUB loaded successfully'
                }));
            }
        }

        function retryLoading() {
            showLoader();
            setTimeout(initEpubViewer, 500);
        }

        // Check if required libraries are loaded
        function checkLibraries() {
            if (typeof JSZip === 'undefined') {
                showError('JSZip library not loaded. Please check internet connection.');
                return false;
            }
            
            if (typeof ePub === 'undefined') {
                showError('EPUB.js library not loaded. Please check internet connection.');
                return false;
            }
            
            console.log('JSZip version:', JSZip.version);
            console.log('EPUB.js version:', ePub.version);
            return true;
        }

        // Convert Base64 to ArrayBuffer
        function base64ToArrayBuffer(base64) {
            try {
                // Clean the base64 string
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
        
        // Initialize EPUB viewer
        function initEpubViewer() {
            try {
                console.log('Initializing EPUB viewer...');
                
                // Check if required libraries are loaded
                if (!checkLibraries()) {
                    return;
                }

                // Validate base64 data
                if (!base64Epub || base64Epub.length < 100) {
                    showError('Invalid EPUB data: File is too small or empty');
                    return;
                }

                console.log('Converting Base64 to ArrayBuffer...');
                const arrayBuffer = base64ToArrayBuffer(base64Epub);
                
                console.log('Creating EPUB instance from ArrayBuffer...');
                
                // Create EPUB from ArrayBuffer
                book = ePub(arrayBuffer);
                
                if (!book) {
                    showError('Failed to create EPUB instance');
                    return;
                }

                // Wait for book to be ready
                book.ready.then(() => {
                    console.log('EPUB book ready, rendering...');
                    
                    // Render the book
                    rendition = book.renderTo("viewer", {
                        width: "100%",
                        height: "100%",
                        spread: "none",
                        flow: "scrolled-doc"
                    });
                    
                    return rendition.display();
                })
                .then(() => {
                    console.log('EPUB rendered successfully');
                    showViewer();
                    
                    // Add navigation controls
                    setupNavigation();
                    
                    // Load metadata
                    return book.loaded.metadata;
                })
                .then(metadata => {
                    console.log('Book metadata loaded:', metadata.title);
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

        function setupNavigation() {
            // Touch navigation for mobile
            let touchStartX = 0;
            let touchEndX = 0;
            
            const viewer = document.getElementById('viewer');
            if (viewer) {
                viewer.addEventListener('touchstart', function(e) {
                    touchStartX = e.changedTouches[0].screenX;
                });

                viewer.addEventListener('touchend', function(e) {
                    touchEndX = e.changedTouches[0].screenX;
                    handleSwipe();
                });
            }

            function handleSwipe() {
                const swipeThreshold = 50;
                const diff = touchStartX - touchEndX;
                
                if (Math.abs(diff) > swipeThreshold && book) {
                    if (diff > 0) {
                        // Swipe left - next page
                        book.nextPage();
                    } else {
                        // Swipe right - previous page
                        book.prevPage();
                    }
                }
            }
        }
        
        // Wait for all libraries to load
        function waitForLibraries() {
            const maxWaitTime = 10000; // 10 seconds
            const startTime = Date.now();
            
            function check() {
                if (typeof JSZip !== 'undefined' && typeof ePub !== 'undefined') {
                    console.log('All libraries loaded, initializing EPUB viewer...');
                    initEpubViewer();
                    return;
                }
                
                if (Date.now() - startTime > maxWaitTime) {
                    showError('Libraries failed to load within timeout period');
                    return;
                }
                
                setTimeout(check, 100);
            }
            
            check();
        }
        
        // Start when page loads
        document.addEventListener('DOMContentLoaded', function() {
            console.log('DOM loaded, waiting for libraries...');
            waitForLibraries();
        });

        // Alternative initialization if DOM is already loaded
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            waitForLibraries();
        }

        // Send ready message to React Native
        if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'ready',
                message: 'WebView is ready'
            }));
        }
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
      } else if (data.type === 'loaded') {
        console.log('EPUB loaded successfully');
      }
    } catch (error) {
      console.log('WebView message (raw):', event.nativeEvent.data);
    }
  };

  const handleWebViewError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.warn('WebView error: ', nativeEvent);
  };

  const handleLoadEnd = () => {
    console.log('WebView load completed');
  };

  React.useEffect(() => {
    if (base64Epub && base64Epub !== cachedEpub) {
      setCachedEpub(base64Epub);
      setKey(prev => prev + 1);
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
      <WebView
        key={key}
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        onError={handleWebViewError}
        onLoadEnd={handleLoadEnd}
        onMessage={handleWebViewMessage}
        renderLoading={() => (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Initializing EPUB Reader...</Text>
          </View>
        )}
        allowFileAccess={true}
        mixedContentMode="compatibility"
        originWhitelist={['*']}
        allowsInlineMediaPlayback={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'pink',
    padding:10,
  },
  webview: {
    flex: 1,
  },
  loader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
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