import { BookOpen, Calendar, GraduationCap, Receipt, CircleAlert } from "lucide-react";

interface QuickActionProps {
  icon: React.ElementType;
  label: string;
  href: string;
  iconBg: string;
  iconColor: string;
  hoverBorder: string;
  hoverBg: string;
  hoverText: string;
}

function QuickAction({
  icon: Icon,
  label,
  href,
  iconBg,
  iconColor,
  hoverBorder,
  hoverBg,
  hoverText,
}: QuickActionProps) {
  return (
    <a
      href={href}
      className={`flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-all ${hoverBorder} ${hoverBg} ${hoverText}`}
    >
      <div
        className={`w-6 h-6 shrink-0 rounded-md ${iconBg} flex items-center justify-center`}
      >
        <Icon size={13} className={iconColor} />
      </div>
      <span className="hidden sm:inline">{label}</span>
    </a>
  );
}

const actions: QuickActionProps[] = [
  {
    icon: BookOpen,
    label: "Transcript",
    href: "/my-transcript",
    iconBg: "bg-primary-50",
    iconColor: "text-primary-600",
    hoverBorder: "hover:border-primary-200",
    hoverBg: "hover:bg-primary-50",
    hoverText: "hover:text-primary-700",
  },
  {
    icon: Calendar,
    label: "Registration",
    href: "/my-registration",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    hoverBorder: "hover:border-blue-200",
    hoverBg: "hover:bg-blue-50",
    hoverText: "hover:text-blue-700",
  },
  {
    icon: GraduationCap,
    label: "Bulletin",
    href: "/my-bulletin",
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
    hoverBorder: "hover:border-green-200",
    hoverBg: "hover:bg-green-50",
    hoverText: "hover:text-green-700",
  },
  {
    icon: Receipt,
    label: "My Fees",
    href: "/my-fees",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    hoverBorder: "hover:border-amber-200",
    hoverBg: "hover:bg-amber-50",
    hoverText: "hover:text-amber-700",
  },
  {
    icon: CircleAlert,
    label: "Announcements",
    href: "/announcements",
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    hoverBorder: "hover:border-purple-200",
    hoverBg: "hover:bg-purple-50",
    hoverText: "hover:text-purple-700",
  },
];

export default function QuickActions() {
  return (
    <div className="flex gap-2 flex-wrap">
      {actions.map((action) => (
        <QuickAction key={action.label} {...action} />
      ))}
    </div>
  );
}
