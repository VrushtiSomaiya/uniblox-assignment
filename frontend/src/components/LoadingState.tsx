type LoadingStateProps = {
  message?: string;
};

export const LoadingState = ({ message = "Loading..." }: LoadingStateProps) => (
  <div className="loading-state" role="status" aria-live="polite">
    <div className="loading-spinner" aria-hidden />
    <span>{message}</span>
  </div>
);
