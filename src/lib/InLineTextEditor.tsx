import { CSSProperties, useEffect, useRef, useState, useCallback } from 'react';

interface IInlineEditText {
  initialText: string | null;
  textType?: 'number' | 'text';
  lineType?: 'inline' | 'multiple';
  overflowEffect?: 'ellipsis' | 'hide' | '';
  underLineOnHover?: boolean;
  fontFamily?: string | 'sans';
  className?: string;
  isEditable?: boolean;
  overRideStyles?: CSSProperties;
  isInlineTextFocused?: (value: boolean) => void;
  onType: (value: any) => void;
  id?: string;
  placeholder?: string;
  minWidth?: string;
  maxWidth?: string;
}

const InlineEditText: React.FC<IInlineEditText> = ({
  initialText = '',
  textType = 'text',
  fontFamily = 'sans',
  className = '',
  overRideStyles,
  lineType = 'inline',
  overflowEffect = '',
  underLineOnHover = false,
  isInlineTextFocused,
  onType,
  isEditable = true,
  id,
  placeholder = '...',
  minWidth = '8px',
  maxWidth = 'fit-content',
}) => {
  const [text, setText] = useState(initialText || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const hiddenSpanRef = useRef<HTMLSpanElement>(null);
  const [inputWidth, setInputWidth] = useState('auto');

  // Update text when initialText changes
  useEffect(() => {
    setText(initialText || '');
  }, [initialText]);

  // Calculate and update width based on content
  const updateWidth = useCallback(() => {
    if (hiddenSpanRef.current) {
      const textToMeasure = text || placeholder;
      hiddenSpanRef.current.textContent = textToMeasure;
      const measuredWidth = hiddenSpanRef.current.offsetWidth;
      // Add minimal extra width for cursor
      const finalWidth = Math.max(measuredWidth + 2, parseInt(minWidth));
      setInputWidth(`${finalWidth}px`);
    }
  }, [text, placeholder, minWidth]);

  useEffect(() => {
    updateWidth();
  }, [text, updateWidth]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Notify parent about focus state
  useEffect(() => {
    isInlineTextFocused?.(isEditing);
  }, [isEditing, isInlineTextFocused]);

  // Handle click outside to exit edit mode
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        handleSave();
      }
    };

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing, text]);

  const handleSave = () => {
    setIsEditing(false);
    if (!text && initialText) {
      setText(initialText);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setText(initialText || '');
  };

  const handleClick = () => {
    if (!isEditing && isEditable) {
      setIsEditing(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && lineType === 'inline') {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = textType === 'number' ? e.target.value.replace(/[^0-9.-]/g, '') : e.target.value;
    setText(newValue);
    onType(e);
  };

  const getFontClass = () => {
    const fontMap: Record<string, string> = {
      sans: 'font-sans',
      serif: 'font-serif',
      mono: 'font-mono',
    };
    return fontMap[fontFamily] || '';
  };

  const baseClasses = `${getFontClass()} ${className}`;
  const customStyles = !getFontClass() ? { fontFamily } : {};

  const sharedStyles: CSSProperties = {
    ...customStyles,
    ...overRideStyles,
    minWidth,
    maxWidth,
    width: lineType === 'inline' ? inputWidth : '100%',
    verticalAlign: 'baseline',
  };

  const editingStyles: CSSProperties = {
    ...sharedStyles,
    display: 'inline-block',
    outline: '1px solid rgb(64, 64, 64)',
    outlineOffset: '0px',
    borderRadius: '1px',
    padding: '1px 3px',
    backgroundColor: 'rgb(38, 38, 38)',
    color: 'rgb(245, 245, 245)',
    transition: 'all 0.2s ease',
  };

  const displayStyles: CSSProperties = {
    ...sharedStyles,
    display: lineType === 'multiple' ? 'block' : 'inline',
    cursor: isEditable ? 'pointer' : 'default',
    transition: 'all 0.2s ease',
    textDecoration: underLineOnHover && isHover ? 'underline' : 'none',
    textDecorationColor: underLineOnHover && isHover ? 'rgb(163, 163, 163)' : 'transparent',
    minHeight: lineType === 'multiple' ? '3em' : 'auto',
    whiteSpace: lineType === 'multiple' ? 'pre-wrap' : 'nowrap',
    color: 'rgb(245, 245, 245)',
  };

  // Apply overflow effect
  if (overflowEffect === 'ellipsis' && !isEditing) {
    displayStyles.overflow = 'hidden';
    displayStyles.textOverflow = 'ellipsis';
    displayStyles.whiteSpace = 'nowrap';
  }

  const displayText = text || placeholder;
  const showPlaceholder = !text;

  return (
    <>
      {/* Hidden span for measuring text width */}
      <span
        ref={hiddenSpanRef}
        className={baseClasses}
        style={{
          ...customStyles,
          visibility: 'hidden',
          position: 'absolute',
          whiteSpace: 'pre',
        }}
        aria-hidden="true"
      />

      {!isEditing ? (
        lineType === 'multiple' ? (
          <div
            id={id}
            className={baseClasses}
            style={displayStyles}
            role={isEditable ? 'button' : 'text'}
            tabIndex={isEditable ? 0 : -1}
            onClick={handleClick}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClick();
              }
            }}
          >
            <span style={{ color: showPlaceholder ? 'rgb(115, 115, 115)' : 'inherit' }}>{displayText}</span>
          </div>
        ) : (
          <span
            id={id}
            className={baseClasses}
            style={displayStyles}
            role={isEditable ? 'button' : 'text'}
            tabIndex={isEditable ? 0 : -1}
            onClick={handleClick}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClick();
              }
            }}
          >
            <span style={{ color: showPlaceholder ? 'rgb(115, 115, 115)' : 'inherit' }}>{displayText}</span>
          </span>
        )
      ) : lineType === 'multiple' ? (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          id={id}
          value={text}
          className={`resize-none outline-none border-none ${baseClasses}`}
          style={{ ...editingStyles, display: 'block' }}
          placeholder={placeholder}
          rows={3}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          id={id}
          type={textType}
          value={text}
          className={`outline-none border-none ${baseClasses}`}
          style={editingStyles}
          placeholder={placeholder}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
      )}
    </>
  );
};

export default InlineEditText;
