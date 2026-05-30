/**
 * Cloudinary configuration and upload helpers.
 */
declare function isDataUriImage(value?: string): boolean;
interface UploadOptions {
    folder?: string;
    timeoutMs?: number;
}
interface UploadResult {
    url: string;
    publicId: string;
}
declare function uploadImageToCloudinary(file: string, options?: UploadOptions): Promise<UploadResult>;
export { isDataUriImage, uploadImageToCloudinary };
//# sourceMappingURL=cloudinary.d.ts.map