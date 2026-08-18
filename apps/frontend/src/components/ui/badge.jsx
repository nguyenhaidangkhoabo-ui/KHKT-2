// variant: success | warning | danger | info | primary | secondary
export default function Badge({ variant = 'secondary', children }) {
  return <span className={`badge badge-${variant}`}>{children}</span>
}