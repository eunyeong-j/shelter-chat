import React from "react";

export const BackgroundVideo: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden">
      {/* <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute min-w-full min-h-full object-cover"
      >
        <source src="/bg-video2.mp4#t=0.1" type="video/mp4" />
        Your browser does not support the video tag.
      </video> */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/30" />
    </div>
  );
};
