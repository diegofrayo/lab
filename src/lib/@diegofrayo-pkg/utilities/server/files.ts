import * as fs from "fs";
import path from "path";
import { isArrayBufferView } from "util/types";

import { isArray, isBoolean } from "../../validator";

export function writeFile(filePath: string, content: unknown): void {
	createOutputFolder(filePath);
	fs.writeFileSync(
		filePath,
		typeof content === "string" || isArrayBufferView(content) ? content : JSON.stringify(content),
	);
}

export function readFile(filePath: string): string;
export function readFile(filePath: string, type: "blob"): Buffer;
export function readFile<JSON>(filePath: string, type: "json"): JSON;
export function readFile(filePath: string, type?: unknown): string | Buffer | JSON {
	if (type === "blob") {
		return fs.readFileSync(filePath) as Buffer;
	}

	if (type === "json") {
		return JSON.parse(fs.readFileSync(filePath).toString().trimEnd()) as JSON;
	}

	return fs.readFileSync(filePath).toString().trimEnd();
}

export function copyFolder(sourcePath: string, targetPath: string): void {
	if (!isDirectory(sourcePath)) return;

	const targetFolderPath = path.resolve(targetPath, getBasename(sourcePath));
	createOutputFolder(targetFolderPath);

	fs.readdirSync(sourcePath).forEach((fileName) => {
		const filePath = path.resolve(sourcePath, fileName);

		if (isDirectory(filePath)) {
			copyFolder(filePath, targetPath);
		} else {
			copyFile(filePath, { outputFolderPath: targetFolderPath });
		}
	});
}

export function copyFile(
	sourcePath: string,
	opts: { outputFolderPath: string; outputFileName?: string },
): void {
	createOutputFolder(opts.outputFolderPath, { isDirectory: true });

	fs.copyFileSync(
		sourcePath,
		path.resolve(opts.outputFolderPath, opts.outputFileName || getBasename(sourcePath)),
	);
}

export function createFolder(outputFolderPath: string): void {
	fs.mkdirSync(outputFolderPath, { recursive: true });
}

export function fileExists(sourcePath: string): boolean {
	return fs.existsSync(sourcePath);
}

export function renameFile(
	currentFilePath: string,
	opts: { newFilePath?: string; newFileName: string },
): void {
	if (opts.newFilePath) {
		createOutputFolder(opts.newFilePath, { isDirectory: true });
		fs.renameSync(currentFilePath, path.resolve(opts.newFilePath, opts.newFileName));
	} else {
		fs.renameSync(
			currentFilePath,
			path.resolve(getParentFolderPath(currentFilePath), opts.newFileName),
		);
	}
}

export function isMediaFile(extension: string): boolean {
	return (
		isImageFile(extension) || ["heic", "mp4", "mov", "avi", "wmv"].includes(extension.toLowerCase())
	);
}

export function isImageFile(extension: string): boolean {
	return ["jpg", "jpeg", "png", "gif", "webp", "avif"].includes(extension.toLowerCase());
}

export function isDirectory(sourcePath: string): boolean {
	return fs.lstatSync(sourcePath).isDirectory();
}

export function isHiddenPath(path: string): boolean {
	return /(^|\/)\.[^/.]/g.test(path);
}

// NOTE: Needed to ensure compatibility with Windows OS
export function normaliceSlashes(winPath: string): string {
	return winPath.replace(/\\/g, "/");
}

export function createOutputFolder(outputPath: string, opts?: { isDirectory?: boolean }): void {
	const folderPath = opts?.isDirectory ? outputPath : getParentFolderPath(outputPath);

	if (!fileExists(folderPath)) {
		createFolder(folderPath);
	}
}

export function setFileModifiedDate(filePath: string, fileStats: CustomFile["stats"]): void {
	/*
  console.log(
    new Date(fileStats.atimeMs),
    new Date(fileStats.birthtimeMs),
    new Date(fileStats.ctimeMs),
    new Date(fileStats.mtimeMs),
    new Date(),
  );
  */

	fs.utimesSync(filePath, new Date(fileStats.mtimeMs), new Date()); // For iOS
	// fs.utimesSync(filePath, new Date(), new Date(fileStats.mtimeMs)); // For WINDOWS
}

export function deleteFolder(folderPath: string): void {
	fs.rmSync(folderPath, { recursive: true, force: true });
}

export function deleteFile(filePath: string): void {
	fs.rmSync(filePath);
}

/**
 * @param sourcePath: "/Users/diegofrayo/Downloads/Fotos/image.jpg"
 * @returns "/Users/diegofrayo/Downloads/Fotos"
 */
