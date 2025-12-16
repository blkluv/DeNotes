import ThemeButton from "./ThemeButton";

type HeaderPropsType = {
  items?: React.ReactNode;
};

function Header({ items = <></> }: HeaderPropsType) {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-10 transition-all bg-light-primary text-dark-primary dark:bg-dark-primary dark:text-light-primary"
    >
      <div
        className="container flex items-center justify-between px-5 py-2 mx-auto sm:px-11"
      >
        <h1 className="text-4xl outline-none select-none">📘 NoteVisor</h1>
        <div className="flex items-center justify-center gap-1 sm:gap-3">
          {items}
          <ThemeButton />
        </div>
      </div>
    </div>
  );
}

export default Header;
