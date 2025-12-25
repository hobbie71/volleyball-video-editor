import {
  forwardRef,
  useCallback,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type InputHTMLAttributes,
} from "react";
import { Upload } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../libs/cn";

const fileInputVariants = cva(
  "relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-border border-dashed bg-surface hover:border-border-hover hover:bg-surface-hover transition-all duration-200 ",
  {
    variants: {
      variant: {
        default: "",
        primary: "border-info-500",
      },
      size: {
        sm: "min-h-24 p-3 text-sm",
        md: "min-h-32 p-4 text-base",
        lg: "min-h-40 p-6 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface FileInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "onChange">,
    VariantProps<typeof fileInputVariants> {
  /** Callback when file is uploaded successfully */
  onUploadComplete?: (file: File) => void;
  /** Helper text displayed below the input */
  helperText?: string;
  /** Error message to display */
  error?: string;
  /** Custom validator function */
  validator?: (file: File) => string | null;
  /** Custom class for the container */
  containerClassName?: string;
}

const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  (
    {
      className,
      containerClassName,
      variant,
      size,
      onUploadComplete,
      helperText,
      error,
      validator,
      disabled,
      accept,
      ...props
    },
    ref
  ) => {
    const [isDragging, setIsDragging] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    const internalRef = useRef<HTMLInputElement>(null);
    const inputRef = (ref as React.RefObject<HTMLInputElement>) || internalRef;
    const inputId = useId();
    const dragCounterRef = useRef(0);

    const validateFile = useCallback(
      (file: File): string | null => {
        // Check accepted file types
        if (accept) {
          const acceptedTypes = accept.split(",").map((t) => t.trim());
          const fileType = file.type;
          const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();

          const isAccepted = acceptedTypes.some((type) => {
            if (type.startsWith(".")) {
              return fileExtension === type.toLowerCase();
            }
            if (type.endsWith("/*")) {
              return fileType.startsWith(type.replace("/*", "/"));
            }
            return fileType === type;
          });

          if (!isAccepted) {
            return `File type not accepted. Expected: ${accept}`;
          }
        }

        // Custom validator
        if (validator) {
          return validator(file);
        }

        return null;
      },
      [accept, validator]
    );

    const handleFile = useCallback(
      (file: File) => {
        const validationError = validateFile(file);
        if (validationError) {
          setValidationError(validationError);
          return;
        }

        setValidationError(null);
        onUploadComplete?.(file);
      },
      [validateFile, onUploadComplete]
    );

    const handleDragEnter = useCallback(
      (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
          dragCounterRef.current++;
          setIsDragging(true);
        }
      },
      [disabled]
    );

    const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current--;
      if (dragCounterRef.current === 0) {
        setIsDragging(false);
      }
    }, []);

    const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
    }, []);

    const handleDrop = useCallback(
      (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounterRef.current = 0;
        setIsDragging(false);

        if (disabled) return;

        const droppedFiles = Array.from(e.dataTransfer.files);
        if (droppedFiles[0]) {
          handleFile(droppedFiles[0]);
        }
      },
      [disabled, handleFile]
    );

    const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files[0]) {
          handleFile(files[0]);
        }
      },
      [handleFile]
    );

    const handleClick = useCallback(() => {
      if (!disabled) {
        inputRef.current?.click();
      }
    }, [disabled, inputRef]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if ((e.key === "Enter" || e.key === " ") && !disabled) {
          e.preventDefault();
          inputRef.current?.click();
        }
      },
      [disabled, inputRef]
    );

    const displayError = error || validationError;

    return (
      <div className={cn("w-full", containerClassName)}>
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled}
          aria-label="File input"
          className={cn(
            fileInputVariants({ variant, size }),
            isDragging &&
              "scale-[1.02] bg-surface-elevated ring-2 ring-info-500 ring-offset-2",
            disabled && "cursor-not-allowed opacity-50",
            displayError && "border-danger-500 bg-surface",
            className
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleClick}
          onKeyDown={handleKeyDown}>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            className="sr-only"
            onChange={handleChange}
            disabled={disabled}
            accept={accept}
            {...props}
          />

          <Upload
            className={cn(
              "mb-2 h-10 w-10",
              variant === "primary" ? "text-info-500" : "text-text-secondary"
            )}
          />
          <div className="text-center">
            <p className="text-text-tertiary">
              Drag and drop your file here, or{" "}
              <span
                className={cn(
                  "font-semibold",
                  variant === "primary"
                    ? "text-info-500"
                    : "text-text-secondary"
                )}>
                browse
              </span>
            </p>
          </div>
        </div>

        {helperText && !displayError && (
          <p className="mt-2 text-sm text-text-tertiary">{helperText}</p>
        )}

        {displayError && (
          <p className="mt-2 text-sm text-danger-500">{displayError}</p>
        )}
      </div>
    );
  }
);

FileInput.displayName = "FileInput";

export { FileInput };