export function getParentFolderPath(sourcePath: string): string {
	return path.dirname(sourcePath);
}

/**
 * @param sourcePath: "/Users/diegofrayo/Downloads/Fotos/image.jpg"
 * @returns "image.jpg"
 */
export function getBasename(sourcePath: string): string {
	return path.basename(sourcePath);
}

/**
 * @param filePath: "src/scripts/blog/images/1.jpg"
 * @param rootFolderPath: "src/scripts/blog"
 * @returns "images/1.jpg"
 */
export function getRelativePathFromRootFolder(filePath: string, rootFolderPath: string): string {
	return filePath.replace(rootFolderPath, "").substring(1);
}

/**
 * @param filePath: "src/scripts/blog/images/1.jpg"
 * @param foldersName: ["scripts", "blog"]
 * @returns "src/images/1.jpg"
 */
export function removeFoldersFromPath(filePath: string, foldersName: string[]): string {
	return filePath
		.split("/")
		.filter((folderName) => !foldersName.includes(folderName))
		.join("/");
}

export function getOS(): "Linux" | "MacOS" | "Windows" {
	const opsys = process.platform;
	let output;

	if (opsys === "darwin") {
		output = "MacOS" as const;
	} else if (opsys === "win32") {
		output = "Windows" as const;
	} else if (opsys === "linux") {
		output = "Linux" as const;
	} else {
		throw new Error(`Invalid sysos: ${opsys}`);
	}

	return output;
}

export function jsonToBlob(object: Record<string, unknown> | Array<unknown>): Blob {
	const str = JSON.stringify(object);
	const bytes = new TextEncoder().encode(str);
	const blob = new Blob([bytes], {
		type: "application/json;charset=utf-8",
	});

	return blob;
}

export function checkIsDirectory(sourcePath: string): boolean {
	const stats = fs.statSync(sourcePath);
	return stats.isDirectory();
}

interface IncludeTheseExtensionsConfig {
	includeDirectories?: boolean;
	recursive?: boolean;
	includeTheseExtensions: string[];
	includeMediaFiles?: never;
	includeImages?: never;
}

interface IncludeMediaFilesConfig {
	includeDirectories?: boolean;
	recursive?: boolean;
	includeTheseExtensions?: never;
	includeMediaFiles: true;
	includeImages?: never;
}

interface IncludeImagesFilesConfig {
	includeDirectories?: boolean;
	recursive?: boolean;
	includeTheseExtensions?: never;
	includeMediaFiles?: never;
	includeImages?: true;
}

type ReadFolderFilesOpts =
	| IncludeTheseExtensionsConfig
	| IncludeMediaFilesConfig
	| IncludeImagesFilesConfig;

export function readFolderFiles(
	sourceFolderPath: string,
	opts?: ReadFolderFilesOpts,
): CustomFile[] {
	return fs.readdirSync(sourceFolderPath).reduce((result: CustomFile[], fileName: string) => {
		const file = new CustomFile(sourceFolderPath, fileName);

		if (opts?.recursive && file.isDirectory) {
			return [
				...result,
				...(opts.includeDirectories ? [file] : []),
				...readFolderFiles(file.path, opts),
			];
		}

		if (
			!opts ||
			(opts.includeDirectories && file.isDirectory) ||
			(isBoolean(opts.includeMediaFiles) && isMediaFile(file.ext)) ||
			(isBoolean(opts.includeImages) && isImageFile(file.ext)) ||
			(isArray(opts.includeTheseExtensions) && opts.includeTheseExtensions.includes(file.ext))
		) {
			return result.concat([file]);
		}

		return result;
	}, []);
}

export class CustomFile {
	path: string;
	name: string;
	baseName: string;
	ext: string;
	stats: fs.Stats;
	isDirectory: boolean;
	parentFolderPath: string;
	parentFolderName: string;

	constructor(sourceFolderPath: string, fileName: string) {
		const sourcePath = path.resolve(sourceFolderPath, fileName);
		const stats = fs.statSync(sourcePath);
		const { ext, name } = path.parse(sourcePath);
		const parentFolderPath = getParentFolderPath(sourcePath);

		this.path = sourcePath;
		this.name = `${name}${ext.toLowerCase()}`;
		this.baseName = name;
		this.ext = ext.toLowerCase().slice(1);
		this.stats = stats;
		this.isDirectory = stats.isDirectory();
		this.parentFolderPath = parentFolderPath;
		this.parentFolderName = getBasename(parentFolderPath);
	}
}
