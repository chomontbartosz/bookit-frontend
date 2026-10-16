import { LanguageSwitcher } from './LanguageSwitcher';

export function Header() {
  return (
    <header className="card-header">
      <h1 className="logo">
        Book<span className="logo-accent">.it</span>
      </h1>
      <LanguageSwitcher />
    </header>
  );
}
