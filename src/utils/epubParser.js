import JSZip from 'jszip';
import { XMLParser } from 'fast-xml-parser';

/**
 * Decodes a Base64 string into a Uint8Array (bytes) using Buffer.
 * This is the most reliable method in a React Native environment.
 * @param {string} base64 - The Base64 string to decode.
 * @returns {Uint8Array} The resulting array of bytes.
 */
export function base64ToBytes(base64) {
    if (typeof Buffer !== 'undefined') {
        const buffer = Buffer.from(base64, 'base64');
        // Return a Uint8Array view of the Buffer's underlying ArrayBuffer
        return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.length);
    }
    // Fallback if Buffer is not globally available (less common in modern RN)
    throw new Error("Base64 decoding failed: Buffer is not available.");
}

/**
 * Extracts clean text content from raw HTML (used for chapter content).
 * @param {string} html - The HTML string of a chapter.
 * @returns {string} The cleaned, truncated text content.
 */
function extractTextFromHtml(html) {
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

    // Truncate content for display readability and performance (adjust limit as needed)
    const limit = 5000;
    if (text.length > limit) {
        text = text.substring(0, limit) + '...\n\n[Content truncated for display]';
    }

    return text;
}

/**
 * Attempts to extract a title from chapter HTML.
 * @param {string} html - The HTML string of a chapter.
 * @returns {string|null} The chapter title.
 */
function extractChapterTitle(html) {
    const titleMatch = html.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/i) ||
        html.match(/<title[^>]*>(.*?)<\/title>/i);

    if (titleMatch) {
        return titleMatch[1].replace(/<[^>]*>/g, '').trim();
    }
    return null;
}

/**
 * Extracts text content from parsed XML/JSON data structure.
 * @param {any} value - The object/string value from fast-xml-parser.
 * @returns {string} The text content.
 */
function extractText(value) {
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
}

/**
 * Parses the EPUB ArrayBuffer to extract metadata and chapters.
 * This is the core function replacing epubjs-rn's functionality.
 * @param {ArrayBuffer} arrayBuffer - The decrypted EPUB file's binary data.
 * @returns {object} The parsed metadata and chapters.
 */
export const parseEpubContent = async (arrayBuffer) => {
    const zip = new JSZip();
    const zipData = await zip.loadAsync(arrayBuffer);
    const parser = new XMLParser({ ignoreAttributes: false });

    // 1. Find the OPF file path from container.xml
    const containerFile = zipData.file('META-INF/container.xml');
    if (!containerFile) throw new Error('Invalid EPUB: container.xml not found');

    const containerXml = await containerFile.async('text');
    const containerData = parser.parse(containerXml);
    const opfPath = containerData.container.rootfiles.rootfile['@_full-path'];
    if (!opfPath) throw new Error('Invalid EPUB: OPF path not found');

    // 2. Parse the OPF file (metadata and spine)
    const opfFile = zipData.file(opfPath);
    if (!opfFile) throw new Error(`OPF file not found: ${opfPath}`);

    const opfXml = await opfFile.async('text');
    const opfData = parser.parse(opfXml);
    const packageData = opfData.package;

    const metadata = {
        title: extractText(packageData.metadata['dc:title']) || 'Unknown Title',
        creator: extractText(packageData.metadata['dc:creator']) || 'Unknown Author',
        // Add more metadata fields as needed
    };

    const manifest = packageData.manifest.item;
    const spine = packageData.spine.itemref;

    // Create lookup map for manifest items
    const manifestMap = Array.isArray(manifest) ?
        manifest.reduce((acc, item) => { acc[item['@_id']] = item; return acc; }, {}) :
        { [manifest['@_id']]: manifest };

    const chapters = [];
    const spineItems = Array.isArray(spine) ? spine : [spine];
    const opfDir = opfPath.substring(0, opfPath.lastIndexOf('/'));

    // 3. Extract Chapter Content
    for (const spineItem of spineItems) {
        const idref = spineItem['@_idref'];
        const manifestItem = manifestMap[idref];

        if (manifestItem && manifestItem['@_media-type'].includes('html')) {
            const href = manifestItem['@_href'];
            const fullPath = opfDir ? `${opfDir}/${href}` : href;

            try {
                const chapterFile = zipData.file(fullPath);
                if (chapterFile) {
                    const chapterXml = await chapterFile.async('text');
                    const textContent = extractTextFromHtml(chapterXml);
                    const chapterTitle = extractChapterTitle(chapterXml) || `Chapter ${chapters.length + 1}`;

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

    if (chapters.length === 0) throw new Error('No readable XHTML chapters found in EPUB');

    return { metadata, chapters };
};