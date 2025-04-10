interface HamburgerButtonProps {
  onClick: () => void;
  visible: boolean;
}

export const HamburgerButton = ({ onClick, visible }: HamburgerButtonProps) => {
  if (!visible) {
    return null;
  }

  return (
    <div className="absolute left-4 bottom-4">
      <button
        onClick={onClick}
        className="bg-white shadow-lg p-3 rounded-2xl focus:outline-none"
        aria-label="Toggle legend"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6.6665 5H17.4998" stroke="#0F172A" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M6.6665 10H17.4998" stroke="#0F172A" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M6.6665 15H17.4998" stroke="#0F172A" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M2.5 5H2.50833" stroke="#0F172A" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M2.5 10H2.50833" stroke="#0F172A" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M2.5 15H2.50833" stroke="#0F172A" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>
  );
};
