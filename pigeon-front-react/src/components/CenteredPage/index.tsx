import styles from "./styles.module.scss";

type Props = {
  children: React.ReactNode;
  bottom?: React.ReactNode;
  desktopRow?: boolean;
};

export const CenteredPage = ({ children, bottom, desktopRow }: Props) => {
  return (
    <div className={styles.page}>
      <div className={desktopRow ? styles.content_desktopRow : styles.content}>
        {children}
      </div>
      {bottom && <div className={styles.bottom}>{bottom}</div>}
    </div>
  );
};
