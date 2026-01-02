import { bytesToSize, isImageMime } from "../lib/utils";
import { FileMeta } from "../types";

export default function FilePreview({ file }: { file: FileMeta }) {
    if (isImageMime(file.mime)) {
        return (
            <div className="mt-1 max-w-xs">
                <img
                    src={file.url}
                    alt={file.name}
                    className="rounded max-h-48 object-contain border border-zinc-600"
                />
                <a
                    href={file.url}
                    download={file.name}
                    className="text-xs text-indigo-300 hover:underline block mt-1"
                >
                    ↓ {file.name} ({bytesToSize(file.size)})
                </a>
            </div>
        );
    }

    return (
        <a
            href={file.url}
            download={file.name}
            className="flex items-center gap-2 text-indigo-300 hover:underline"
        >
            📎 {file.name} ({bytesToSize(file.size)})
        </a>
    );
}