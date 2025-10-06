import React from 'react';
import { WebView } from 'react-native-webview';

const EpubWebView = ({ base64Epub }) => {
    console.log("Base64 EPUB length:", base64Epub.length, base64Epub.slice(0, 100)); // Log first 100 chars for verification
    
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <script src="https://unpkg.com/epubjs/dist/epub.min.js"></script>
        <style>
          html, body { margin:0; padding:0; height:100%; }
          #viewer { width:100%; height:100%; }
        </style>
      </head>
      <body>
        <div id="viewer"></div>
        <script>
          (function() {
            const base64 = "${base64Epub}";
            const binary = atob(base64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
              bytes[i] = binary.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: 'application/epub+zip' });
            const url = URL.createObjectURL(blob);

            const book = ePub(url);
            const rendition = book.renderTo("viewer", {
              width: "100%",
              height: "100%",
              flow: "paginated"
            });
            rendition.display();
          })();
        </script>
      </body>
    </html>
  `;

  return (
    <WebView
      originWhitelist={['*']}
      source={{ html: htmlContent }}
      javaScriptEnabled
      domStorageEnabled
      allowFileAccess
      allowUniversalAccessFromFileURLs
      style={{ flex: 1 }}
    />
  );
};

export default EpubWebView;
