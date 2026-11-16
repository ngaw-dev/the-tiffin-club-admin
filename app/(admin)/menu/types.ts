// app/(admin)/menu/types.ts

// Shared menu types — reused by ticket 07 (menu items CRUD).

export type MenuItemType = "main" | "extra";

export type MenuItem = {
  id: number;
  type: MenuItemType;
  name: string;
  description: string | null;
  /** Price in cents (NZD). */
  price: number;
  sort_order: number;
};

export type Menu = {
  id: number;
  /** "YYYY-MM-DD" */
  menu_date: string;
  /** "HH:MM" or null (falls back to the global order cutoff). */
  cutoff_time: string | null;
  /** Set when published, null when unpublished. */
  published_at: string | null;
  items: MenuItem[];
};

export function isMenuPublished(menu: Pick<Menu, "published_at">): boolean {
  return menu.published_at !== null;
}
