/**
 * Watermark utilities for content protection
 */

export const DEFAULT_WATERMARK_CONFIG = {
  text: "PROTECTED CONTENT",
  opacity: 0.1,
  fontSize: 48,
  color: "#000000",
  rotation: "-45deg",
};

export const WATERMARK_PRESETS = {
  light: {
    text: "PROTECTED CONTENT",
    opacity: 0.08,
    fontSize: 42,
    color: "#666666",
    rotation: "-45deg",
  },
  medium: {
    text: "PROTECTED CONTENT",
    opacity: 0.15,
    fontSize: 48,
    color: "#333333",
    rotation: "-45deg",
  },
  strong: {
    text: "PROTECTED CONTENT",
    opacity: 0.25,
    fontSize: 54,
    color: "#000000",
    rotation: "-45deg",
  },
  copyright: {
    text: "© CONFIDENTIAL",
    opacity: 0.12,
    fontSize: 40,
    color: "#cc0000",
    rotation: "-30deg",
  },
};

export const createCustomWatermark = (config = {}) => {
  return {
    ...DEFAULT_WATERMARK_CONFIG,
    ...config,
  };
};
