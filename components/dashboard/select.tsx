"use client";

import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { SingleValue } from "react-select";
import CreateableSelect from "react-select/creatable";

type Props = {
  onChange: (values?: string) => void;
  onCreate?: (value: string) => void;
  options?: { label: string; value: string }[];
  value?: string | null | undefined;
  disabled?: boolean;
  placeholder?: string;
};

export const Select = ({
  value,
  onChange,
  disabled,
  onCreate,
  options = [],
  placeholder,
}: Props) => {
  const onSelect = (options: SingleValue<{ label: string; value: string }>) => {
    onChange(options?.value);
  };

  const formattedValue = useMemo(() => {
    return options.find((option) => option.value === value);
  }, [options, value]);

  return (
    <CreateableSelect
      placeholder={placeholder}
      className="text-sm h-10"
      classNames={{
        control: ({ isDisabled, isFocused }) =>
          cn(
            "!border !border-input !bg-background !ring-offset-background !cursor-pointer",
            isFocused && "!outline-none !ring-ring !ring-2 !ring-offset-2",
            isDisabled && "!cursor-not-allowed !opacity-50"
          ),
        menu: () => "!border !bg-popover !text-popover-foreground",
        option: ({ isSelected, isFocused, isDisabled }) =>
          cn(
            "!cursor-pointer",
            isSelected && "!bg-secondary",
            isFocused && "!bg-accent !text-accent-foreground",
            isDisabled && "!pointer-events-none !opacity-50"
          ),
        placeholder: () => "!text-muted-foreground",
        singleValue: () => "!text-primary",
      }}
      value={formattedValue}
      onChange={onSelect}
      options={options}
      onCreateOption={onCreate}
      isDisabled={disabled}
    />
  );
};
