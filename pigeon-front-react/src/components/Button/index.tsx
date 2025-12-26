import styles from "./styles.module.scss";

type Props = { alt?: boolean } & React.ComponentProps<"button">;

export const Button = ({ alt, ...props }: Props) => {
  return (
    <button className={alt ? styles.button_alt : styles.button} {...props} />
  );
};
