// @ts-nocheck
import React from "react";
import BaseModal from "@/src/components/shared/modal/BaseModal";

type Product = {
  name: string;
  steps: string[];
  currentStep: number;
};

type Order = {
  id: string;
  products: Product[];
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
};

export default function OrderProgressBarModal({ isOpen, onClose, order }: Props) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`คำสั่งซื้อ ${order.id}`}
      description="แสดงความคืบหน้าในการผลิตแต่ละสินค้า"
      size="lg"
      ariaLabel={`ความคืบหน้าการผลิตคำสั่งซื้อ ${order.id}`}
      footer={
        <button
          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition"
          onClick={onClose}
        >
          close
        </button>
      }
    >
      <div className="space-y-6">
        {order.products.map((product, idx) => {
          const totalSteps = product.steps.length;
          const currentStepIndex = Math.min(product.currentStep, totalSteps - 1);

          // Handle edge case: only 1 step
          const progressPercent =
            totalSteps === 1 ? 100 : Math.round((currentStepIndex / (totalSteps - 1)) * 100);
          const currentStepName = product.steps[currentStepIndex];

          return (
            <div key={idx} className="bg-slate-50 dark:bg-slate-800 p-5 rounded-xl shadow">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-slate-800 dark:text-white">{product.name}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {progressPercent}% - {currentStepName}
                </span>
              </div>

              {/* Stepper */}
              <div className="flex items-center overflow-x-auto space-x-4">
                {product.steps.map((step, stepIdx) => {
                  const isCompleted = stepIdx < currentStepIndex;
                  const isCurrent = stepIdx === currentStepIndex;

                  return (
                    <div key={stepIdx} className="flex items-center min-w-fit">
                      {/* Step circle */}
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full border-2
                          ${
                            isCompleted
                              ? "bg-green-500 border-green-500 text-white"
                              : isCurrent
                              ? "border-indigo-600 text-indigo-600 font-semibold bg-white dark:bg-slate-800"
                              : "border-gray-300 dark:border-gray-600 text-gray-400 bg-white dark:bg-slate-800"
                          }`}
                      >
                        {isCompleted ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          stepIdx + 1
                        )}
                      </div>

                      {/* Step name */}
                      <div
                        className={`ml-2 text-sm whitespace-nowrap select-none ${
                          isCurrent
                            ? "text-indigo-600 font-semibold"
                            : isCompleted
                            ? "text-green-600"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      >
                        {step}
                      </div>

                      {/* Connector */}
                      {stepIdx < totalSteps - 1 && (
                        <div
                          className={`h-0.5 w-6 mx-2 rounded ${
                            isCompleted
                              ? "bg-green-500"
                              : isCurrent
                              ? "bg-indigo-300 dark:bg-indigo-700"
                              : "bg-gray-300 dark:bg-gray-600"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </BaseModal>
  );
}
