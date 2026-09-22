type IconProps = { size?: number; className?: string };

export function ArrowIcon({ size = 18, className = "" }: IconProps) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
export function GlobeIcon({ size = 22, className = "" }: IconProps) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/><path d="M3.5 12h17M12 3c2.6 2.5 4 5.5 4 9s-1.4 6.5-4 9c-2.6-2.5-4-5.5-4-9s1.4-6.5 4-9Z" stroke="currentColor" strokeWidth="1.6"/></svg>;
}
export function CodeIcon({ size = 22, className = "" }: IconProps) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
export function PeopleIcon({ size = 22, className = "" }: IconProps) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.6"/><path d="M3 19c.5-4 2.4-6 6-6s5.5 2 6 6M16 5.5c2 .2 3.5 1.6 3.5 3.5s-1.2 3.1-3 3.5M17 14c2.5.6 3.8 2.2 4 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>;
}
export function ShieldIcon({ size = 22, className = "" }: IconProps) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3 20 6v5c0 5-3 8-8 10-5-2-8-5-8-10V6l8-3Z" stroke="currentColor" strokeWidth="1.6"/><path d="m8.5 12 2.2 2.2 4.8-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
export function MailIcon({ size = 20, className = "" }: IconProps) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>;
}
export function PhoneIcon({ size = 20, className = "" }: IconProps) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6.3 3.8 9 7.7 7.5 9.4c1.2 2.7 3.3 4.8 6 6l1.7-1.5 4 2.7c.5.4.6 1 .3 1.5-.9 1.5-2.4 2.4-4.1 2.1C9 19.3 4.7 15 3.8 8.6 3.5 6.9 4.4 5.4 5.9 4.5c.1-.1.3-.2.4-.7Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
export function PinIcon({ size = 20, className = "" }: IconProps) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 10c0 5.5-8 11-8 11S4 15.5 4 10a8 8 0 1 1 16 0Z" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.6"/></svg>;
}
export function CheckIcon({ size = 20, className = "" }: IconProps) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/><path d="m8.2 12.2 2.4 2.4 5.2-5.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
export function CloseIcon({ size = 18, className = "" }: IconProps) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 7l10 10M17 7 7 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
}
export function AlertIcon({ size = 20, className = "" }: IconProps) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/><path d="M12 7.5v5.5M12 16.2h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
}
export function ChatIcon({ size = 22, className = "" }: IconProps) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 16.5V7.8A2.8 2.8 0 0 1 7.8 5h8.4A2.8 2.8 0 0 1 19 7.8v5.4a2.8 2.8 0 0 1-2.8 2.8H9.2L5 19.5v-3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M8.5 9.5h7M8.5 12.5h4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>;
}
export function SendIcon({ size = 18, className = "" }: IconProps) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h12M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
