"use client";
import { useRef, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import UploadIcon from "/components/icons/Upload.svg";
import Image from "next/image";

export default function MyForm({ defaultImageUrl = null }) {
    const fileInputRef = useRef(null);
    const [isDragActive, setIsDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState(
        defaultImageUrl ? { url: defaultImageUrl, isDefault: true } : null
    );
    const [fileSizeError, setFileSizeError] = useState(null);
    const [isFileUpdate, setIsFileUpdate] = useState(false);
    const [deleteOgFile, setDeleteOgFile] = useState(false);

    const handleFileChange = (file) => {
        if (file && file.size > 8 * 1024 * 1024) {
            setFileSizeError("File size exceeds the 8MB limit.");
            setSelectedFile(null);
        } else {
            if (selectedFile && selectedFile.isDefault) {
                setDeleteOgFile(true);
            }
            setFileSizeError(null);
            setSelectedFile(file);
            setIsFileUpdate(true);
        }
    };

    const removeFile = () => {
        if (selectedFile.isDefault) {
            setSelectedFile(null);
            setDeleteOgFile(true);
        } else {
            setSelectedFile(null);
            setFileSizeError(null); // optionally reset any errors
            fileInputRef.current.value = ""; // reset the input field
        }
    };

    const handleStyledDivClick = () => {
        fileInputRef.current.click();
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const handleDragEnter = (event) => {
        event.preventDefault();
        setIsDragActive(true);
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        setIsDragActive(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragActive(false);

        if (event.dataTransfer.items) {
            if (event.dataTransfer.items[0].kind === "file") {
                const file = event.dataTransfer.items[0].getAsFile();
                fileInputRef.current.files = event.dataTransfer.files;
                handleFileChange(file);
            }
        }
    };

    return (
        <>
            <input
                ref={fileInputRef}
                name="file"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleFileChange(e.target.files[0])}
            />
            <input type="hidden" name="fileSizeError" value={fileSizeError} />
            <input type="hidden" name="isFileUpdate" value={isFileUpdate} />
            <input type="hidden" name="deleteOgFile" value={deleteOgFile} />
            <div
                role="presentation"
                className={`flex flex-col items-center justify-center rounded-lg gap-2 border border-dashed border-gray-900/25 p-4 ${
                    isDragActive && "bg-indigo-300/25"
                }`}
                onClick={handleStyledDivClick}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className="flex justify-center">
                    <UploadIcon className="h-12 w-12 text-gray-400" />
                </div>
                {isDragActive ? (
                    <p className="font-semibold text-indigo-600">
                        {" "}
                        Drop the files here ...
                    </p>
                ) : (
                    <p className="font-semibold text-indigo-600 hover:text-indigo-500 ">
                        Choose files or drag and drop
                    </p>
                )}
                <div class="text-xs leading-5 text-gray-600">
                    Images up to 8MB, max 1
                </div>
            </div>
            {selectedFile && selectedFile.name && (
                <div className="mt-2 text-sm">{selectedFile.name}</div>
            )}
            {selectedFile && (
                <div className="relative mt-2 h-fit w-fit rounded-md shadow-lg">
                    {selectedFile.isDefault ? (
                        <Image
                            src={selectedFile.url}
                            alt="Default Image"
                            width={200}
                            height={150}
                            className="object-contain rounded-md"
                        />
                    ) : (
                        <Image
                            src={URL.createObjectURL(selectedFile)}
                            alt={selectedFile.name}
                            width={200}
                            height={150}
                            className="object-contain rounded-md"
                        />
                    )}
                    <button
                        type="button"
                        className="w-6 h-6 border border-rose-400 bg-rose-400 rounded-full flex justify-center items-center absolute -top-3 -right-3 hover:bg-white transition-colors"
                        onClick={removeFile}
                    >
                        <XMarkIcon className="w-5 h-5 fill-white hover:fill-rose-400 transition-colors" />
                    </button>
                </div>
            )}
            {fileSizeError && <p className="text-red-500">{fileSizeError}</p>}
        </>
    );
}
