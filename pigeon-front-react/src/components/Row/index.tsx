import styles from "./styles.module.scss";

export const Row = ({ children }: { children: React.ReactNode }) => {
  return <div className={styles.row}>{children}</div>;
};
