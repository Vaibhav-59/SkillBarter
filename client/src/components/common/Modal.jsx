import { Fragment, useContext } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { ThemeContext } from "../../contexts/ThemeContext";

export default function Modal({ isOpen, onClose, title, children, size = "md" }) {
  const { theme } = useContext(ThemeContext) || { theme: "dark" };
  const d = theme === "dark";

  const sizeClasses = {
    sm:   "max-w-sm",
    md:   "max-w-md",
    lg:   "max-w-2xl",
    xl:   "max-w-4xl",
    full: "max-w-full mx-4",
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>

        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-150"  leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className={`fixed inset-0 backdrop-blur-sm ${d ? "bg-black/65" : "bg-slate-900/40"}`} />
        </Transition.Child>

        {/* Panel */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"  leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className={`
                w-full ${sizeClasses[size] || sizeClasses.md}
                transform overflow-hidden rounded-2xl p-6 text-left
                shadow-2xl transition-all max-h-[90vh] flex flex-col
                relative
                ${d
                  ? "bg-[#0d1525] border border-indigo-500/20 shadow-indigo-500/10"
                  : "bg-white border border-indigo-100 shadow-indigo-100/60"
                }
              `}>
                {/* top accent line */}
                <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent pointer-events-none" />

                {/* Header */}
                {title && (
                  <div className="flex items-center justify-between mb-5 flex-shrink-0">
                    <Dialog.Title className={`text-xl font-bold ${d ? "text-white" : "text-slate-800"}`}>
                      {title}
                    </Dialog.Title>
                    <button
                      onClick={onClose}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
                        d
                          ? "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                          : "bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Scrollable content */}
                <div className="overflow-y-auto flex-1">
                  {children}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
