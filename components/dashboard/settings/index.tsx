"use client";

import { Spinner } from "@/components/spinner";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { appConfig } from "@/config/constant";
import { insertUserSettingsSchema } from "@/db/schema";
import { useEditSettings } from "@/features/settings/api/use-edit-settings";
import { useGetSettings } from "@/features/settings/api/use-get-settings";
import SettingsForm from "@/features/settings/components/settings-form";
import { ThemeSetting } from "@/features/settings/components/theme-setting";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { FormPageSkeleton } from "@/components/dashboard/skeletons";

const formSchema = insertUserSettingsSchema.pick({
  language: true,
  currency: true,
  timezone: true,
});

type FormValues = z.input<typeof formSchema>;

const SettingsPage = () => {
  const t = useTranslations();
  const router = useRouter();

  const { data, isLoading } = useGetSettings();

  const editMutation = useEditSettings();

  const defaultValues = {
    language: data?.language,
    currency: data?.currency,
    timezone: data?.timezone,
  };

  const onSubmit = (values: FormValues) => {
    editMutation.mutate(values, {
      onSuccess: () => {
        router.refresh();
      },
    });
  };

  if (isLoading) {
    return (
      <FormPageSkeleton />
    );
  }

  return (
    <Card>
      <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
        <CardTitle className="text-xl line-clamp-1">
          {t("Common.Page.Header", { key: t("SettingsPage.Header") })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1">
          <SettingsForm onSubmit={onSubmit} defaultValues={defaultValues} />
        </div>
        {/* Its own section below the form's Save button, not a field inside
            the form: it applies on click and is stored per device. Same grid
            as the form so the control lines up with the fields above it. */}
        <div className="mt-8 grid grid-cols-1 border-t pt-6 sm:grid-cols-2 md:grid-cols-3">
          <ThemeSetting />
        </div>
      </CardContent>
      <CardFooter className="text-muted-foreground">
        {t("SettingsPage.Version", { version: appConfig.version })}
      </CardFooter>
    </Card>
  );
};

export default SettingsPage;
