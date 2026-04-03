type Props = {
  message: string;
};

export default function ErrorMessage({ message }: Props) {
  return (
    <div className="error-box" role="alert">
      <strong>Something went wrong.</strong>
      <div className="error-text">{message}</div>
    </div>
  );
}