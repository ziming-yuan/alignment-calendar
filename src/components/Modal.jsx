"use client";
import { Fragment, useRef, useContext } from "react";
import { Dialog, Transition } from "@headlessui/react";
import FormContext from "./contextProviders/FormContext";

export default function Modal({
    isOpen = false,
    title,
    ModalContent,
    confirmLabel,
    isConfirmButtonDisabled = false,
}) {
    const cancelButtonRef = useRef(null);
    const { formRef, setIsModalOpen } = useContext(FormContext);
    const handleButtonClick = () => {
        const form = formRef.current;
        if (form) {
            if (typeof form.requestSubmit === "function") {
                form.requestSubmit();
            } else {
                form.dispatchEvent(new Event("submit", { cancelable: true }));
            }
        }
    };

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog
                as="div"
                className="relative z-10"
                initialFocus={cancelButtonRef}
                onClose={() => {}}
            >
                {/* Transition effects - bg grayed out */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center items-center sm:p-0">
                        {/* Fades in from being transparent and slightly shifted downwards (or scaled down on small screens) to fully opaque and in its natural position (and size).
            Fades out by becoming transparent again and shifting slightly downwards (or scaling down on small screens). */}
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg md:max-w-2xl lg:max-w-3xl">
                                {/* Modal header */}
                                <div className="border-b border-gray-300 px-4 pt-4 pb-3">
                                    <div className="text-center sm:ml-4 sm:text-left">
                                        <Dialog.Title className="text-base text-xl font-semibold text-gray-900">
                                            {title}
                                        </Dialog.Title>
                                    </div>
                                </div>

                                {/* Modal body */}
                                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                    {ModalContent}
                                </div>

                                {/* Modal footer */}
                                <div className="border-t border-gray-300 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                    <button
                                        onClick={handleButtonClick}
                                        type="button"
                                        className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm shadow-sm sm:ml-3 sm:w-auto ${
                                            isConfirmButtonDisabled
                                                ? "bg-indigo-300 cursor-not-allowed opacity-50"
                                                : "bg-indigo-600 hover:bg-indigo-500 text-white"
                                        }`}
                                        disabled={isConfirmButtonDisabled}
                                    >
                                        {isConfirmButtonDisabled
                                            ? "Submitting"
                                            : confirmLabel}
                                    </button>
                                    <button
                                        type="button"
                                        className={`mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-indigo-300 sm:mt-0 sm:w-auto ${
                                            isConfirmButtonDisabled
                                                ? "cursor-not-allowed opacity-50"
                                                : "hover:bg-indigo-50"
                                        }`}
                                        onClick={() => setIsModalOpen(false)}
                                        ref={cancelButtonRef}
                                        disabled={isConfirmButtonDisabled}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
