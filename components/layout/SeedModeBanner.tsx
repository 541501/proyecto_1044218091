'use client';

export const SeedModeBanner: React.FC = () => (
  <div className="w-full px-4 py-3 text-center border-b" style={{ backgroundColor: 'var(--seed-bg)', borderColor: 'var(--seed-border)', color: 'var(--seed-text)' }}>
    <p className="text-sm font-medium">
      🌱 Modo desarrollo (sin base de datos). Accede a{' '}
      <a href="/admin/db-setup" className="font-semibold underline hover:no-underline">
        /admin/db-setup
      </a>{' '}
      para ejecutar el bootstrap.
    </p>
  </div>
);
