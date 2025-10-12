"use client";

import React from "react";

type EmptyStateProps = {
  icon?: React.ReactNode;
  title?: string;
  message?: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
};

const EmptyState: React.FC<EmptyStateProps> = ({
  // icon,
  // title = "No data found",
  // message = "Try adding new items to get started.",
  // buttonLabel = "Create New",
  // onButtonClick,
}) => {
  return (
    // <div className="overflow-x-auto rounded-lg border border-white/10 bg-white/5">
      <div className="text-center py-16">
        {/* {icon}
        <h3 className="text-lg font-medium">{title}</h3> */}
         <p className="text-white/70">No records available.</p>

        {/*{onButtonClick && (
          <button
            onClick={onButtonClick}
            className="px-4 py-2 rounded-lg text-white
            bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-500"
          >
            {buttonLabel}
          </button>
        )} */}
      </div>
    // </div>
  );
};

export default EmptyState;
