import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { insertAccountSchema } from "@/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { TrashIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = insertAccountSchema.pick({
  name: true,
});

type FormValues = z.input<typeof formSchema>;

type Props = {
  id?: string;
  defaultValues?: FormValues;
  onSubmit: (values: FormValues) => void;
  onDelete?: () => void;
  disabled?: boolean;
};
const AccountForm = ({
  id,
  defaultValues,
  onSubmit,
  onDelete,
  disabled,
}: Props) => {
  const t = useTranslations();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const handleSubmit = (values: FormValues) => {
    onSubmit(values);
  };

  const handleDelete = () => {
    onDelete?.();
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 pt-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("AccountsPage.Form.Name")} *</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("AccountsPage.Form.NamePlaceholder")}
                  disabled={disabled}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {t("AccountsPage.Form.NameDesc")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full" disabled={disabled}>
          {id ? t("Common.Action.Save") : t("Common.Action.Create")}
        </Button>
        {!!id && (
          <Button
            disabled={disabled}
            onClick={handleDelete}
            type="button"
            className="w-full"
            variant={"outline"}
          >
            <TrashIcon className="size-4 mr-2" />
            {t("Common.Action.Delete")}
          </Button>
        )}
      </form>
    </Form>
  );
};

export default AccountForm;
