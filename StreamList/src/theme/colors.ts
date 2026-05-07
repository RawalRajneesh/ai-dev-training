export const colors = {
  surface: '#131313',
  surface_container_lowest: '#0E0E0E',
  surface_container_low: '#1C1B1B',
  surface_container: '#232323',
  surface_container_high: '#2A2A2A',
  surface_container_highest: '#353534',
  surface_bright: '#3A3939',
  on_surface: '#E5E2E1',
  on_surface_variant: '#E4BDBA',
  primary: '#FFB3AE',
  primary_container: '#FF5351',
  secondary_container: '#822625',
  outline_variant: '#494847',
  scrim: 'rgba(19, 19, 19, 0.70)',
  error: '#FF8A80',
  /** Text on saturated primary / badge fills (hero “New Release”, CTA label). */
  on_primary_fill: '#FFFFFF',
} as const;

/** Hero primary button gradient (theme-only; use with `LinearGradient`). */
export const heroPrimaryGradient = [colors.primary, colors.primary_container] as const;

export type ColorName = keyof typeof colors;
