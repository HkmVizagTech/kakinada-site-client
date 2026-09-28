/**
 * Optional custom nav link — a free-form name + URL an admin can enable to
 * show in the navbar, alongside (not instead of) the major-festival
 * highlight. Unlike the festival highlight there is no calendar auto-pick:
 * an admin simply types a label and a destination and turns it on/off via
 * Admin → Content → Navigation. Rendered the same way the festival
 * highlight is — a top-level desktop link and a pinned row in the mobile
 * "More" sheet.
 */

export interface CustomNavLink {
  label: string;
  href: string;
}

export interface CustomNavLinkOverride {
  enabled?: boolean;
  label?: string;
  href?: string;
}

/**
 * Resolve the custom link to display, given the admin-stored override.
 * Returns null when disabled or missing a label/href, so a half-filled
 * admin form never renders a broken nav item.
 */
export function resolveCustomNavLink(
  override?: CustomNavLinkOverride | null
): CustomNavLink | null {
  if (!override || !override.enabled) return null;
  const label = (override.label || "").trim();
  const href = (override.href || "").trim();
  if (!label || !href) return null;
  return { label, href };
}
