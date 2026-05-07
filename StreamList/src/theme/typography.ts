import { TextStyle } from 'react-native';

const letterSpacingDisplay = -0.02 * 16;

export const fontFamilies = {
  display: 'Manrope-Bold',
  headline: 'Manrope-SemiBold',
  title: 'Manrope-SemiBold',
  body: 'Inter',
  label: 'Inter',
} as const;

export const typography = {
  displayLg: {
    fontFamily: fontFamilies.display,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: letterSpacingDisplay,
  } satisfies TextStyle,
  displayMd: {
    fontFamily: fontFamilies.display,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: letterSpacingDisplay,
  } satisfies TextStyle,
  headlineMd: {
    fontFamily: fontFamilies.headline,
    fontSize: 22,
    lineHeight: 28,
  } satisfies TextStyle,
  titleSm: {
    fontFamily: fontFamilies.title,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
  } satisfies TextStyle,
  bodyMd: {
    fontFamily: fontFamilies.body,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  } satisfies TextStyle,
  bodySm: {
    fontFamily: fontFamilies.body,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  } satisfies TextStyle,
  label: {
    fontFamily: fontFamilies.label,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
  } satisfies TextStyle,
  labelSm: {
    fontFamily: fontFamilies.label,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '600',
    letterSpacing: 1.2,
  } satisfies TextStyle,
} as const;
