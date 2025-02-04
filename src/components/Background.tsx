function Background() {
  return (
    <div
      className="fixed top-0 left-0 right-0 bottom-0 w-full h-full
              flex flex-col items-center justify-center
              bg-transparent text-black dark:text-white
              opacity-10 select-none z-0"
    >
      <h1 className="text-3xl md:text-5xl">💌 LUV NOTE</h1>
      <p className="text-md md:text-xl">
        A fully decentralised LUV NFT note-taking app
      </p>
    </div>
  );
}

export default Background;
