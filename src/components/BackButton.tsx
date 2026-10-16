import type { ReactNode } from 'react';
import { ArrowLeft } from './icons';

export function BackButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" className="link-back" onClick={onClick}>
      <ArrowLeft /> {children}
    </button>
  );
}
