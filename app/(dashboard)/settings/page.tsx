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
import { z } from "zod";

const formSchema = insertUserSettingsSchema.pick({
  language: true,
  currency: true,
});

type FormValues = z.input<typeof formSchema>;

const SettingsPage = () => {
  const t = useTranslations();

  const { data, isLoading } = useGetSettings();

  const editMutation = useEditSettings();

  const defaultValues = {
    language: data?.language,
    currency: data?.currency,
  };

  const onSubmit = (values: FormValues) => {
    editMutation.mutate(values);
  };

  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <Card className="border-none drop-shadow-sm">
        <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-xl line-clamp-1">
            {t("Common.Page.Header", { key: "Settings" })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Spinner />
          ) : (
            <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1">
              <SettingsForm onSubmit={onSubmit} defaultValues={defaultValues} />
            </div>
          )}
        </CardContent>
        <CardFooter className="text-muted-foreground">
          {t("SettingsPage.Version", { version: appConfig.version })}
        </CardFooter>
      </Card>
    </div>
  );
};

export default SettingsPage;