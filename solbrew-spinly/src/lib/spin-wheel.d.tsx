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
        image?:HTMLImageElement;
        imageRadius?: number;
        imageScale?: number;
      }>;
      radius?: number;
      itemLabelRotation?: number,
      itemLabelFontSizeMax?:number,
      itemLabelAlign?:string,
      imageRotation?: 'none' | 'item' | 'wheel';
      textOrientation?: 'curved' | 'horizontal' | 'vertical';
      textAlignment?: 'center' | 'inner' | 'outer';
      labelColor?:string;
      lineWidth?: number;
      itemLabelRadius?:number;
      borderColor?:string;
      borderWidth?:number;
      lineColor?: string;
      isInteractive?: boolean;
      rotationResistance?: number,
      rotationSpeedMax?: number
      onRest?: (event: { currentIndex: number }) => void;
      onCurrentIndexChange?: () => void;
    }): WheelInstance;
  };
}