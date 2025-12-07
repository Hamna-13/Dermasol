interface StatCardProps {
  value: string;
  label: string;
  description?: string;
}

const StatCard = ({ value, label, description }: StatCardProps) => {
  return (
    <div className="text-center p-6 bg-accent rounded-lg border border-border">
      <div className="text-4xl font-bold text-primary mb-2">{value}</div>
      <div className="text-lg font-semibold text-foreground mb-1">{label}</div>
      {description && (
        <div className="text-sm text-muted-foreground">{description}</div>
      )}
    </div>
  );
};

export default StatCard;
