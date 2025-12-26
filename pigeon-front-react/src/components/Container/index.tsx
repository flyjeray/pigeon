import styles from "./styles.module.scss";

type Props = {
  children: React.ReactNode;
  light?: boolean;
};

export const Container = ({ children, light }: Props) => {
  return (
    <div className={light ? styles.container_light : styles.container_dark}>
      {children}
    </div>
  );
};
