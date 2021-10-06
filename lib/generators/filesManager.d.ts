export declare class FilesManager {
    private baseDir;
    eslinttrcPath: string;
    prettierConfig: {};
    constructor(baseDir: string, eslinttrcPath: string);
    private initPath;
    regenerate(files: {}): Promise<void>;
    generateFiles(files: Record<string, string> | string, dir?: string): Promise<void>;
    formatFile(code: string, name?: string): any;
}
