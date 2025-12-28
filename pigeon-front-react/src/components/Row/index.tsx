import styles from "./styles.module.scss";

type Props = {
  children: React.ReactNode;
  mobileColumn?: boolean;
};

export const Row = ({ children, mobileColumn }: Props) => {
  return (
    <div className={mobileColumn ? styles.row_mobileColumn : styles.row}>
      {children}
    </div>
  );
};
