// components/Common/Header.tsx
// Componente de header reutilizável para todas as páginas

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
}

interface HeaderProps {
  title: string;
  subtitle?: string;
}

// Itens de navegação
const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/workers', label: 'Funcionários' },
  { href: '/services', label: 'Serviços' },
  { href: '/authorizations', label: 'Autorizações' },
  { href: '/relatorios', label: 'Relatórios' },
];

export default function Header({ title, subtitle }: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Título */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>

          {/* Navegação */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Menu mobile (simplificado) */}
          <nav className="flex md:hidden items-center gap-2">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-purple-600 text-sm"
            >
              Menu
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
