type SectionTitleProps = {
  icon: React.ReactNode;
  title: string;
};

export const SectionTitle = ({ icon, title }: SectionTitleProps) => (
  <h2 className="flex items-center justify-center gap-3 text-3xl font-extrabold text-gray-800 mb-10">
    <span className="text-blue-600">{icon}</span>
    <span>{title}</span>
  </h2>
);
