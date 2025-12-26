import styles from "./styles.module.scss";

type Props = {
  children: React.ReactNode;
  bottom?: React.ReactNode;
};

export const CenteredPage = ({ children, bottom }: Props) => {
  return (
    <div className={styles.content}>
      {children}
      {bottom && <div className={styles.bottom}>{bottom}</div>}
    </div>
  );
};
