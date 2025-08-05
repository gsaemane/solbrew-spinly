declare module 'spin-wheel' {
  export interface WheelInstance {
    spin(): void;
    destroy(): void;
    spinToItem(itemIndex: number, duration: number, spinToCenter: boolean, numberOfRevolutions: number, direction: 1 | -1, easingFunction?: (n: number) => number): void;
  }

  export const Wheel: {
    new (container: HTMLElement, options: {
      items: Array<{
        label: string;
        backgroundColor?: string;
        image?: string;
        imageRadius?: number;
        imageScale?: number;
      }>;
      radius?: number;
      imageRotation?: 'none' | 'item' | 'wheel';
      textOrientation?: 'curved' | 'horizontal' | 'vertical';
      textAlignment?: 'center' | 'inner' | 'outer';
      lineWidth?: number;
      lineColor?: string;
      isInteractive?: boolean;
      onRest?: (event: { currentIndex: number }) => void;
      onCurrentIndexChange?: () => void;
    }): WheelInstance;
  };
}