// SERVLY Builder Primitive types
export type BuilderContainerTypes = "container" | "containers-flex" | "containers-grid"
export type ServlyBuilderTypes = BuilderContainerTypes | "text" | "icon" | "divider"

// Allowed extensions per media type
export type ImageExtensions = "jpg" | "jpeg" | "png" | "gif" | "svg" | "webp";
export type AudioExtensions = "mp3" | "wav" | "ogg" | "aac" | "flac";
export type VideoExtensions = "mp4" | "webm" | "ogg" | "avi" | "mov";
export type DocumentExtensions = "serv" | "json" | "pdf" | "doc" | "docx" | "xls" | "xlsx" | "ppt" | "pptx" | "txt" | "rtf";

// Media type as a union of strings.
export type MediaType = "images" | "audio" | "video" | "document";

// A union type for all allowed extensions.
export type MediaExtension =
    | ImageExtensions
    | AudioExtensions
    | VideoExtensions
    | DocumentExtensions;