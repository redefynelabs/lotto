import React from "react";
import clsx from "clsx";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;

  /**
   * Disable horizontal padding (useful for banners or edge-to-edge layouts)
   * @default false
   */
  disablePaddingX?: boolean;

  /**
   * Disable vertical padding (useful for tight sections)
   * @default false
   */
  disablePaddingY?: boolean;

  /**
   * Horizontal padding (e.g. "px-6 md:px-12")
   * @default "px-6 md:px-14"
   */
  paddingX?: string;

  /**
   * Vertical padding (e.g. "py-8 md:py-16")
   * @default "py-0"
   */
  paddingY?: string;

  /**
   * Optionally control max width
   * @default "max-w-7xl"
   */
  maxWidth?: string;
}

/**
 * ContainerLayout
 * A responsive container component with optional paddings and max-width control.
 */
const ContainerLayout: React.FC<ContainerProps> = ({
  children,
  className,
  disablePaddingX = false,
  disablePaddingY = false,
  paddingX = "px-6 xl:px-[105px] lg:px-[50px]",
  paddingY = " py-8 md:py-10",
  maxWidth = " ",
}) => {
  return (
    <div
      className={clsx(
        "mx-auto w-full",
        maxWidth,
        !disablePaddingX && paddingX,
        !disablePaddingY && paddingY,
        className
      )}
    >
      {children}
    </div>
  );
};

export default ContainerLayout;
