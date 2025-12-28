import styles from "./styles.module.scss";

type Props = {
  children: React.ReactNode;
  light?: boolean;
  isForm?: boolean;
} & React.FormHTMLAttributes<HTMLFormElement>;

export const Container = ({ children, light, ...props }: Props) => {
  return props.isForm ? (
    <form
      className={light ? styles.container_light : styles.container_dark}
      {...props}
    >
      {children}
    </form>
  ) : (
    <div className={light ? styles.container_light : styles.container_dark}>
      {children}
    </div>
  );
};
