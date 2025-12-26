import styles from "./styles.module.scss";

export const CenteredColumn = ({ children }: { children: React.ReactNode }) => {
  return <div className={styles.col}>{children}</div>;
};
