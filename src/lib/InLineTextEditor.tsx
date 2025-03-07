import { CSSProperties, useEffect, useRef, useState } from 'react';

interface IInlineEditText {
  initialText: string | null;
  lineType?: 'inline' | 'multiple';
  overflowEffect?: 'elipsis' | 'hide' | '';
  underLineOnHover?: boolean;
  fontFamily?: string | 'sans';
  className?: string;
  isEditable?: boolean;
  overRideStyles?: CSSProperties;
  isInlineTextFocused?: (value: boolean) => void;
  onType: (value: any) => void;
}

const InlineEditText: React.FC<IInlineEditText> = ({
  initialText = 'Type text',
  fontFamily = 'Inter',
  className = '',
  overRideStyles,
  lineType = 'multiple',
  overflowEffect = '',
  underLineOnHover = false,
  isInlineTextFocused,
  onType,
  isEditable = true,
}) => {
  const [text, setText] = useState(initialText);
  const [isEditing, setIsEditing] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
    }
  }, [isEditing, cursorPosition]);

  useEffect(() => {
    isInlineTextFocused?.(isEditing);
  }, [isEditing, isInlineTextFocused]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setIsEditing(false);
      }
    };

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing]);

  const calculateCursorPosition = (e, element) => {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    const fontSize = parseFloat(style.fontSize);
    const span = document.createElement('span');
    span.style.font = style.font;
    span.style.fontSize = style.fontSize;
    span.style.position = 'absolute';
    span.style.whiteSpace = 'pre';
    span.textContent = 'X';
    document.body.appendChild(span);
    const charWidth = span.getBoundingClientRect().width;
    document.body.removeChild(span);
    const computedWidth = rect.width;
    const scaleFactor = computedWidth / (element.offsetWidth || 1);
    const x = (e.clientX - rect.left) / scaleFactor;
    const clickPosition = Math.round(x / charWidth);
    return Math.min(Math.max(0, clickPosition), text?.length || 0);
  };

  const handleDoubleClick = (e) => {
    if (!isEditable) return;
    const newPosition = calculateCursorPosition(e, e.currentTarget);
    setCursorPosition(newPosition);
    setIsEditing(true);
  };

  const handleClick = (e) => {
    if (isEditing) {
      const newPosition = calculateCursorPosition(e, e.currentTarget);
      setCursorPosition(newPosition);
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newPosition, newPosition);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setText(initialText);
    }
  };

  const getFontClass = () => {
    const fontMap = {
      sans: 'font-sans',
      serif: 'font-serif',
      mono: 'font-mono',
    };
    return fontMap[fontFamily] || '';
  };

  const baseStyles = `${getFontClass()} text-lg ${className}`;
  const customStyles = !getFontClass() ? { fontFamily } : {};

  const removeDefaultStyle: CSSProperties = {
    all: 'unset',
    display: 'inline-block',
    width: '100%',
    height: 'auto',
    boxSizing: 'border-box',
  };

  const cursorStyles = isEditing
    ? {
        caretColor: '#000',
        caretShape: 'block',
        animation: 'blink 1s step-end infinite',
        boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.2)',
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        borderRadius: '2px',
        padding: '2px',
      }
    : {};

  const sharedProps = {
    ref: inputRef,
    value: text,
    className: `${baseStyles} ${
      overflowEffect === 'elipsis' ? 'overflow-hidden overflow-x-hidden whitespace-nowrap text-ellipsis' : ''
    }`,
    style: {
      textDecoration: underLineOnHover && isHover ? 'underline' : '',
      ...removeDefaultStyle,
      ...customStyles,
      ...overRideStyles,
      ...cursorStyles,
    },
    onChange: (e) => {
      setText(e.target.value);
      onType(e);
    },
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    onMouseEnter: () => setIsHover(true),
    onMouseLeave: () => setIsHover(false),
  };

  if (!isEditing) {
    return (
      <p
        {...sharedProps}
        className={`cursor-default text-neutral-400 ${baseStyles}`}
        style={{
          fontSize: '14px',
          textDecoration: underLineOnHover && isHover ? 'underline' : '',
          ...customStyles,
          ...overRideStyles,
        }}
        onDoubleClick={handleDoubleClick}
      >
        {text}
      </p>
    );
  }

  return lineType === 'multiple' ? (
    <textarea {...sharedProps} className={`bg-transparent editing-cursor ${sharedProps.className}`} />
  ) : (
    <input {...sharedProps} type="text" className={`w-fit editing-cursor ${sharedProps.className}`} />
  );
};

export default InlineEditText;
