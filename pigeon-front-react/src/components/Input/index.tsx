import styles from "./styles.module.scss";

type Props = React.ComponentProps<"input">;

export const Input = (props: Props) => {
  return <input className={styles.input} {...props} />;
};
