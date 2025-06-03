import { JSX } from "react";
import { FiClock, FiAlertTriangle, FiBriefcase, FiUser } from "react-icons/fi";
import { MdSportsTennis } from "react-icons/md";

export const categoryStyles: Record<
  string,
  { bg: string; border: string; text: string }
> = {
  deadline: {
    bg: "bg-gray-900",
    border: "border-gray-900",
    text: "text-white",
  },
  important: {
    bg: "bg-yellow-100",
    border: "border-yellow-500",
    text: "text-yellow-900",
  },
  work: {
    bg: "bg-blue-100",
    border: "border-blue-500",
    text: "text-blue-900",
  },
  sports: {
    bg: "bg-green-100",
    border: "border-green-500",
    text: "text-green-900",
  },
  personal: {
    bg: "bg-pink-100",
    border: "border-pink-500",
    text: "text-pink-900",
  },
  default: {
    bg: "bg-white",
    border: "border-gray-300",
    text: "text-gray-800",
  },
};

export const categoryLabels: Record<string, string> = {
  deadline: "Deadline",
  important: "Important",
  work: "Work",
  sports: "Sports",
  personal: "Personal",
};

export const categoryIcons: Record<string, JSX.Element> = {
  deadline: <FiClock className="text-gray-600" />,
  important: <FiAlertTriangle className="text-yellow-600" />,
  work: <FiBriefcase className="text-blue-600" />,
  sports: <MdSportsTennis className="text-green-600" />,
  personal: <FiUser className="text-pink-600" />,
};
