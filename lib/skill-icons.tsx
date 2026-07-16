import type { IconType } from 'react-icons'
import {
  SiAndroidstudio,
  SiApple,
  SiDart,
  SiDocker,
  SiFirebase,
  SiFlutter,
  SiGit,
  SiGithubactions,
  SiGooglecloud,
  SiGraphql,
  SiKotlin,
  SiOpenai,
  SiOpenjdk,
  SiReact,
  SiSpring,
  SiSwift,
  SiTypescript,
  SiXcode,
} from 'react-icons/si'
import {
  TbApi,
  TbBolt,
  TbBuildingArch,
  TbCloud,
  TbCode,
  TbLayersIntersect,
  TbLayoutGrid,
  TbPackages,
  TbShieldCheck,
} from 'react-icons/tb'
import { VscCode } from 'react-icons/vsc'

const SKILL_ICON_MAP: Record<string, IconType> = {
  swift: SiSwift,
  swiftui: TbLayersIntersect,
  uikit: SiApple,
  kotlin: SiKotlin,
  java: SiOpenjdk,
  flutter: SiFlutter,
  dart: SiDart,
  'react native': SiReact,
  mvvm: TbLayoutGrid,
  'clean architecture': TbBuildingArch,
  modularization: TbPackages,
  graphql: SiGraphql,
  'rest apis': TbApi,
  'performance tuning': TbBolt,
  'code quality': TbShieldCheck,
  firebase: SiFirebase,
  'spring boot': SiSpring,
  typescript: SiTypescript,
  docker: SiDocker,
  'cloud services': TbCloud,
  'vertex ai': SiGooglecloud,
  cursor: VscCode,
  xcode: SiXcode,
  'android studio': SiAndroidstudio,
  git: SiGit,
  'ci/cd': SiGithubactions,
  'generative ai': SiOpenai,
}

export function getSkillIcon(name: string): IconType {
  return SKILL_ICON_MAP[name.trim().toLowerCase()] ?? TbCode
}
