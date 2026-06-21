import React from 'react';
import Svg, { Path } from 'react-native-svg';

/** Trophy glyph from the design (stroke-only). */
export function Trophy({ size = 20, color = '#15110a', strokeWidth = 1.7 }: { size?: number; color?: string; strokeWidth?: number }) {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size}>
      <Path
        d="M5 3h14v3a5 5 0 0 1-5 5h-4a5 5 0 0 1-5-5V3Z M5 5H2v1a4 4 0 0 0 4 4 M19 5h3v1a4 4 0 0 1-4 4 M10 11v4 M8 20h8 M9 20a3 3 0 0 1 3-3 3 3 0 0 1 3 3"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}
