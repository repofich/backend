import { router } from '@inertiajs/react';

export default function BackButton({ href }) {
  const handleClick = () => {
    if (href) {
      router.visit(href);
    } else {
      window.history.back();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="mb-4 bg-primary text-text-on-primary border-none px-5 h-[40px] rounded-[10px] text-sm cursor-pointer hover:bg-primary-light transition-colors"
    >
      Volver
    </button>
  );
}
