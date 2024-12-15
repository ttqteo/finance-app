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
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { z } from "zod";

const formSchema = insertUserSettingsSchema.pick({
  language: true,
  currency: true,
});

type FormValues = z.input<typeof formSchema>;

const SettingsClient = () => {
  const t = useTranslations();
  const router = useRouter();

  const { data, isLoading } = useGetSettings();

  const editMutation = useEditSettings();

  const defaultValues = {
    language: data?.language,
    currency: data?.currency,
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
      <Card className="border-none drop-shadow-sm">
        <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-xl line-clamp-1">
            {t("Common.Page.Header", { key: t("SettingsPage.Header") })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Spinner />
        </CardContent>
        <CardFooter className="text-muted-foreground">
          {t("SettingsPage.Version", { version: appConfig.version })}
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border-none drop-shadow-sm">
      <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
        <CardTitle className="text-xl line-clamp-1">
          {t("Common.Page.Header", { key: t("SettingsPage.Header") })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1">
          <SettingsForm onSubmit={onSubmit} defaultValues={defaultValues} />
        </div>
      </CardContent>
      <CardFooter className="text-muted-foreground">
        {t("SettingsPage.Version", { version: appConfig.version })}
      </CardFooter>
    </Card>
  );
};

export default SettingsClient;
