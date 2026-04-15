import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import './ifmis-components.css';

interface AccordionBadge {
  label: string;
  type: 'completed' | 'pending' | 'error';
}

interface IFMISAccordionProps {
  number: number;
  title: string;
  badges?: AccordionBadge[];
  defaultOpen?: boolean;
  showNext?: boolean;
  onNext?: () => void;
  children: React.ReactNode;
}

export function IFMISAccordion({
  number,
  title,
  badges,
  defaultOpen = true,
  showNext = false,
  onNext,
  children,
}: IFMISAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="ifmis-accordion">
      <button className="ifmis-accordion__header" onClick={() => setOpen(!open)}>
        <div className="ifmis-accordion__header-left">
          <div className="ifmis-accordion__number">{number}</div>
          <span className="ifmis-accordion__title">{title}</span>
        </div>
        <div className="ifmis-accordion__header-right">
          {badges?.map((badge, i) => (
            <span key={i} className={`ifmis-accordion__badge ifmis-accordion__badge--${badge.type}`}>
              {badge.type === 'completed' && '✓ '}
              {badge.type === 'error' && '⚠ '}
              {badge.label}
            </span>
          ))}
          <div className={`ifmis-accordion__toggle ${open ? 'ifmis-accordion__toggle--open' : ''}`}>
            <ChevronDown size={16} />
          </div>
        </div>
      </button>

      {open && (
        <>
          <div className="ifmis-accordion__body">{children}</div>
          {showNext && (
            <div className="ifmis-accordion__footer">
              <button className="ifmis-btn-next" onClick={onNext}>
                Next <ChevronDown size={14} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* Reusable Field Display Component */
interface IFMISFieldProps {
  label: string;
  value?: string;
  required?: boolean;
  variant?: 'default' | 'muted' | 'highlight' | 'success' | 'large';
  children?: React.ReactNode;
}

export function IFMISField({ label, value, required, variant = 'default', children }: IFMISFieldProps) {
  const valueClass = variant !== 'default' ? `ifmis-field__value--${variant}` : '';

  return (
    <div className="ifmis-field">
      <div className="ifmis-field__label">
        {label}
        {required && <span className="required">*</span>}
      </div>
      {children ? children : (
        <div className={`ifmis-field__value ${valueClass}`}>
          {value || '—'}
        </div>
      )}
    </div>
  );
}
