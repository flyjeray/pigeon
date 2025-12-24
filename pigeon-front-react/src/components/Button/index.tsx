import styles from "./styles.module.scss";

type Props = React.ComponentProps<"button">;

export const Button = (props: Props) => {
  return <button className={styles.button} {...props} />;
};
