import RNFS from 'react-native-fs';
import JSZip from "jszip";

export async function saveDecryptedEpub(bytes, fileName) {
  const path = `${RNFS.DocumentDirectoryPath}/${fileName}.epub`;
  const base64Data = Buffer.from(bytes).toString("base64");
  await RNFS.writeFile(path, base64Data, "base64");
  return path;
}

export async function loadEpub(decryptedBytes) {
  // Pass ArrayBuffer or Uint8Array directly
  const zip = await JSZip.loadAsync(decryptedBytes);

  // Get container.xml
  const containerXml = await zip.file("META-INF/container.xml").async("text");

  const parser = new DOMParser();
  const containerDoc = parser.parseFromString(containerXml, "application/xml");
  const rootfilePath = containerDoc.querySelector("rootfile").getAttribute("full-path");

  // Get OPF file (book structure)
  const opfXml = await zip.file(rootfilePath).async("text");
  const opfDoc = parser.parseFromString(opfXml, "application/xml");

  // Build manifest + spine
  const manifest = {};
  opfDoc.querySelectorAll("item").forEach(item => {
    manifest[item.getAttribute("id")] = item.getAttribute("href");
  });

  const spine = Array.from(opfDoc.querySelectorAll("itemref")).map(item =>
    item.getAttribute("idref")
  );

  return { zip, manifest, spine, opfBasePath: rootfilePath.replace(/[^/]+$/, "") };
}

async function getChapter(zip, manifest, chapterId, basePath) {
  const href = manifest[chapterId];
  if (!href) throw new Error(`Missing chapter for id: ${chapterId}`);
  return await zip.file(basePath + href).async("text");
}



