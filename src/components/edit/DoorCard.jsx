"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import getYouTubeID from "get-youtube-id";
import getThumbnailUrl from "@/utils/getThumbnailUrl";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import FormContext from "../contextProviders/FormContext";
import EditContentForm from "../forms/EditContentForm";
import { deleteDoor } from "@/app/_actions";
import Modal from "../Modal";

export default function DoorCard({ door, isOpen, onMenuToggle }) {
    const formRef = useRef(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const youtubeThumbnail = door.youtubeVideoUrl
        ? getThumbnailUrl(getYouTubeID(door.youtubeVideoUrl), "mq")
        : null;

    const handleMenuToggle = () => {
        onMenuToggle(door._id);
    };

    return (
        <div className="border border-gray-200 rounded-lg shadow-lg relative">
            {/* Header */}
            <div className="flex justify-between items-center border-b px-4 py-2">
                <h2 className="text-base text-indigo-600 font-semibold">
                    {door.name}
                </h2>
                <button onClick={handleMenuToggle}>
                    <EllipsisHorizontalIcon className="h-5 w-5" />
                </button>
                {isOpen && (
                    <FormContext.Provider
                        value={{ formRef, setIsModalOpen, setIsLoading }}
                    >
                        <div className="absolute right-4 top-8 py-1 w-30 bg-white rounded-md shadow-xl z-10 border border-gray-100 divide divide-y divide-gray-200">
                            <EditContentButton
                                onButtonClick={() => {
                                    setIsModalOpen(true);
                                }}
                            />
                            <DeleteButton
                                onButtonClick={() => {
                                    deleteDoor(door._id);
                                }}
                            />
                            <Modal
                                isOpen={isModalOpen}
                                title={`${door.name} - Edit Content`}
                                ModalContent={<EditContentForm door={door} />}
                                confirmLabel="Save"
                                isConfirmButtonDisabled={isLoading}
                            />
                        </div>
                    </FormContext.Provider>
                )}
            </div>

            {/* Card Content */}
            <div className="p-4 text-sm space-y-2">
                {/* Door Date */}
                <div className="flex space-x-2">
                    <span className="font-semibold">Door Date:</span>
                    <span>
                        {new Date(door.date).toLocaleString("en-US", {
                            timeZone: "America/New_York",
                        })}
                    </span>
                </div>

                {/* Message */}
                <div className="flex space-x-2 truncate">
                    <span className="font-semibold">Message:</span>
                    <span>{getFirstWords(door.message, 15)}</span>
                </div>

                {/* Content Image */}
                <div>
                    <span className="font-semibold">Content Image:</span>
                    {door.contentImage?.fileUrl ? (
                        <div className="relative mt-1 flex items-center justify-center shadow-md w-[250px] h-[125px]">
                            <Image
                                src={door.contentImage.fileUrl}
                                alt="Content Image"
                                fill
                                className="object-cover"
                            />
                        </div>
                    ) : (
                        <div className="p-4 mt-1 relative shadow-md w-[250px] h-[125px] flex items-center justify-center text-gray-400">
                            No Image
                        </div>
                    )}
                </div>

                {/* YouTube Thumbnail */}
                <div>
                    <span className="font-semibold">
                        Youtube Video Thumbnail:
                    </span>
                    {youtubeThumbnail ? (
                        <div className="relative mt-1 flex items-center justify-center shadow-md w-[250px] h-[125px]">
                            <Image
                                src={youtubeThumbnail}
                                alt="Youtube Video Thumbnail"
                                fill
                                className="object-cover"
                            />
                        </div>
                    ) : (
                        <div className="p-4 mt-1 relative shadow-md w-[250px] h-[125px] flex items-center justify-center text-gray-400">
                            No Video
                        </div>
                    )}
                </div>

                {/* Closed Door Image */}
                <div>
                    <span className="font-semibold">Closed Door Image:</span>
                    {door.closedDoorImage?.fileUrl ? (
                        <div className="relative mt-1 flex items-center justify-center shadow-md w-[250px] h-[125px]">
                            <Image
                                src={door.closedDoorImage.fileUrl}
                                alt="Closed Door Image"
                                fill
                                className="object-cover"
                            />
                        </div>
                    ) : (
                        <div className="p-4 mt-1 relative shadow-md w-[250px] h-[125px] flex items-center justify-center text-gray-400">
                            No Image
                        </div>
                    )}
                </div>

                {/* Closed Door Color */}
                <div className="flex space-x-4">
                    <span className="font-semibold">Closed Door Color:</span>
                    <div
                        className="w-5 h-5 rounded-full border"
                        style={{ backgroundColor: door.closedDoorColor }}
                    ></div>
                </div>

                {/* Message */}
                <div className="flex space-x-2">
                    <span className="font-semibold">Closed Door Text: </span>
                    <span>{door.closedDoorText}</span>
                </div>

                {/* Closed Door Text Color */}
                <div className="flex space-x-4">
                    <span className="font-semibold">
                        Closed Door Text Color:
                    </span>
                    <div
                        className="w-5 h-5 rounded-full border"
                        style={{ backgroundColor: door.closedDoorTextColor }}
                    ></div>
                </div>

                {/* Door Auto Open Time */}
                <div className="flex space-x-2">
                    <span className="font-semibold">Auto Open Time: </span>
                    <span>
                        {door.autoOpenTime
                            ? new Date(door.autoOpenTime).toLocaleString(
                                  "en-US",
                                  { timeZone: "America/New_York" }
                              )
                            : "Not Set"}
                    </span>
                </div>
            </div>
        </div>
    );
}

function EditContentButton({ onButtonClick }) {
    return (
        <button
            onClick={onButtonClick}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-indigo-500/25"
        >
            Edit Content
        </button>
    );
}

function DeleteButton({ onButtonClick }) {
    return (
        <button
            onClick={onButtonClick}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-indigo-500/25"
        >
            Delete
        </button>
    );
}

function getFirstWords(html, count = 5) {
    const textContent = html.replace(/<\/?[^>]+(>|$)/g, ""); // Remove HTML tags
    return textContent.split(/\s+/).slice(0, count).join(" ") + "...";
}
