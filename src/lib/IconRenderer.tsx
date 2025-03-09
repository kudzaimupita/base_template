import * as AiIcons from 'react-icons/ai';
import * as BiIcons from 'react-icons/bi';
import * as BsIcons from 'react-icons/bs';
import * as CgIcons from 'react-icons/cg';
import * as DiIcons from 'react-icons/di';
import * as Fa6Icons from 'react-icons/fa6';
import * as FaIcons from 'react-icons/fa';
import * as FcIcons from 'react-icons/fc';
import * as FiIcons from 'react-icons/fi';
import * as GiIcons from 'react-icons/gi';
import * as GoIcons from 'react-icons/go';
import * as GrIcons from 'react-icons/gr';
import * as Hi2Icons from 'react-icons/hi2';
import * as HiIcons from 'react-icons/hi';
import * as ImIcons from 'react-icons/im';
import * as Io5Icons from 'react-icons/io5';
import * as IoIcons from 'react-icons/io';
import * as LuIcons from 'react-icons/lu';
import * as MdIcons from 'react-icons/md';
import * as PiIcons from 'react-icons/pi';
import * as RiIcons from 'react-icons/ri';
import * as RxIcons from 'react-icons/rx';
import * as SiIcons from 'react-icons/si';
import * as SlIcons from 'react-icons/sl';
import * as TbIcons from 'react-icons/tb';
import * as TfiIcons from 'react-icons/tfi';
import * as VscIcons from 'react-icons/vsc';
import * as WiIcons from 'react-icons/wi';

const iconSetInfo = {
  Pi: {
    name: 'Phosphor Icons',
    provider: PiIcons,
  },
  Ai: {
    name: 'Ant Design Icons',
    provider: AiIcons,
  },
  Bi: {
    name: 'Bootstrap Icons',
    provider: BiIcons,
  },
  Bs: {
    name: 'Bootstrap Icons',
    provider: BsIcons,
  },
  Cg: {
    name: 'CSS.gg',
    provider: CgIcons,
  },
  Di: {
    name: 'Dev Icons',
    provider: DiIcons,
  },
  Fa: {
    name: 'Font Awesome (Legacy)',
    provider: FaIcons,
  },
  Fa6: {
    name: 'Font Awesome 6',
    provider: Fa6Icons,
  },
  Fc: {
    name: 'Flat Color Icons',
    provider: FcIcons,
  },
  Fi: {
    name: 'Feather Icons',
    provider: FiIcons,
  },
  Gi: {
    name: 'Game Icons',
    provider: GiIcons,
  },
  Go: {
    name: 'Github Octicons',
    provider: GoIcons,
  },
  Gr: {
    name: 'Grommet Icons',
    provider: GrIcons,
  },
  Hi: {
    name: 'Heroicons',
    provider: HiIcons,
  },
  Hi2: {
    name: 'Heroicons 2',
    provider: Hi2Icons,
  },
  Im: {
    name: 'IcoMoon',
    provider: ImIcons,
  },
  Io: {
    name: 'Ionicons 4',
    provider: IoIcons,
  },
  Io5: {
    name: 'Ionicons 5',
    provider: Io5Icons,
  },
  Lu: {
    name: 'Lucide Icons',
    provider: LuIcons,
  },
  Md: {
    name: 'Material Design Icons',
    provider: MdIcons,
  },
  Ri: {
    name: 'Remix Icons',
    provider: RiIcons,
  },
  Rx: {
    name: 'Radix Icons',
    provider: RxIcons,
  },
  Si: {
    name: 'Simple Icons',
    provider: SiIcons,
  },
  Sl: {
    name: 'Simple Line Icons',
    provider: SlIcons,
  },
  Tb: {
    name: 'Tabler Icons',
    provider: TbIcons,
  },
  Tfi: {
    name: 'Themify Icons',
    provider: TfiIcons,
  },
  Vsc: {
    name: 'VS Code Icons',
    provider: VscIcons,
  },
  Wi: {
    name: 'Weather Icons',
    provider: WiIcons,
  },
};
export const IconRenderer = ({ icon, size = 24, color = 'currentColor', className = '' }) => {
  if (!icon) return null;
  const iconSet = iconSetInfo[icon.set]?.provider;
  if (!iconSet) return null;
  const IconComponent = iconSet[icon.name];
  return IconComponent ? <IconComponent size={size} color={color} className={className} /> : null;
};
