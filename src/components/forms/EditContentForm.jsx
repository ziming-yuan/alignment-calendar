import React, { useState } from "react";
import { useContext } from "react";
import FormContext from "../contextProviders/FormContext";
import TipTap from "@/components/rte/TipTap";
import { useForm, Controller } from "react-hook-form";
import { updateDoorContent } from "@/app/_actions";
import Dropzone from "@/components/Dropzone";
import { utcToZonedTime, format } from "date-fns-tz";

const formatDate = (dateString) => {
    // Convert the UTC date string to a Date object in the EST timezone
    const estDate = utcToZonedTime(new Date(dateString), "America/New_York");

    // Format the date in the "YYYY-MM-DDTHH:MM:SS" format
    return format(estDate, "yyyy-MM-dd'T'HH:mm:ss", {
        timeZone: "America/New_York",
    });
};

export default function EditContentForm({ door }) {
    const { formRef, setIsModalOpen, setIsLoading } = useContext(FormContext);
    const [saveError, setSaveError] = useState("");

    const {
        register,
        handleSubmit,
        watch,
        control,
        formState: { errors },
        setValue,
    } = useForm({
        defaultValues: {
            date: door.date ? formatDate(door.date) : "",
            name: door.name,
            closedDoorText: door.closedDoorText,
            youtubeVideoUrl: door.youtubeVideoUrl,
            message: door.message,
            doorId: door._id,
            closedDoorColor: door.closedDoorColor,
            closedDoorTextColor: door.closedDoorTextColor,
            contentImgKey: door.contentImage && door.contentImage.fileKey,
            contentImageFileUpdated: false,
            contentImageOgFileDeleted: false,
            closedImgKey: door.closedDoorImage && door.closedDoorImage.fileKey,
            closedDoorImageFileUpdated: false,
            closedDoorImageOgFileDeleted: false,
            autoOpenTime: door.autoOpenTime
                ? formatDate(door.autoOpenTime)
                : "",
        },
    });

    const processData = async (data) => {
        setIsLoading(true);
        setSaveError("");
        const imageData = new FormData();
        imageData.append("contentImage", data.contentImage); // file is not serializable unless wrapped inside FormData
        imageData.append("closedDoorImage", data.closedDoorImage);
        data["contentImage"] = "";
        data["closedDoorImage"] = "";
        try {
            await updateDoorContent(data, imageData);
            setIsModalOpen(false);
        } catch {
            setSaveError("Could not save this door. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form ref={formRef} onSubmit={handleSubmit(processData)}>
            {saveError && (
                <p role="alert" className="mb-4 text-sm text-red-600">
                    {saveError}
                </p>
            )}
            {/* Door Name */}
            <div className="relative flex flex-col mb-4 gap-y-2">
                <label className="text-base font-medium">Door Name</label>
                <input
                    type="text"
                    className="flex-grow px-2 py-2 bg-white text-sm rounded border border-gray-300 shadow"
                    {...register("name")}
                />
                <p className="text-sm text-gray-500">
                    Name of the door for your reference.
                </p>
            </div>

            {/* Door Date & Time */}
            <div className="relative flex flex-col mb-4 gap-y-2">
                <label className="text-base font-medium">
                    Door Date & Time
                </label>
                <input
                    type="datetime-local"
                    className="flex-grow px-2 py-2 bg-white text-sm rounded border border-gray-300 shadow"
                    {...register("date")}
                />
                <p className="text-sm text-gray-500">
                    The date and time of the door.
                </p>
            </div>

            {/* Youtube Video */}
            <div className="relative flex flex-col mb-4 gap-y-2">
                <label className="text-base font-medium">
                    Youtube Video URL
                </label>
                <input
                    type="url"
                    className="flex-grow px-2 py-2 bg-white text-sm rounded border border-gray-300 shadow"
                    {...register("youtubeVideoUrl", {
                        pattern:
                            /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/,
                    })}
                />
                <p className="text-sm text-gray-500">
                    Link to Youtube video when door is open.
                </p>
            </div>

            {/* Message */}
            <div className="relative flex flex-col mb-4 gap-y-2">
                <label className="text-base font-medium">Message</label>
                <Controller
                    name="message"
                    control={control}
                    render={({ field }) => (
                        <TipTap
                            onFileChange={field.onChange}
                            initialMessage={field.value}
                        />
                    )}
                />
                <p className="text-sm text-gray-500">
                    The message shown once door is open.
                </p>
            </div>

            {/* Content Image */}
            <div className="relative flex flex-col mb-4 gap-y-2">
                <label className="text-base font-medium" htmlFor="doorImage">
                    Content Image
                </label>
                <Controller
                    name="contentImage"
                    control={control}
                    render={({ field }) => (
                        <Dropzone
                            defaultImageUrl={door.contentImage?.fileUrl || ""}
                            onFileChange={field.onChange}
                            setValue={setValue}
                            name={"contentImage"}
                        />
                    )}
                />

                <p className="text-sm text-gray-500">
                    The image displayed when the door is open.
                </p>
            </div>

            {/* Closed Door Text */}
            <div className="relative flex flex-col mb-4 gap-y-2">
                <label className="text-base font-medium">
                    Closed Door Text
                </label>
                <input
                    type="text"
                    className="flex-grow px-2 py-2 bg-white text-sm rounded border border-gray-300 shadow"
                    {...register("closedDoorText")}
                />
                <p className="text-sm text-gray-500">
                    The text displayed on the door when it&apos;s closed.
                    Default is the date.
                </p>
            </div>

            {/* Closed Door Text Color */}
            <div className="relative flex flex-col mb-4 gap-y-2">
                <label className="text-base font-medium">
                    Closed Door Text Color
                </label>
                <div className="flex items-center ">
                    <input
                        id="closedDoorTextColor"
                        type="color"
                        className="rounded border border-gray-300"
                        {...register("closedDoorTextColor")}
                    />
                    <label
                        htmlFor="closedDoorTextColor"
                        className="ml-3 text-sm"
                    >
                        {watch("closedDoorTextColor")}
                    </label>
                </div>
                <p className="text-sm text-gray-500">
                    The color of the closed-door text.
                </p>
            </div>

            {/* Closed Door Image */}
            <div className="relative flex flex-col mb-4 gap-y-2">
                <label className="text-base font-medium" htmlFor="doorImage">
                    Closed Door Image
                </label>
                <Controller
                    name="closedDoorImage"
                    control={control}
                    render={({ field }) => (
                        <Dropzone
                            defaultImageUrl={
                                door.closedDoorImage?.fileUrl || ""
                            }
                            onFileChange={field.onChange}
                            setValue={setValue}
                            name={"closedDoorImage"}
                        />
                    )}
                />

                <p className="text-sm text-gray-500">
                    The background image displayed once door is closed. Will
                    override closed-door color.
                </p>
            </div>

            {/* Closed Door Color */}
            <div className="relative flex flex-col mb-4 gap-y-2">
                <label className="text-base font-medium">
                    Closed Door Color
                </label>
                <div className="flex items-center">
                    <input
                        id="closedDoorColor"
                        type="color"
                        className="rounded border border-gray-300"
                        {...register("closedDoorColor")}
                    />
                    <label className="ml-3 text-sm" htmlFor="closedDoorColor">
                        {watch("closedDoorColor")}
                    </label>
                </div>
                <p className="text-sm text-gray-500">
                    Background color of the door when it is closed.
                </p>
            </div>

            {/* Auto Open Time */}
            <div className="relative flex flex-col mb-4 gap-y-2">
                <label className="text-base font-medium">Auto Open Time</label>
                <input
                    type="datetime-local"
                    className="flex-grow px-2 py-2 bg-white text-sm rounded border border-gray-300 shadow"
                    {...register("autoOpenTime")}
                />
                <p className="text-sm text-gray-500">
                    When the door automatically opens.
                </p>
            </div>

            {/* Error message */}
            {errors.youtubeVideoUrl && (
                <div className="bg-red-500 text-white w-fit text-sm py-1 px-3 rounded-md mt-2">
                    Please enter a valid YouTube URL.
                </div>
            )}
        </form>
    );
}
