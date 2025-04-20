interface ZYIconProps {
  type: string;
  fill?: string;
  color?: string;
  size?: string | number;
  style?: React.CSSProperties;
  className?: string;
  onClick?: React.MouseEventHandler<SVGSVGElement>;
  defs?: React.ReactElement;
}
function ZYIcon({
  type,
  style,
  color,
  size,
  className = "",
  onClick = () => {},
  defs = <></>,
  fill = "",
}: ZYIconProps) {
  return (
    <svg
      className={"icon svg-icon " + className}
      aria-hidden="true"
      style={{ fontSize: size, color, ...style }}
      onClick={onClick}
    >
      {defs}
      <use xlinkHref={`#icon-${type}`} fill={fill} />
    </svg>
  );
}

export default ZYIcon;
