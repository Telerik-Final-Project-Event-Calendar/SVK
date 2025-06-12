interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  color?: string;
}

export const InfoCard = ({
  icon,
  label,
  children,
  color = "blue",
}: InfoCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 flex flex-col items-start gap-4 border border-gray-100 hover:shadow-lg transition">
      <div
        className={`p-2 rounded-md bg-${color}-100 text-${color}-600 text-xl`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs uppercase text-gray-400 font-semibold tracking-wider mb-1">
          {label}
        </p>
        <p className="text-sm text-gray-800 font-medium">{children}</p>
      </div>
    </div>
  );
};
