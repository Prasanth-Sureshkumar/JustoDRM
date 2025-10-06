/**
 * Utility functions for EPUB processing
 */

export class EpubUtils {
  /**
   * Clean HTML content by removing tags and formatting
   */
  static cleanHtmlContent(html) {
    return html
      // Remove script and style tags completely
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      // Remove all HTML tags
      .replace(/<[^>]*>/g, '')
      // Decode HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      // Clean up whitespace
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
  }

  /**
   * Extract text content from XML/HTML while preserving some structure
   */
  static extractTextWithStructure(html) {
    return html
      // Replace block elements with newlines
      .replace(/<\/?(div|p|br|h[1-6]|section|article)[^>]*>/gi, '\n')
      .replace(/<\/?(ul|ol|li)[^>]*>/gi, '\n')
      // Remove all other HTML tags
      .replace(/<[^>]*>/g, '')
      // Decode HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      // Clean up excessive whitespace
      .replace(/[ \t]+/g, ' ')
      .replace(/\n[ \t]+/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  /**
   * Sanitize filename for display
   */
  static sanitizeFilename(filename) {
    return filename
      .replace(/[^\w\s.-]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Extract chapter title from content or generate one
   */
  static extractChapterTitle(content, index) {
    const lines = content.split('\n').slice(0, 10);
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length > 0 && trimmed.length < 100) {
        if (
          trimmed.match(/^(chapter|ch\.|part|section|\d+\.?)/i) || 
          (trimmed.length < 50 && !trimmed.includes('.'))
        ) {
          return trimmed;
        }
      }
    }
    
    return `Chapter ${index + 1}`;
  }

  /**
   * Validate if a file appears to be an EPUB
   */
  static isValidEpubFile(filename) {
    return filename.toLowerCase().endsWith('.epub');
  }

  /**
   * Extract preview text from content
   */
  static getPreviewText(content, maxLength = 200) {
    const cleaned = this.cleanHtmlContent(content);
    if (cleaned.length <= maxLength) {
      return cleaned;
    }
    
    return cleaned.substring(0, maxLength).trim() + '...';
  }

  /**
   * Parse date string from EPUB metadata
   */
  static parseDate(dateString) {
    if (!dateString) return 'Unknown';
    
    try {
      const date = new Date(dateString);
      return date.getFullYear().toString();
    } catch {
      return dateString;
    }
  }

  /**
   * Get reading time estimate
   */
  static estimateReadingTime(content) {
    const words = content.split(/\s+/).length;
    const averageWPM = 200;
    const minutes = Math.ceil(words / averageWPM);
    
    if (minutes < 60) {
      return `${minutes} min read`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m read`;
    }
  }
}

export default EpubUtils;
