import * as FaIcons from "react-icons/fa";
import * as MdIcons from "react-icons/md";
import * as GiIcons from "react-icons/gi";

const iconMap = {
  fa: FaIcons,
  md: MdIcons,
  gi: GiIcons,
};

function renderIcon(iconName: string) {
  if (!iconName) return null;
  const [lib, name] = iconName.split(":");
  const IconComponent = iconMap[lib as keyof typeof iconMap]?.[name];
  return IconComponent ? <IconComponent size={20} color="black" /> : null;
}

export default renderIcon;