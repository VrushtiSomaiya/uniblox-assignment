type PageHeaderProps = {
  title: string;
  subtitle?: string;
};

export const PageHeader = ({ title, subtitle }: PageHeaderProps) => (
  <header className="page-header">
    <h1 className="page-title">{title}</h1>
    {subtitle && <p className="page-subtitle">{subtitle}</p>}
  </header>
);
