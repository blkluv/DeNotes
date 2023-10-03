import React from "react";

function Background() {
  return (
    <div
      className="fixed top-0 left-0 right-0 bottom-0 w-full h-full
              flex flex-col items-center justify-center
              bg-transparent text-black dark:text-light-primary
              opacity-20 select-none z-0"
    >
      <h1 className="text-6xl">DeNotes</h1>
      <p className="text-xl">A fully decentralised note-taking app</p>
    </div>
  );
}

export default Background;
