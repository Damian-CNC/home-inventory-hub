import {
  Box, Refrigerator, Snowflake, Archive, Package, ShoppingBasket,
  Wine, Apple, Cookie, Pill, Wrench, Shirt, BookOpen, Bath, Sofa, Car,
} from "lucide-react";
import { LucideIcon } from "lucide-react";

export const ICONS: Record<string, LucideIcon> = {
  Box, Refrigerator, Snowflake, Archive, Package, ShoppingBasket,
  Wine, Apple, Cookie, Pill, Wrench, Shirt, BookOpen, Bath, Sofa, Car,
};

export const ICON_NAMES = Object.keys(ICONS);

export function Icon({ name, className }: { name: string; className?: string }) {
  const C = ICONS[name] ?? Box;
  return <C className={className} />;
}
